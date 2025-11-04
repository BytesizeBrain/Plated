import requests

BASE_URL = "http://localhost:5000/upload"

file_path = "broken_rice.png"

files={
    "image": open(file_path, "rb")
}

response = requests.post(BASE_URL, files = files)

print("Status code: ", response.status_code)

try:
    print("Response JSON:", response.json())
except Exception as e:
    print("Response Text", response.text)
    print("Error decoding JSON: ", e)

