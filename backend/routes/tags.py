# gives frontend real endpoints to list & post recipes and to show tags.
from flask import Blueprint, jsonify
from models.recipe_model import Tag

tags_bp = Blueprint("tags", __name__)

@tags_bp.get("/")
def all_tags():
    tags = Tag.query.order_by(Tag.name).limit(200).all()
    return jsonify([t.name for t in tags]), 200
