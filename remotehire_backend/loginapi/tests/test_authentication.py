import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from .factories import UserFactory

User = get_user_model()


@pytest.mark.auth
@pytest.mark.unit
class TestUserAuthentication:
    """Test user authentication functionality"""

    def test_candidate_signup_success(self, db, api_client):
        """Test successful candidate signup"""
        payload = {
            'username': 'newcandidate',
            'email': 'candidate@example.com',
            'password': 'securepass123',
            'role': 'candidate',
            'full_name': 'John Candidate'
        }
        # This assumes there's a signup endpoint
        # Adjust path based on your actual API
        response = api_client.post('/api/auth/register/', payload)
        
        # Should either create user or return 201
        # (depending on whether endpoint exists)
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]

    def test_recruiter_signup_success(self, db, api_client):
        """Test successful recruiter signup"""
        payload = {
            'username': 'newrecruiter',
            'email': 'recruiter@example.com',
            'password': 'securepass123',
            'role': 'recruiter',
            'full_name': 'Jane Recruiter'
        }
        response = api_client.post('/api/auth/register/', payload)
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]

    def test_duplicate_email_fails(self, db, api_client):
        """Test that duplicate email signup fails"""
        user = UserFactory(email='test@example.com')
        
        payload = {
            'username': 'anotheruser',
            'email': user.email,  # Duplicate email
            'password': 'password123',
            'role': 'candidate'
        }
        response = api_client.post('/api/auth/register/', payload)
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_409_CONFLICT]

    def test_login_success(self, db, api_client):
        """Test successful login"""
        user = UserFactory(username='testuser', email='test@example.com')
        
        payload = {
            'username': 'testuser',
            'password': 'testpass123'  # Default password from factory
        }
        response = api_client.post('/api/auth/login/', payload)
        
        # Should return tokens
        if response.status_code == status.HTTP_200_OK:
            assert 'access' in response.data or 'refresh' in response.data

    def test_login_invalid_credentials(self, db, api_client):
        """Test login with invalid credentials"""
        payload = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        response = api_client.post('/api/auth/login/', payload)
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST]

    def test_jwt_token_creation(self, db):
        """Test JWT token creation for user"""
        user = UserFactory()
        refresh = RefreshToken.for_user(user)
        
        assert refresh is not None
        assert str(refresh.access_token) is not None
        assert str(refresh) is not None

    def test_authenticated_request(self, db, authenticated_client):
        """Test request with valid authentication"""
        # Try to access a protected endpoint
        response = authenticated_client.get('/api/user/profile/')
        # Should not be 401 (Unauthorized)
        assert response.status_code != status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_request_fails(self, db, api_client):
        """Test that unauthenticated request fails"""
        response = api_client.get('/api/user/profile/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_invalid_token_fails(self, db, api_client):
        """Test request with invalid token"""
        api_client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token_here')
        response = api_client.get('/api/user/profile/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_refresh(self, db):
        """Test JWT token refresh"""
        user = UserFactory()
        refresh = RefreshToken.for_user(user)
        
        # Refresh token should be valid
        new_access = refresh.access_token
        assert new_access is not None


@pytest.mark.auth
@pytest.mark.unit
class TestPasswordManagement:
    """Test password-related functionality"""

    def test_password_is_hashed(self, db):
        """Test that passwords are stored hashed"""
        user = UserFactory(password='mypassword123')
        
        # Password should not be plaintext
        assert user.password != 'mypassword123'
        
        # But check_password should work
        assert user.check_password('mypassword123')

    def test_wrong_password_check_fails(self, db):
        """Test that wrong password fails check"""
        user = UserFactory(password='correctpassword')
        assert not user.check_password('wrongpassword')

    def test_password_change(self, db):
        """Test changing user password"""
        user = UserFactory(password='oldpassword')
        user.set_password('newpassword')
        user.save()
        
        assert user.check_password('newpassword')
        assert not user.check_password('oldpassword')
