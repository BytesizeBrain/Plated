import pytest
import json
from app import app
from supabase_client import supabase

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_headers():
    # Mock JWT token for testing
    return {'Authorization': 'Bearer mock_token_user_123'}

def test_create_simple_post_success(client, auth_headers):
    """Test creating a simple post with image and caption"""
    payload = {
        'post_type': 'simple',
        'caption': 'Delicious homemade pasta!',
        'image_url': 'https://example.com/pasta.jpg'
    }

    response = client.post('/api/posts/create',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 201
    data = response.get_json()
    assert data['post_type'] == 'simple'
    assert data['caption'] == 'Delicious homemade pasta!'
    assert 'id' in data

def test_create_recipe_post_success(client, auth_headers):
    """Test creating a recipe post with full details"""
    payload = {
        'post_type': 'recipe',
        'caption': 'My famous chicken alfredo',
        'image_url': 'https://example.com/alfredo.jpg',
        'recipe_data': {
            'title': 'Chicken Alfredo',
            'prep_time': 15,
            'cook_time': 30,
            'servings': 4,
            'difficulty': 'medium',
            'cuisine': 'Italian',
            'ingredients': [
                {'item': 'chicken breast', 'amount': '2', 'unit': 'lbs'},
                {'item': 'fettuccine', 'amount': '1', 'unit': 'lb'}
            ],
            'instructions': [
                'Season chicken with salt and pepper',
                'Cook pasta according to package directions'
            ],
            'tags': ['dinner', 'italian']
        }
    }

    response = client.post('/api/posts/create',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 201
    data = response.get_json()
    assert data['post_type'] == 'recipe'
    assert data['recipe_data']['title'] == 'Chicken Alfredo'
    assert len(data['recipe_data']['ingredients']) == 2

def test_create_recipe_post_missing_required_fields(client, auth_headers):
    """Test validation for recipe posts"""
    payload = {
        'post_type': 'recipe',
        'image_url': 'https://example.com/food.jpg',
        'recipe_data': {
            'title': 'Incomplete Recipe'
            # missing ingredients and instructions
        }
    }

    response = client.post('/api/posts/create',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 400
