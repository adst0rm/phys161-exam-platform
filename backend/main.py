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
from moodle_grading import grade_problem

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


@app.get("/api/exam/seed")
def seed_db_endpoint():
    from seed import seed_database
    try:
        seed_database()
        return {"status": "success", "message": "Database seeded successfully!"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    import urllib.parse
    db_url = os.getenv("DATABASE_URL", "")
    parsed = urllib.parse.urlparse(db_url)
    return {
        "status": "ok",
        "db_user": parsed.username,
        "db_pass": parsed.password,
        "db_host": parsed.hostname
    }


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

    problems_out = [
        ProblemOut(
            problem_id=p.problem_id,
            topic=p.topic,
            problem_text=p.problem_text,
            requires_unit=bool(p.unit and p.unit.strip()),
            image_file=p.image_file,
        )
        for p in problems
    ]

    return ExamSession(
        exam_id=exam_id,
        problems=problems_out
    )


@app.post("/api/exam/{exam_id}/submit", response_model=ExamResult)
def submit_exam(exam_id: str, submission: ExamSubmission, db: Session = Depends(get_db)):
    """Grade a submitted exam using Moodle Formulas question 90%/10% scoring."""
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
    answer_map = {a.problem_id: a for a in submission.answers}

    results = []
    total_score = 0.0

    for pid in problem_ids:
        p = problem_map.get(pid)
        if not p:
            continue

        ans = answer_map.get(pid)
        raw_val = str(ans.submitted_value).strip() if ans and ans.submitted_value is not None else None
        raw_unit = str(ans.submitted_unit).strip() if ans and ans.submitted_unit is not None else None
        was_answered = bool(raw_val or raw_unit)

        grade = grade_problem(
            submitted_value_raw=raw_val,
            submitted_unit_raw=raw_unit,
            expected_value=p.correct_value,
            expected_unit_str=p.unit,
            tolerance=GRADING_TOLERANCE,
        )

        total_score += grade.mark

        results.append(ProblemResult(
            problem_id=p.problem_id,
            topic=p.topic,
            problem_text=p.problem_text,
            unit=p.unit,
            image_file=p.image_file,
            submitted_value=raw_val,
            submitted_unit=raw_unit,
            correct_value=p.correct_value,
            mark=round(grade.mark, 2),
            max_mark=grade.max_mark,
            is_correct=grade.is_correct,
            number_correct=grade.number_correct,
            unit_correct=grade.unit_correct,
            was_answered=was_answered,
            feedback=grade.feedback,
        ))

    total = len(problem_ids)
    # Clean up session
    del exam_sessions[exam_id]

    return ExamResult(
        exam_id=exam_id,
        score=round(total_score, 2),
        total=total,
        percentage=round((total_score / total) * 100, 2) if total > 0 else 0,
        results=results,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
