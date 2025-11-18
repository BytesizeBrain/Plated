# backend/seed_data.py
import uuid
from extensions import app, db
from models.user_model import User
from models.recipe_model import Recipe, Tag

with app.app_context():
    # ensure tables exist locally/cloud depending on DATABASE_URL
    db.create_all()

    demo_email = "demo@plated.dev"
    user = User.query.filter_by(email=demo_email).first()
    if not user:
        user = User(id=uuid.uuid4(), email=demo_email, username="demo", display_name="Demo User")
        db.session.add(user)
        print("Created demo user")

    # create tags safely
    t1 = Tag.query.filter_by(name="eggplant").first()
    if not t1:
        t1 = Tag(name="eggplant")
        db.session.add(t1)
    t2 = Tag.query.filter_by(name="airfryer").first()
    if not t2:
        t2 = Tag(name="airfryer")
        db.session.add(t2)

    # commit tags & user so IDs exist
    db.session.commit()

    # create recipe
    if not Recipe.query.filter_by(title="Crispy Demo Eggplant").first():
        r = Recipe(title="Crispy Demo Eggplant", blurb="Crispy AF",
                   image_url="https://picsum.photos/seed/egg/1200/800", author_id=user.id, tags=[t1, t2])
        db.session.add(r)
        db.session.commit()
        print("Created demo recipe")

    print("Seeding completed")
