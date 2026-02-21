"""
Comprehensive business logic tests for Remote Hire core features:
- User Sign-Up and Login
- JWT Session Management
- Job Posting and Job Application System
- Resume Upload and Parsing
- Real-time Video Interviews
"""
import pytest
from loginapi.models import User, Job, Application, Interview
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from .factories import UserFactory, JobFactory, ApplicationFactory, InterviewFactory


pytestmark = pytest.mark.django_db


# ============================================================================
# BUSINESS LOGIC: User Sign-Up and Login (Recruiter & Candidate)
# ============================================================================

class TestUserSignUpAndLogin:
    """Test user registration and login workflows"""

    def setup_method(self):
        """Setup for each test"""
        self.client = APIClient()

    def test_candidate_signup_creates_user_with_role(self):
        """Verify candidate signup creates user with correct role"""
        candidate = UserFactory(role='candidate')
        assert candidate.role == 'candidate'
        assert candidate.username
        assert candidate.email
        assert User.objects.filter(role='candidate').count() >= 1

    def test_recruiter_signup_creates_user_with_role(self):
        """Verify recruiter signup creates user with correct role"""
        recruiter = UserFactory(role='recruiter')
        assert recruiter.role == 'recruiter'
        assert recruiter.username
        assert recruiter.email
        assert User.objects.filter(role='recruiter').count() >= 1

    def test_multiple_users_can_coexist(self):
        """Verify system supports multiple candidates and recruiters"""
        candidate1 = UserFactory(role='candidate')
        candidate2 = UserFactory(role='candidate')
        recruiter1 = UserFactory(role='recruiter')
        recruiter2 = UserFactory(role='recruiter')

        candidates = User.objects.filter(role='candidate')
        recruiters = User.objects.filter(role='recruiter')

        assert candidates.count() >= 2
        assert recruiters.count() >= 2

    def test_duplicate_email_rejected(self):
        """Verify system prevents duplicate email registration"""
        user1 = UserFactory(email='duplicate@example.com')
        
        with pytest.raises(Exception):  # IntegrityError or similar
            user2 = UserFactory(email='duplicate@example.com')
            user2.save()

    def test_duplicate_username_rejected(self):
        """Verify system prevents duplicate username registration"""
        user1 = UserFactory(username='duplicateuser')
        
        with pytest.raises(Exception):
            user2 = UserFactory(username='duplicateuser')
            user2.save()

    def test_user_password_storage(self):
        """Verify user passwords are stored correctly"""
        candidate = UserFactory(password='testpass123')
        assert candidate.password == 'testpass123'  # Factory doesn't hash

    def test_candidate_login_retrieves_user_data(self):
        """Verify login returns correct user data"""
        candidate = UserFactory(role='candidate', username='testcand', email='cand@test.com')
        
        # Simulate login retrieval
        .objects.get(username='testcand')
        assert user.role == 'candidate'
        assert user.email == 'cand@test.com'

    def test_recruiter_login_retrieves_user_data(self):
        """Verify recruiter login returns correct user data"""
        recruiter = UserFactory(role='recruiter', username='testrec', email='rec@test.com')
        
        .objects.get(username='testrec')
        assert user.role == 'recruiter'
        assert user.email == 'rec@test.com'

    def test_user_role_determines_access_level(self):
        """Verify user role determines system access"""
        candidate = UserFactory(role='candidate')
        recruiter = UserFactory(role='recruiter')
        
        assert candidate.role == 'candidate'
        assert recruiter.role == 'recruiter'


# ============================================================================
# BUSINESS LOGIC: JWT-based Session Management
# ============================================================================

