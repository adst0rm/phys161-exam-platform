import urllib.request
import json

api_key = 'napi_0g1n3v4dg8wby79m1ts1qtn612shox72l8zpd3xluoik2mn6qdy6zhhggquzsmw0'
project_id = 'young-sound-26013747'

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/branches', headers={'Authorization': f'Bearer {api_key}'})
branches = json.loads(urllib.request.urlopen(req).read())
branch_id = branches['branches'][0]['id']

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/endpoints', headers={'Authorization': f'Bearer {api_key}'})
endpoints = json.loads(urllib.request.urlopen(req).read())
host = endpoints['endpoints'][0]['host']

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}/roles/neondb_owner/reset_password', headers={'Authorization': f'Bearer {api_key}'}, method='POST')
password_data = json.loads(urllib.request.urlopen(req).read())
password = password_data['role']['password']

database_url = f'postgresql://neondb_owner:{password}@{host}/neondb?sslmode=require'
print(f'NEW_DATABASE_URL={database_url}')
