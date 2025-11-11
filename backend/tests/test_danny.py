import requests

BASE_URL = "http://localhost:5000/create_post"

files = {
    "image": open("durian.jpg", "rb")
}

data = {
    "user_id": "00000000-0000-0000-0000-000000000001",
    "caption": "Yummy Banh Cuon"
}

response = requests.post(BASE_URL, files = files, data = data)
# print(response.json())
print("Status code: ", response.status_code)
print("Response text: ", response.text)