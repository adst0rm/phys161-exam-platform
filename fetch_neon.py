import urllib.request
import json
import os

api_key = 'napi_0g1n3v4dg8wby79m1ts1qtn612shox72l8zpd3xluoik2mn6qdy6zhhggquzsmw0'
project_id = 'young-sound-26013747'

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/branches', headers={'Authorization': f'Bearer {api_key}'})
branches = json.loads(urllib.request.urlopen(req).read())
branch_id = branches['branches'][0]['id']

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/endpoints', headers={'Authorization': f'Bearer {api_key}'})
endpoints = json.loads(urllib.request.urlopen(req).read())
endpoint = endpoints['endpoints'][0]
host = endpoint['host']

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}/roles', headers={'Authorization': f'Bearer {api_key}'})
roles = json.loads(urllib.request.urlopen(req).read())
role = roles['roles'][0]['name']

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}/databases', headers={'Authorization': f'Bearer {api_key}'})
databases = json.loads(urllib.request.urlopen(req).read())
db_name = databases['databases'][0]['name']

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}/roles/{role}/reset_password', headers={'Authorization': f'Bearer {api_key}'}, method='POST')
password_data = json.loads(urllib.request.urlopen(req).read())
password = password_data['role']['password']

database_url = f'postgresql://{role}:{password}@{host}/{db_name}?sslmode=require'

print(f'DATABASE_URL={database_url}')

with open('backend/.env', 'w') as f:
    f.write(f'DATABASE_URL="{database_url}"\n')
    f.write(f'NEON_API_KEY="{api_key}"\n')

with open('.env', 'w') as f:
    f.write(f'NEON_API_KEY="{api_key}"\n')
    f.write(f'DATABASE_URL="{database_url}"\n')
