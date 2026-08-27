import psycopg2

DATABASE_URL = "postgresql://authenticator:npg_w8vMqnyNJ5gE@ep-patient-field-aev1rcv3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("SELECT 1;")
    print("Success pooler:", cursor.fetchone())
    conn.close()
except Exception as e:
    print("Error:", e)
