"""Pydantic schemas for API request/response models."""
from typing import Optional
from pydantic import BaseModel


class ProblemOut(BaseModel):
    """A problem as seen by the student - no correct answer included."""
    problem_id: str
    topic: str
    problem_text: str
    unit: Optional[str] = None
    image_file: Optional[str] = None

    model_config = {"from_attributes": True}


class ExamSession(BaseModel):
    """The payload returned when a new exam is started."""
    exam_id: str
    problems: list[ProblemOut]


class AnswerSubmission(BaseModel):
    """A single answer submitted by the student."""
    problem_id: str
    submitted_value: Optional[float] = None


class ExamSubmission(BaseModel):
    """All answers for an exam."""
    answers: list[AnswerSubmission]


class ProblemResult(BaseModel):
    """Grading result for a single problem."""
    problem_id: str
    topic: str
    problem_text: str
    unit: Optional[str] = None
    image_file: Optional[str] = None
    submitted_value: Optional[float] = None
    correct_value: float
    is_correct: bool
    was_answered: bool


class ExamResult(BaseModel):
    """Full exam grading results."""
    exam_id: str
    score: int
    total: int
    percentage: float
    results: list[ProblemResult]
