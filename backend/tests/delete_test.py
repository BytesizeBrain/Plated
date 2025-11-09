import requests

BASE_URL = "http://127.0.0.1:5000/posts/"
post_id = "927a8655-b371-4a34-8823-4be22807cad2"

res = requests.delete(BASE_URL + post_id)
print("Delete status: ", res.status_code)
print("Delete response: ", res.json())
print("Finished deleting post.")