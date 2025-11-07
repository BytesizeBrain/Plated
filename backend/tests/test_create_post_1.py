import requests

BASE_URL = "http://localhost:5000/create_post"

files = {
    "image": open("banhMi.jpg", "rb")
}

data = {
    "user_id": "10000000-0000-0000-0000-000000000000",
    "caption": "Delicious Banh Mi"
}

response = requests.post(BASE_URL, files = files, data = data)
# print(response.json())
print("Status code: ", response.status_code)
print("Response text: ", response.text)