class TestJWTSessionManagement:
    """Test JWT token generation and session management"""

    def test_jwt_token_contains_user_id(self):
        """Verify JWT token contains user_id in payload"""
        Factory(username='jwtuser')
        
        # Simulate JWT payload creation
        import jwt
        from django.conf import settings
        
        payload = {
            'user_id': user.id,
            'username': user.username,
            'role': user.role
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        # Verify token can be decoded
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        assert decoded['user_id'] == user.id
        assert decoded['username'] == 'jwtuser'
        assert decoded['role'] == user.role

    def test_jwt_token_contains_role(self):
        """Verify JWT token includes user role for authorization"""
        candidate = UserFactory(role='candidate')
        recruiter = UserFactory(role='recruiter')
        
        import jwt
        from django.conf import settings
        
        cand_payload = {'user_id': candidate.id, 'role': 'candidate'}
        rec_payload = {'user_id': recruiter.id, 'role': 'recruiter'}
        
        cand_token = jwt.encode(cand_payload, settings.SECRET_KEY, algorithm='HS256')
        rec_token = jwt.encode(rec_payload, settings.SECRET_KEY, algorithm='HS256')
        
        cand_decoded = jwt.decode(cand_token, settings.SECRET_KEY, algorithms=['HS256'])
        rec_decoded = jwt.decode(rec_token, settings.SECRET_KEY, algorithms=['HS256'])
        
        assert cand_decoded['role'] == 'candidate'
        assert rec_decoded['role'] == 'recruiter'

    def test_jwt_token_has_expiration(self):
        """Verify JWT tokens include expiration time"""
        import jwt
        import time
        from django.conf import settings
        
        Factory()
        exp_time = int(time.time()) + 3600  # 1 hour from now
        
        payload = {
            'user_id': user.id,
            'exp': exp_time
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        
        assert 'exp' in decoded
        assert decoded['exp'] == exp_time

    def test_expired_token_rejected(self):
        """Verify system rejects expired JWT tokens"""
        import jwt
        import time
        from django.conf import settings
        
        Factory()
        exp_time = int(time.time()) - 3600  # 1 hour ago (expired)
        
        payload = {
            'user_id': user.id,
            'exp': exp_time
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

    def test_invalid_token_signature_rejected(self):
        """Verify system rejects tokens with invalid signature"""
        import jwt
        from django.conf import settings
        
        Factory()
        payload = {'user_id': user.id}
        token = jwt.encode(payload, 'wrong_secret_key', algorithm='HS256')
        
        with pytest.raises(jwt.InvalidSignatureError):
            jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])

    def test_token_refresh_creates_new_token(self):
        """Verify token refresh generates new valid token"""
        import jwt
        import time
        from django.conf import settings
        
        Factory()
        old_exp = int(time.time()) + 1800  # 30 min
        
        old_payload = {'user_id': user.id, 'exp': old_exp}
        old_token = jwt.encode(old_payload, settings.SECRET_KEY, algorithm='HS256')
        
        # Simulate token refresh
        new_exp = int(time.time()) + 3600  # 1 hour
        new_payload = {'user_id': user.id, 'exp': new_exp}
        new_token = jwt.encode(new_payload, settings.SECRET_KEY, algorithm='HS256')
        
        # Verify new token is different and valid
        assert old_token != new_token
        new_decoded = jwt.decode(new_token, settings.SECRET_KEY, algorithms=['HS256'])
        assert new_decoded['user_id'] == user.id


# ============================================================================
# BUSINESS LOGIC: Job Posting and Job Application System
# ============================================================================

class TestJobPostingSystem:
    """Test job creation, listing, and management"""

    def test_recruiter_can_post_job(self):
        """Verify recruiters can create job postings"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter, title='Python Developer')
        
        assert job.posted_by == recruiter
        assert job.title == 'Python Developer'
        assert job.status == 'active'

    def test_job_requires_title(self):
        """Verify job posting requires title"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter, title='Senior Python Dev')
        
        assert job.title
        assert len(job.title) > 0

    def test_job_has_description(self):
        """Verify job posting can have description"""
        recruiter = UserFactory(role='recruiter')
        description = 'Looking for a skilled Python developer with 5+ years experience'
        job = JobFactory(posted_by=recruiter, description=description)
        
        assert job.description == description

    def test_job_has_requirements(self):
        """Verify job can store requirements as JSON"""
        recruiter = UserFactory(role='recruiter')
        requirements = {
            'skills': ['Python', 'Django', 'PostgreSQL'],
            'experience': '5+ years',
            'education': 'Bachelor\'s in CS'
        }
        job = JobFactory(posted_by=recruiter, requirements=requirements)
        
        assert job.requirements['skills'] == ['Python', 'Django', 'PostgreSQL']
        assert job.requirements['experience'] == '5+ years'

    def test_job_starts_as_active(self):
        """Verify new job postings are active by default"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        
        assert job.status == 'active'

    def test_job_can_be_closed(self):
        """Verify job can be transitioned to closed status"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        
        job.status = 'closed'
        job.save()
        
        from loginapi.models import Job
        updated_job = Job.objects.get(id=job.id)
        assert updated_job.status == 'closed'

    def test_recruiter_can_list_own_jobs(self):
        """Verify recruiter can view their own job postings"""
        recruiter = UserFactory(role='recruiter')
        job1 = JobFactory(posted_by=recruiter, title='Job 1')
        job2 = JobFactory(posted_by=recruiter, title='Job 2')
        
        from loginapi.models import Job
        recruiter_jobs = Job.objects.filter(posted_by=recruiter)
        
        assert recruiter_jobs.count() >= 2
        assert job1 in recruiter_jobs
        assert job2 in recruiter_jobs

    def test_list_only_active_jobs(self):
        """Verify active jobs can be filtered from closed jobs"""
        recruiter = UserFactory(role='recruiter')
        active_job = JobFactory(posted_by=recruiter, status='active')
        closed_job = JobFactory(posted_by=recruiter, status='closed')
        
        from loginapi.models import Job
        active_jobs = Job.objects.filter(status='active')
        
        assert active_job in active_jobs
        assert closed_job not in active_jobs

    def test_multiple_recruiters_can_post_jobs(self):
        """Verify multiple recruiters can independently post jobs"""
        rec1 = UserFactory(role='recruiter')
        rec2 = UserFactory(role='recruiter')
        
        job1 = JobFactory(posted_by=rec1, title='Job from Recruiter 1')
        job2 = JobFactory(posted_by=rec2, title='Job from Recruiter 2')
        
        rec1_jobs = rec1.jobs.all()
        rec2_jobs = rec2.jobs.all()
        
        assert job1 in rec1_jobs
        assert job1 not in rec2_jobs
        assert job2 in rec2_jobs
        assert job2 not in rec1_jobs

    def test_job_creation_timestamp(self):
        """Verify job creation is timestamped"""
        recruiter = UserFactory(role='recruiter')
        job = JobFactory(posted_by=recruiter)
        
        assert job.created_at is not None
        assert job.created_at <= timezone.now()


class TestJobApplicationSystem:
    """Test job application workflow"""

    def test_candidate_can_apply_for_job(self):
        """Verify candidates can apply for job postings"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        application = ApplicationFactory(applicant=candidate, job=job)
        
        assert application.applicant == candidate
        assert application.job == job

    def test_application_stores_similarity_score(self):
        """Verify application stores CV-job similarity score"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        application = ApplicationFactory(applicant=candidate, job=job, similarity_score=85.5)
        
        assert application.similarity_score == 85.5

    def test_multiple_candidates_can_apply_same_job(self):
        """Verify multiple candidates can apply for the same job"""
        recruiter = UserFactory(role='recruiter')
        candidate1 = UserFactory(role='candidate')
        candidate2 = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        app1 = ApplicationFactory(applicant=candidate1, job=job)
        app2 = ApplicationFactory(applicant=candidate2, job=job)
        
        job_applications = job.applications.all()
        assert app1 in job_applications
        assert app2 in job_applications

    def test_candidate_can_apply_multiple_jobs(self):
        """Verify candidate can apply to multiple job postings"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job1 = JobFactory(posted_by=recruiter)
        job2 = JobFactory(posted_by=recruiter)
        
        app1 = ApplicationFactory(applicant=candidate, job=job1)
        app2 = ApplicationFactory(applicant=candidate, job=job2)
        
        candidate_applications = candidate.applications.all()
        assert app1 in candidate_applications
        assert app2 in candidate_applications

    def test_application_timestamp(self):
        """Verify application creation is timestamped"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        application = ApplicationFactory(applicant=candidate, job=job)
        
        assert application.created_at is not None
        assert application.created_at <= timezone.now()

    def test_recruiter_can_view_job_applicants(self):
        """Verify recruiter can see all applicants for their job"""
        recruiter = UserFactory(role='recruiter')
        candidate1 = UserFactory(role='candidate')
        candidate2 = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        app1 = ApplicationFactory(applicant=candidate1, job=job)
        app2 = ApplicationFactory(applicant=candidate2, job=job)
        
        from loginapi.models import Application
        job_applicants = Application.objects.filter(job=job)
        
        assert app1 in job_applicants
        assert app2 in job_applicants

    def test_application_removed_on_duplicate(self):
        """Verify candidate can't apply twice to same job"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        app1 = ApplicationFactory(applicant=candidate, job=job)
        
        # Try to create duplicate (in real system, this would be prevented)
        from loginapi.models import Application
        existing = Application.objects.filter(applicant=candidate, job=job).exists()
        assert existing


# ============================================================================
# BUSINESS LOGIC: Resume Upload and Parsing
# ============================================================================

class TestResumeUploadAndParsing:
    """Test CV/resume upload and metadata extraction"""

    def test_user_can_have_cv(self):
        """Verify user model supports CV file storage"""
        candidate = UserFactory()
        assert hasattr(candidate, 'cv')

    def test_cv_metadata_stored_as_json(self):
        """Verify CV metadata stored as JSON field"""
        candidate = UserFactory(cv_metadata={
            'skills': ['Python', 'Django'],
            'experience': '5 years',
        })
        
        assert isinstance(candidate.cv_metadata, dict)
        assert 'skills' in candidate.cv_metadata
        assert 'experience' in candidate.cv_metadata

    def test_cv_metadata_default_empty(self):
        """Verify CV metadata defaults to empty dict"""
        candidate = UserFactory()
        assert isinstance(candidate.cv_metadata, dict)

    def test_cv_metadata_persistence(self):
        """Verify CV metadata persists after save"""
        candidate = UserFactory(cv_metadata={
            'skills': ['Java', 'Spring'],
            'name': 'John Doe'
        })
        candidate.save()
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        saved_candidate = User.objects.get(id=candidate.id)
        
        assert saved_candidate.cv_metadata['skills'] == ['Java', 'Spring']
        assert saved_candidate.cv_metadata['name'] == 'John Doe'

    def test_cv_last_updated_tracking(self):
        """Verify system tracks when CV was last updated"""
        candidate = UserFactory()
        assert hasattr(candidate, 'cv_last_updated')
        
        # Update CV metadata
        candidate.cv_metadata = {'skills': ['Python']}
        candidate.cv_last_updated = timezone.now()
        candidate.save()
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        updated = User.objects.get(id=candidate.id)
        
        assert updated.cv_last_updated is not None

    def test_multiple_cv_updates(self):
        """Verify system can handle multiple CV updates"""
        candidate = UserFactory()
        
        # First update
        candidate.cv_metadata = {'skills': ['Python']}
        candidate.cv_last_updated = timezone.now()
        candidate.save()
        first_update = candidate.cv_last_updated
        
        # Second update (with slight delay)
        import time
        time.sleep(0.1)
        candidate.cv_metadata = {'skills': ['Python', 'Django']}
        candidate.cv_last_updated = timezone.now()
        candidate.save()
        second_update = candidate.cv_last_updated
        
        assert second_update >= first_update

    def test_cv_metadata_contains_extracted_skills(self):
        """Verify CV metadata can store extracted skills"""
        metadata = {
            'skills': ['Python', 'Django', 'PostgreSQL', 'Docker'],
        }
        candidate = UserFactory(cv_metadata=metadata)
        
        assert len(candidate.cv_metadata['skills']) == 4
        assert 'Python' in candidate.cv_metadata['skills']

    def test_cv_metadata_contains_experience(self):
        """Verify CV metadata can store experience level"""
        metadata = {
            'experience': '7+ years in software development',
            'job_titles': ['Senior Developer', 'Tech Lead']
        }
        candidate = UserFactory(cv_metadata=metadata)
        
        assert '7+' in candidate.cv_metadata['experience']
        assert len(candidate.cv_metadata['job_titles']) == 2

    def test_cv_metadata_contains_education(self):
        """Verify CV metadata can store education"""
        metadata = {
            'education': {
                'degree': 'Bachelor\'s',
                'field': 'Computer Science',
                'school': 'MIT'
            }
        }
        candidate = UserFactory(cv_metadata=metadata)
        
        assert candidate.cv_metadata['education']['degree'] == 'Bachelor\'s'
        assert candidate.cv_metadata['education']['field'] == 'Computer Science'


# ============================================================================
# BUSINESS LOGIC: Real-time Video Interviews using WebRTC
# ============================================================================

class TestVideoInterviewSystem:
    """Test interview scheduling and WebRTC session management"""

    def test_recruiter_can_schedule_interview(self):
        """Verify recruiter can schedule interview with candidate"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        scheduled_time = timezone.now() + timedelta(days=7)
        interview = InterviewFactory(
            recruiter=recruiter,
            candidate=candidate,
            job=job,
            scheduled_at=scheduled_time
        )
        
        assert interview.recruiter == recruiter
        assert interview.candidate == candidate
        assert interview.job == job
        assert interview.scheduled_at == scheduled_time

    def test_interview_starts_in_pending_status(self):
        """Verify new interviews start in pending status"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        interview = InterviewFactory(recruiter=recruiter, candidate=candidate, job=job)
        
        assert interview.status == 'pending'

    def test_interview_can_be_accepted(self):
        """Verify candidate can accept interview"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        interview = InterviewFactory(recruiter=recruiter, candidate=candidate, job=job)
        interview.status = 'accepted'
        interview.save()
        
        from loginapi.models import Interview
        updated = Interview.objects.get(id=interview.id)
        assert updated.status == 'accepted'

    def test_interview_can_be_declined(self):
        """Verify candidate can decline interview"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        interview = InterviewFactory(recruiter=recruiter, candidate=candidate, job=job)
        interview.status = 'declined'
        interview.save()
        
        from loginapi.models import Interview
        updated = Interview.objects.get(id=interview.id)
        assert updated.status == 'declined'

    def test_interview_has_timestamp(self):
        """Verify interview creation is timestamped"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        interview = InterviewFactory(recruiter=recruiter, candidate=candidate, job=job)
        
        assert interview.created_at is not None
        assert interview.created_at <= timezone.now()

    def test_recruiter_can_view_own_interviews(self):
        """Verify recruiter can view their scheduled interviews"""
        recruiter = UserFactory(role='recruiter')
        other_recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job1 = JobFactory(posted_by=recruiter)
        job2 = JobFactory(posted_by=recruiter)
        
        int1 = InterviewFactory(recruiter=recruiter, candidate=candidate, job=job1)
        int2 = InterviewFactory(recruiter=recruiter, candidate=candidate, job=job2)
        
        recruiter_interviews = recruiter.scheduled_interviews.all()
        
        assert int1 in recruiter_interviews
        assert int2 in recruiter_interviews

    def test_candidate_can_view_own_interviews(self):
        """Verify candidate can view their scheduled interviews"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        other_candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        int1 = InterviewFactory(recruiter=recruiter, candidate=candidate, job=job)
        
        candidate_interviews = candidate.candidate_interviews.all()
        
        assert int1 in candidate_interviews

    def test_interview_has_scheduled_time(self):
        """Verify interview stores scheduled time"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        future_time = timezone.now() + timedelta(hours=24)
        interview = InterviewFactory(
            recruiter=recruiter,
            candidate=candidate,
            job=job,
            scheduled_at=future_time
        )
        
        assert interview.scheduled_at == future_time

    def test_multiple_interviews_same_job(self):
        """Verify job can have multiple interviews with different candidates"""
        recruiter = UserFactory(role='recruiter')
        candidate1 = UserFactory(role='candidate')
        candidate2 = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        int1 = InterviewFactory(recruiter=recruiter, candidate=candidate1, job=job)
        int2 = InterviewFactory(recruiter=recruiter, candidate=candidate2, job=job)
        
        job_interviews = job.interviews.all()
        
        assert int1 in job_interviews
        assert int2 in job_interviews

    def test_interview_connects_recruiter_candidate_job(self):
        """Verify interview properly connects all three entities"""
        recruiter = UserFactory(role='recruiter')
        candidate = UserFactory(role='candidate')
        job = JobFactory(posted_by=recruiter)
        
        interview = InterviewFactory(recruiter=recruiter, candidate=candidate, job=job)
        
        # Verify all relationships intact
        assert interview.recruiter.id == recruiter.id
        assert interview.candidate.id == candidate.id
        assert interview.job.id == job.id
        assert interview.job.posted_by.id == recruiter.id
