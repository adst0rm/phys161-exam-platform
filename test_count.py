import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("backend/.env")
DATABASE_URL = os.environ.get("DATABASE_URL")

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM problems;")
    print("Problems count locally:", cursor.fetchone()[0])
    conn.close()
except Exception as e:
    print("Error:", e)
