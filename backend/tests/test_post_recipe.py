import requests

data ={
    "cuisine":"2Italian",
    "title": "2Lasagna", 
    "description": "2Lasagna--multi-layered pasta",
    "budget": 130,
    "ingredients": ["pasta", "tomato sauce", "cheese"],
    "steps": ["Boil pasta", "One layer of pasta, one layer of sauce", "cheese on top", "bake"],
    "cuisine":"Italian",
    "prepare_time":120
}

response = requests.post("http://localhost:5000/recipes", json=data)

print("Status code:", response.status_code)
print("Raw text: ", response.text)
print(response.json())