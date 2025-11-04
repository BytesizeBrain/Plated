import requests

data ={
    "cuisine":"American",
    "title": "Hamburger", 
    "description": "Hamburger--multi-layered meet",
    "budget": 10,
    "ingredients": ["buns", "meat", "cheese"],
    "steps": ["Cook meat", "Two layers of meat and cheese", "serve"],
    "prepare_time":20
}

response = requests.post("http://localhost:5000/recipes", json=data)

print("Status code:", response.status_code)
print("Raw text: ", response.text)
print(response.json())