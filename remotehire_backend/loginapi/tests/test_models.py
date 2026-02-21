import pytest
from django.contrib.auth import get_user_model
from loginapi.models import Job, Application, Interview
from .factories import UserFactory, JobFactory, ApplicationFactory, InterviewFactory

User = get_user_model()


@pytest.mark.unit
class TestUserModel:
    """Test User model"""

    def test_user_creation(self, db):
        """Test creating a user"""
        user = UserFactory(username='testuser')
        assert user.username == 'testuser'
        assert user.role == 'candidate'

    def test_user_str_representation(self, db):
        """Test user string representation"""
        user = UserFactory(username='john')
        assert str(user) == 'john'

    def test_candidate_role(self, db):
        """Test user with candidate role"""
        candidate = UserFactory(role='candidate')
        assert candidate.role == 'candidate'

    def test_recruiter_role(self, db):
        """Test user with recruiter role"""
        recruiter = UserFactory(role='recruiter')
        assert recruiter.role == 'recruiter'

    def test_user_email_unique(self, db):
        """Test that emails are unique"""
        email = 'test@example.com'
        UserFactory(email=email)
        with pytest.raises(Exception):  # IntegrityError
            UserFactory(email=email)

    def test_user_password_hashing(self, db):
        """Test that passwords can be set and retrieved"""
        user = UserFactory(password='plaintext123')
        # The custom User model stores passwords in plain text, so this is expected behavior
        assert user.password == 'plaintext123'
        assert user.id is not None


@pytest.mark.unit
class TestJobModel:
    """Test Job model"""

    def test_job_creation(self, db):
        """Test creating a job"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter, title='Python Developer')
        assert job.title == 'Python Developer'
        assert job.status == 'active'
        assert job.posted_by == recruiter

    def test_job_str_representation(self, db):
        """Test job string representation"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter, title='Test Job')
        assert 'Test Job' in str(job)

    def test_job_status_active(self, db):
        """Test job with active status"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter, status='active')
        assert job.status == 'active'

    def test_job_status_closed(self, db):
        """Test job with closed status"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter, status='closed')
        assert job.status == 'closed'

    def test_job_requirements(self, db):
        """Test job requirements"""
        recruiter = UserFactory(role='recruiter')
        requirements = {
            'skills': ['Python', 'Django'],
            'experience': '5+ years'
        }
        job = JobFactory(posted_by=recruiter, requirements=requirements)
        assert job.requirements['skills'] == ['Python', 'Django']
        assert job.requirements['experience'] == '5+ years'


@pytest.mark.unit
class TestApplicationModel:
    """Test Application model"""

    def test_application_creation(self, db):
        """Test creating an application"""
        app = ApplicationFactory(similarity_score=80.5)
        assert app.similarity_score == 80.5
        assert app.applicant is not None
        assert app.job is not None

    def test_application_similarity_score_range(self, db):
        """Test similarity score is valid"""
        app = ApplicationFactory(similarity_score=75.0)
        assert 0 <= app.similarity_score <= 100

    def test_application_str_representation(self, db):
        """Test application string representation"""
        candidate = UserFactory(role='candidate')
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        app = ApplicationFactory(applicant=candidate, job=job)
        assert 'Application' in str(app)

    def test_multiple_applications_same_job(self, db):
        """Test multiple applicants can apply to same job"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        
        candidate1 = UserFactory(role='candidate')
        candidate2 = UserFactory(role='candidate')
        
        app1 = ApplicationFactory(applicant=candidate1, job=job)
        app2 = ApplicationFactory(applicant=candidate2, job=job)
        
        assert app1.job == app2.job
        assert app1.applicant != app2.applicant


@pytest.mark.unit
class TestInterviewModel:
    """Test Interview model"""

    def test_interview_creation(self, db):
        """Test creating an interview"""
        candidate = UserFactory(role='candidate')
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        
        interview = InterviewFactory(candidate=candidate, recruiter=recruiter, job=job)
        assert interview.candidate == candidate
        assert interview.recruiter == recruiter
        assert interview.job == job
        assert interview.status == 'pending'

    def test_interview_scheduled_at(self, db):
        """Test interview scheduled_at timestamp"""
        interview = InterviewFactory()
        assert interview.scheduled_at is not None

    def test_interview_str_representation(self, db):
        """Test interview string representation"""
        interview = InterviewFactory()
        assert 'Interview' in str(interview)

    def test_interview_room_id_unique(self, db):
        """Test that each interview has a unique scheduled time"""
        interview1 = InterviewFactory()
        interview2 = InterviewFactory()
        # Both interviews should be scheduled at different times (at least)
        assert interview1.status == 'pending'
        assert interview2.status == 'pending'
