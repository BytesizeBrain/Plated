import requests

data ={
    "cuisine":"Italian",
    "title": "Lasagna", 
    "description": "Lasagna--multi-layered pasta",
    "budget": 30,
    "ingredients": ["pasta", "tomato sauce", "cheese"],
    "steps": ["Boil pasta", "One layer of pasta, one layer of sauce", "cheese on top", "bake"],
    "cuisine":"Italian",
    "prepare_time":20
}

response = requests.post("http://localhost:5000/recipes", json=data)

print("Status code:", response.status_code)
print("Raw text: ", response.text)
print(response.json())