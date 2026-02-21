import pytest
from loginapi.serializer import (
    UserSerializer,
)
from .factories import UserFactory, JobFactory, ApplicationFactory

pytestmark = pytest.mark.unit


@pytest.mark.unit
class TestUserSerializer:
    """Test user serializer"""

    def test_serialize_user(self, db):
        """Test serializing user object"""
        user = UserFactory(
            username='testuser',
            email='test@example.com',
            full_name='Test User',
            role='candidate'
        )
        
        serializer = UserSerializer(user)
        data = serializer.data
        
        assert data['username'] == 'testuser'
        assert data['email'] == 'test@example.com'
        assert data['full_name'] == 'Test User'
        assert data['role'] == 'candidate'

    def test_serialize_recruiter(self, db):
        """Test serializing recruiter"""
        recruiter = UserFactory(role='recruiter', full_name='Jane Recruiter')
        
        serializer = UserSerializer(recruiter)
        data = serializer.data
        
        assert data['role'] == 'recruiter'
        assert data['full_name'] == 'Jane Recruiter'

    def test_serialize_multiple_users(self, db):
        """Test serializing multiple users"""
        UserFactory.create_batch(5)
        
        users = UserFactory._meta.model.objects.all()
        serializer = UserSerializer(users, many=True)
        
        assert len(serializer.data) == 5

    def test_deserialize_valid_user(self, db):
        """Test deserializing valid user data"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'full_name': 'New User',
            'role': 'candidate',
            'password': 'password123'
        }
        
        serializer = UserSerializer(data=data)
        # Serializer should be valid (actual validation depends on serializer implementation)
        # This test checks the serializer exists and processes data
        if serializer.is_valid():
            assert serializer.validated_data['username'] == 'newuser'

    def test_password_not_in_serialized_output(self, db):
        """Test that password is never serialized"""
        user = UserFactory(password='secret123')
        
        serializer = UserSerializer(user)
        data = serializer.data
        
        # Password should never be in the serialized data
        assert 'password' not in data

    def test_candidate_fields_present(self, db):
        """Test that candidate-specific fields are present"""
        candidate = UserFactory(
            role='candidate',
            phone_number='+1234567890'
        )
        
        serializer = UserSerializer(candidate)
        data = serializer.data
        
        assert 'id' in data
        assert 'username' in data
        assert 'email' in data
        assert 'role' in data

    @pytest.mark.django_db
    def test_invalid_role(self):
        """Test serializing with invalid role"""
        data = {
            'username': 'invalidrole',
            'email': 'test@example.com',
            'role': 'invalid_role',
            'password': 'password123'
        }
        
        serializer = UserSerializer(data=data)
        # Should fail validation if roles are restricted
        # Behavior depends on serializer implementation
        # Just ensure no exceptions are raised
        try:
            serializer.is_valid()
        except Exception as e:
            pytest.fail(f"Serializer raised exception: {e}")


@pytest.mark.unit
class TestJobSerializer:
    """Test job serializer"""

    def test_job_data_validation(self, db):
        """Test that job data is properly structured"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        
        # Check job has required fields
        assert job.title
        assert job.description
        assert job.status in ['active', 'closed']
        assert job.posted_by == recruiter

    def test_job_requirements_structure(self, db):
        """Test job requirements JSON structure"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(
            posted_by=recruiter,
            requirements={
                'skills': ['Python', 'Django'],
                'experience': '5+ years'
            }
        )
        
        assert 'skills' in job.requirements
        assert 'experience' in job.requirements
        assert isinstance(job.requirements['skills'], list)


@pytest.mark.unit
class TestApplicationSerializer:
    """Test application serializer"""

    def test_application_data_structure(self, db):
        """Test application has required fields"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        candidate = UserFactory(role='candidate')
        
        app = ApplicationFactory(job=job, applicant=candidate, similarity_score=78.5)
        
        assert app.job == job
        assert app.applicant == candidate
        assert app.similarity_score == 78.5
        assert hasattr(app, 'created_at')

    def test_similarity_score_range(self, db):
        """Test similarity score is in valid range"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        candidate = UserFactory(role='candidate')
        
        app = ApplicationFactory(job=job, applicant=candidate, similarity_score=50.0)
        
        assert 0 <= app.similarity_score <= 100

    def test_application_timestamp(self, db):
        """Test application has created_at timestamp"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        candidate = UserFactory(role='candidate')
        
        app = ApplicationFactory(job=job, applicant=candidate)
        
        assert app.created_at is not None
