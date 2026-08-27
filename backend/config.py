"""Application configuration."""
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Adil2008%23@localhost:5432/phys161"
)

# CORS origins allowed to call the API
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Number of problems per exam
EXAM_SIZE = 7

# Relative error tolerance for grading (1%)
GRADING_TOLERANCE = 0.01
