import pytest
import json
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_headers():
    return {'Authorization': 'Bearer mock_token'}

def test_like_post_success(client, auth_headers):
    """Test liking a post"""
    payload = {'post_id': 'test-post-uuid'}

    response = client.post('/api/posts/like',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 201
    data = response.get_json()
    assert data['liked'] == True

def test_unlike_post_success(client, auth_headers):
    """Test unliking a post"""
    payload = {'post_id': 'test-post-uuid'}

    response = client.delete('/api/posts/like',
                            data=json.dumps(payload),
                            headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 200
    data = response.get_json()
    assert data['liked'] == False

def test_get_post_likes_count(client):
    """Test getting likes count for a post"""
    response = client.get('/api/posts/test-post-uuid/likes')

    assert response.status_code == 200
    data = response.get_json()
    assert 'count' in data
    assert isinstance(data['count'], int)

def test_check_user_liked_post(client, auth_headers):
    """Test checking if user liked a post"""
    response = client.get('/api/posts/test-post-uuid/liked',
                         headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert 'liked' in data
    assert isinstance(data['liked'], bool)

def test_create_comment_success(client, auth_headers):
    """Test creating a comment"""
    payload = {
        'post_id': 'test-post-uuid',
        'content': 'This looks delicious!'
    }

    response = client.post('/api/posts/comments',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 201
    data = response.get_json()
    assert data['content'] == 'This looks delicious!'
    assert 'id' in data

def test_get_post_comments(client):
    """Test getting comments for a post"""
    response = client.get('/api/posts/test-post-uuid/comments')

    assert response.status_code == 200
    data = response.get_json()
    assert 'comments' in data
    assert isinstance(data['comments'], list)

def test_delete_comment_success(client, auth_headers):
    """Test deleting a comment"""
    response = client.delete('/api/posts/comments/comment-uuid',
                            headers=auth_headers)

    assert response.status_code == 200
