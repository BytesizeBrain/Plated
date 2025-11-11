import requests

BASE_URL = "http://127.0.0.1:5000/posts/"
post_id = "5a004a06-7fd7-46c2-8d4f-55a7b2507a85"

res = requests.delete(BASE_URL + post_id)
print("Delete status: ", res.status_code)
print("Delete response: ", res.json())
print("Finished deleting post.")