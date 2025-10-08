"""
Unit Tests for User Routes - Assignment 6
Danny Tran
Purpose: Test the /api/user/check_username endpoint for various scenarios

Feature testing: username availability check (since only user authentication feature had been worked on by this point)
Goal: Practice building test-cases for API endpoints using pytest and Flask test client

"""

# Using pytest - equivalent to Java JUnit tests
import pytest
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import app, db
from models.user_model import User


@pytest.fixture
def client():
    """
    Setup test client with in-memory database
    
    IMPORTANT: Only register blueprint if not already registered!
    """
    # Import the blueprint
    from routes.user_routes import users_bp
    
    # Only register if not already registered
    if 'users' not in app.blueprints:
        app.register_blueprint(users_bp)
    
    # Configure app for testing
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()


def test_check_username_available(client):
    """
    Test Case 1: Available username returns exists=False
    
    Purpose: Verifies the endpoint correctly identifies available usernames
    Expected: HTTP 200 with {"exists": false}
    """
    response = client.get('/api/user/check_username?username=newuser123')
    
    # Assert response is successful
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    assert response.json is not None, "Response should contain JSON data"
    assert 'exists' in response.json, "Response should have 'exists' field"
    assert response.json['exists'] == False, "New username should be available"
    
    print("✓ Test 1 PASSED: Available username correctly identified")


def test_check_username_taken(client):
    """
    Test Case 2: Taken username returns exists=True
    
    Purpose: Verifies the endpoint correctly identifies existing usernames
    Expected: HTTP 200 with {"exists": true}
    """
    # Setup: Create a test user in the database
    with app.app_context():
        test_user = User(
            id='test-uuid-12345',
            email='testuser@example.com',
            username='takenuser',
            display_name='Test User',
            profile_pic='https://example.com/default.jpg'
        )
        db.session.add(test_user)
        db.session.commit()
    
    # Act: Check if the username is taken
    response = client.get('/api/user/check_username?username=takenuser')
    
    # Assert: Verify username shows as taken
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
    assert response.json is not None, "Response should contain JSON data"
    assert 'exists' in response.json, "Response should have 'exists' field"
    assert response.json['exists'] == True, "Existing username should show as taken"
    
    print("✓ Test 2 PASSED: Taken username correctly identified")


def test_check_username_missing_parameter(client):
    """
    Test Case 3: Missing parameter returns 400 error
    
    Purpose: Verifies the endpoint handles invalid requests gracefully
    Expected: HTTP 400 with error message
    """
    # Act: Make request without username parameter
    response = client.get('/api/user/check_username')
    
    # Assert: Verify proper error response
    assert response.status_code == 400, f"Expected 400 Bad Request, got {response.status_code}"
    assert response.json is not None, "Error response should contain JSON"
    assert 'error' in response.json, "Error response should have 'error' field"
    
    print("✓ Test 3 PASSED: Missing parameter error handled correctly")


# Allow running tests directly with: python test_user_routes.py
if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])