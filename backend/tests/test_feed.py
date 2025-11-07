import requests

BASE_URL = "http://localhost:5000/feed?page=1&per_page=10"
res = requests.get(BASE_URL)
print("Status", res.status_code)
print(res.json())
