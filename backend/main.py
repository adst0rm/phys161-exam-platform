"""FastAPI application - PHYS 161 Exam Platform API."""
import uuid
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from config import CORS_ORIGINS, EXAM_SIZE, GRADING_TOLERANCE
from database import get_db, engine, Base
from models import Problem
from schemas import (
    ProblemOut, ExamSession, ExamSubmission, ExamResult, ProblemResult
)

# Create tables on startup
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="PHYS 161 Exam Platform", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for active exam sessions
# Maps exam_id -> list of problem_ids
exam_sessions: dict[str, list[str]] = {}


def is_correct(submitted: float, expected: float) -> bool:
    """Check if submitted value is within 1% relative error of expected."""
    if expected == 0:
        return abs(submitted) < 1e-9
    return abs((submitted - expected) / expected) <= GRADING_TOLERANCE


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/exam/start", response_model=ExamSession)
def start_exam(db: Session = Depends(get_db)):
    """Start a new exam by selecting 7 random problems."""
    problems = (
        db.query(Problem)
        .order_by(func.random())
        .limit(EXAM_SIZE)
        .all()
    )

    if len(problems) < EXAM_SIZE:
        raise HTTPException(
            status_code=500,
            detail=f"Not enough problems in database. Found {len(problems)}, need {EXAM_SIZE}."
        )

    exam_id = str(uuid.uuid4())
    exam_sessions[exam_id] = [p.problem_id for p in problems]

    return ExamSession(
        exam_id=exam_id,
        problems=[ProblemOut.model_validate(p) for p in problems]
    )


@app.post("/api/exam/{exam_id}/submit", response_model=ExamResult)
def submit_exam(exam_id: str, submission: ExamSubmission, db: Session = Depends(get_db)):
    """Grade a submitted exam."""
    if exam_id not in exam_sessions:
        raise HTTPException(status_code=404, detail="Exam session not found.")

    problem_ids = exam_sessions[exam_id]

    # Fetch all problems for this exam from DB
    problems = (
        db.query(Problem)
        .filter(Problem.problem_id.in_(problem_ids))
        .all()
    )
    problem_map = {p.problem_id: p for p in problems}

    # Build answer lookup
    answer_map = {a.problem_id: a.submitted_value for a in submission.answers}

    results = []
    score = 0
    for pid in problem_ids:
        p = problem_map.get(pid)
        if not p:
            continue

        submitted = answer_map.get(pid)
        was_answered = submitted is not None
        correct = False
        if was_answered:
            correct = is_correct(submitted, p.correct_value)
            if correct:
                score += 1

        results.append(ProblemResult(
            problem_id=p.problem_id,
            topic=p.topic,
            problem_text=p.problem_text,
            unit=p.unit,
            image_file=p.image_file,
            submitted_value=submitted,
            correct_value=p.correct_value,
            is_correct=correct,
            was_answered=was_answered,
        ))

    total = len(problem_ids)
    # Clean up session
    del exam_sessions[exam_id]

    return ExamResult(
        exam_id=exam_id,
        score=score,
        total=total,
        percentage=round((score / total) * 100, 2) if total > 0 else 0,
        results=results,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


