# backend/list_routes.py
from app import app  # this imports the Flask app and registers blueprints

print("Registered routes:")
for rule in app.url_map.iter_rules():
    methods = ",".join(sorted(m for m in rule.methods if m not in ("HEAD", "OPTIONS")))
    print(f"{methods:15}  {rule.rule}")
