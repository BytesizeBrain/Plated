import pytest
from flask import url_for
from extensions import app, db
from models.user_model import User

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def create_user(username, email="test@example.com", id=None):
    user = User(
        id=id or str(len(User.query.all()) + 1),
        email=email,
        username=username,
        display_name=username,
        profile_pic=""
    )
    db.session.add(user)
    db.session.commit()
    return user

def test_missing_username_param(client):
    res = client.get("/api/user/check_username")
    assert res.status_code == 400
    assert res.get_json()["error"] == "Username parameter is required"

def test_username_not_exists(client):
    res = client.get("/api/user/check_username?username=notused")
    assert res.status_code == 200
    assert res.get_json()["exists"] is False

def test_username_exists(client):
    create_user("existinguser")
    res = client.get("/api/user/check_username?username=existinguser")
    assert res.status_code == 200
    assert res.get_json()["exists"] is True

def test_username_case_sensitive(client):
    create_user("CaseUser")
    res = client.get("/api/user/check_username?username=caseuser")
    assert res.status_code == 200
    # Should be False if username check is case-sensitive
    assert res.get_json()["exists"] is False
    res2 = client.get("/api/user/check_username?username=CaseUser")
    assert res2.status_code == 200
    assert res2.get_json()["exists"] is True

def test_username_with_special_chars(client):
    create_user("user.name-123_")
    res = client.get("/api/user/check_username?username=user.name-123_")
    assert res.status_code == 200
    assert res.get_json()["exists"] is True

def test_username_with_spaces(client):
    create_user("user with space")
    res = client.get("/api/user/check_username?username=user%20with%20space")
    assert res.status_code == 200
    assert res.get_json()["exists"] is True
