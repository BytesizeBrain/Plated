import requests

data = {
    "user_id": "00000000-0000-0000-0000-000000000001",
    "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "description": "Steak Salad"
}
res = requests.post("http://localhost:5000/posts", json=data)
print(res.status_code)
print("Able to post")
print(res.json())