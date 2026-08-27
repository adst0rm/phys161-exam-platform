import os
import time
import psycopg2

DATABASE_URL = "postgresql://authenticator:npg_w8vMqnyNJ5gE@ep-patient-field-aev1rcv3.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-patient-field-aev1rcv3"

for i in range(5):
    try:
        print(f"Attempt {i+1}...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
        tables = cursor.fetchall()
        print("Tables:", tables)
        conn.close()
        break
    except Exception as e:
        print("Error:", e)
        time.sleep(2)
