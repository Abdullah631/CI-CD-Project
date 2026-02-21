import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from loginapi.models import Job, Application, Interview

User = get_user_model()

@pytest.fixture
def api_client():
    """Fixture for API client"""
    return APIClient()

@pytest.fixture
def authenticated_user(db):
    """Create and return an authenticated user"""
    from loginapi.tests.factories import UserFactory
    user = UserFactory(role='candidate')
    return user

@pytest.fixture
def authenticated_recruiter(db):
    """Create and return an authenticated recruiter"""
    from loginapi.tests.factories import UserFactory
    recruiter = UserFactory(role='recruiter')
    return recruiter

@pytest.fixture
def authenticated_client(api_client, authenticated_user):
    """API client with authenticated user"""
    refresh = RefreshToken.for_user(authenticated_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client

@pytest.fixture
def recruiter_client(api_client, authenticated_recruiter):
    """API client with authenticated recruiter"""
    refresh = RefreshToken.for_user(authenticated_recruiter)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client

@pytest.fixture
def sample_job(db, authenticated_recruiter):
    """Create a sample job posting"""
    from loginapi.tests.factories import JobFactory
    return JobFactory(posted_by=authenticated_recruiter)

@pytest.fixture
def sample_application(db, authenticated_user, sample_job):
    """Create a sample application"""
    from loginapi.tests.factories import ApplicationFactory
    return ApplicationFactory(
        applicant=authenticated_user,
        job=sample_job
    )

@pytest.fixture
def sample_interview(db, authenticated_user, sample_job):
    """Create a sample interview"""
    from loginapi.tests.factories import InterviewFactory
    return InterviewFactory(
        candidate=authenticated_user,
        job=sample_job
    )

@pytest.fixture
def candidate_user(db):
    """Create a candidate user"""
    from loginapi.tests.factories import UserFactory
    return UserFactory(role='candidate')

@pytest.fixture
def recruiter_user(db):
    """Create a recruiter user"""
    from loginapi.tests.factories import UserFactory
    return UserFactory(role='recruiter')
@pytest.fixture
def get_auth_token():
    """Generate JWT token for any user"""
    def _get_token(user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)
    return _get_token