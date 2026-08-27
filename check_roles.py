import urllib.request
import json

api_key = 'napi_0g1n3v4dg8wby79m1ts1qtn612shox72l8zpd3xluoik2mn6qdy6zhhggquzsmw0'
project_id = 'young-sound-26013747'

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/branches', headers={'Authorization': f'Bearer {api_key}'})
branches = json.loads(urllib.request.urlopen(req).read())
branch_id = branches['branches'][0]['id']

req = urllib.request.Request(f'https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}/roles', headers={'Authorization': f'Bearer {api_key}'})
roles = json.loads(urllib.request.urlopen(req).read())
for r in roles['roles']:
    print(r['name'])
