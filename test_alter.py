import urllib.request
import json

def test_password(current_pwd, candidate_pwd):
    url = 'https://ep-patient-field-aev1rcv3.c-2.us-east-2.aws.neon.tech/sql'
    headers = {
        'Neon-Connection-String': f'postgresql://neondb_owner:{current_pwd}@ep-patient-field-aev1rcv3.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require',
        'Content-Type': 'application/json'
    }
    sql = f"ALTER ROLE neondb_owner WITH PASSWORD '{candidate_pwd}';"
    data = json.dumps({'query': sql}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    res = urllib.request.urlopen(req)
    print("Set password to:", candidate_pwd, res.read().decode())

test_password("npg_NxcuiygAbq38", "npg_w8vMqnyNJ5gE")
