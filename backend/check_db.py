# backend/check_db.py
import os
from extensions import app, db

print("ENV DATABASE_URL:", os.getenv("DATABASE_URL"))

with app.app_context():
    print("SQLALCHEMY_DATABASE_URI:", app.config.get("SQLALCHEMY_DATABASE_URI"))
    # db.engine.url is safe to read without an app context too, but show it here for clarity
    print("Engine URL:", str(db.engine.url))
