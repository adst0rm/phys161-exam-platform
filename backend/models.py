"""SQLAlchemy ORM models."""
from sqlalchemy import Column, Integer, String, Float, Text

from database import Base


class Problem(Base):
    """A single physics exam problem."""
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, autoincrement=True)
    problem_id = Column(String(10), unique=True, nullable=False, index=True)
    topic = Column(String(100), nullable=False)
    problem_text = Column(Text, nullable=False)
    correct_value = Column(Float, nullable=False)
    unit = Column(String(30), nullable=True)
    image_file = Column(String(100), nullable=True)
