from django.urls import path
from .views import register_user, login_user, recruiter_jobs, add_job
from .views import recruiter_job_detail, active_candidates_count, public_jobs, apply_job
from .views import google_login, google_callback, github_login, github_callback

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('recruiter/jobs/', recruiter_jobs, name='recruiter_jobs'),
    path('recruiter/jobs/add/', add_job, name='add_job'),
    path('recruiter/jobs/<int:job_id>/', recruiter_job_detail, name='recruiter_job_detail'),
    path('recruiter/active-candidates/', active_candidates_count, name='active_candidates_count'),
    path('jobs/', public_jobs, name='public_jobs'),
    path('jobs/<int:job_id>/apply/', apply_job, name='apply_job'),
    # Social auth
    path('auth/google/login/', google_login, name='google_login'),
    path('auth/google/callback/', google_callback, name='google_callback'),
    path('auth/github/login/', github_login, name='github_login'),
    path('auth/github/callback/', github_callback, name='github_callback'),
]
