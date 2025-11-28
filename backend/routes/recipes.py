from flask import Blueprint, request, jsonify, g
from extensions import db
from models.recipe_model import Recipe, Tag
from models.user_model import User
from routes.user_routes import jwt_required

recipes_bp = Blueprint("recipes", __name__)

@recipes_bp.get("/")
def list_recipes():
    q = request.args.get("q", "").strip()
    tag = request.args.get("tag")
    query = Recipe.query
    if q:
        query = query.filter(Recipe.title.ilike(f"%{q}%"))
    if tag:
        query = query.join(Recipe.tags).filter(Tag.name == tag)
    rows = query.order_by(Recipe.created_at.desc()).limit(50).all()
    return jsonify([r.to_dict() for r in rows]), 200

@recipes_bp.post("/")
@jwt_required
def create_recipe():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error":"title required"}), 400
    me = User.query.filter_by(email=g.jwt["email"]).first()
    if not me:
        return jsonify({"error":"user not found"}), 404
    tag_names = data.get("tags") or []
    tag_objs = []
    for n in tag_names:
        name = n.strip().lower()
        if not name: continue
        t = Tag.query.filter_by(name=name).first()
        if not t:
            t = Tag(name=name)
            db.session.add(t)
        tag_objs.append(t)
    recipe = Recipe(title=title, blurb=data.get("blurb"), image_url=data.get("image_url"), author_id=me.id, tags=tag_objs)
    db.session.add(recipe)
    db.session.commit()
    return jsonify(recipe.to_dict()), 201
