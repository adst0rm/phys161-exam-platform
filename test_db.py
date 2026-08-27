import os
import psycopg2

DATABASE_URL = "postgresql://authenticator:npg_w8vMqnyNJ5gE@ep-patient-field-aev1rcv3.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-patient-field-aev1rcv3"
try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM problems;")
    print("Problems count (direct):", cursor.fetchone()[0])
    conn.close()
except Exception as e:
    print("Error:", e)

