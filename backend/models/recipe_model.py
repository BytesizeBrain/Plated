import uuid
from extensions import db

recipe_tags = db.Table(
    "recipe_tags",
    db.Column("recipe_id", db.Uuid(), db.ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id",    db.Uuid(), db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class Recipe(db.Model):
    __tablename__ = "recipes"
    id = db.Column(db.Uuid(), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(255), nullable=False)
    blurb = db.Column(db.Text)
    image_url = db.Column(db.String(1000))
    author_id = db.Column(db.Uuid(), db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    tags = db.relationship("Tag", secondary=recipe_tags, lazy="joined")

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "blurb": self.blurb,
            "image_url": self.image_url,
            "author_id": str(self.author_id),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "tags": [t.name for t in self.tags],
        }

class Tag(db.Model):
    __tablename__ = "tags"
    id = db.Column(db.Uuid(), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), unique=True, nullable=False)
