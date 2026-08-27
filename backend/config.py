"""Application configuration."""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Adil2008%23@localhost:5432/phys161"
)

# CORS origins allowed to call the API
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Number of problems per exam
EXAM_SIZE = 7

# Relative error tolerance for grading (1%)
GRADING_TOLERANCE = 0.01

