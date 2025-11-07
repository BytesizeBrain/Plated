import requests

BASE_URL = "http://127.0.0.1:5000/feed"

params = {
    "page":2,
    "per_page": 5
}

try:
    response = requests.get(BASE_URL, params = params)

    print("Successful loading posts to feed")
    print("Status code: ", response.status_code)
    print("Response JSON: ")
    print(response.json())

    print("End of page.")
except Exception as e:
    print("Error: ", e)
