
from extensions import db

followers = db.Table(
    'followers',
    db.Column('follower_id', db.Uuid(), db.ForeignKey('user.id'), primary_key=True),
    db.Column('followed_id', db.Uuid(), db.ForeignKey('user.id'), primary_key=True)
)

follow_requests = db.Table(
    'follow_requests',
    db.Column('requester_id', db.Uuid(), db.ForeignKey('user.id'), primary_key=True),
    db.Column('target_id', db.Uuid(), db.ForeignKey('user.id'), primary_key=True),
    db.Column('created_at', db.DateTime(timezone=True), server_default=db.func.now()),
)

class User(db.Model):
    # Define the User model
    # No init method as this is a SQLAlchemy model
    id = db.Column(db.Uuid(), primary_key=True, unique=True, nullable=False)
    email = db.Column(db.String(128), nullable=False)
    username = db.Column(db.String(64), unique=True, nullable=False)
    display_name = db.Column(db.String(64), nullable=False)
    profile_pic = db.Column(db.String(256), nullable=False, default="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")

    # Self-referential many-to-many for followers/following
    followers = db.relationship(
        'User',
        secondary=followers,
        primaryjoin=(followers.c.followed_id == id),
        secondaryjoin=(followers.c.follower_id == id),
        backref=db.backref('following', lazy='dynamic'),
        lazy='dynamic'
    )

    sent_requests = db.relationship(
        'User',
        secondary=follow_requests,
        primaryjoin=(follow_requests.c.requester_id == id),
        secondaryjoin=(follow_requests.c.target_id == id),
        backref=db.backref('received_requests', lazy='dynamic'),
        lazy='dynamic'
    )

