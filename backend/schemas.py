"""Pydantic schemas for API request/response models."""
from typing import Optional, Union
from pydantic import BaseModel


class ProblemOut(BaseModel):
    """A problem as seen by the student - no correct answer or unit included."""
    problem_id: str
    topic: str
    problem_text: str
    requires_unit: bool = False
    image_file: Optional[str] = None

    model_config = {"from_attributes": True}


class ExamSession(BaseModel):
    """The payload returned when a new exam is started."""
    exam_id: str
    problems: list[ProblemOut]


class AnswerSubmission(BaseModel):
    """A single answer submitted by the student."""
    problem_id: str
    submitted_value: Optional[Union[str, float]] = None
    submitted_unit: Optional[str] = None


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
    submitted_value: Optional[str] = None
    submitted_unit: Optional[str] = None
    correct_value: float
    mark: float
    max_mark: float = 1.00
    is_correct: bool
    number_correct: bool
    unit_correct: bool
    was_answered: bool
    feedback: Optional[str] = None


class ExamResult(BaseModel):
    """Full exam grading results."""
    exam_id: str
    score: float
    total: int
    percentage: float
    results: list[ProblemResult]
