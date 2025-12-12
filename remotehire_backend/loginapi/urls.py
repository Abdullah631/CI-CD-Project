from django.urls import path
from .views import register_user, login_user, recruiter_jobs, add_job
from .views import recruiter_job_detail, active_candidates_count, public_jobs, apply_job
from .views import schedule_interview, candidate_interview_response, recruiter_interviews, candidate_interviews
from .views import interview_signal, get_interview_signals
from .views import google_login, google_callback, github_login, github_callback
from .views import candidate_applications, candidate_dashboard_stats, candidate_withdraw_application
from .views import recruiter_dashboard_stats, recruiter_job_applicants, recruiter_all_applicants, recruiter_recent_applicants
from .views import google_oauth, github_oauth, linkedin_oauth
from .views import candidate_profile, upload_cv, get_cv_metadata

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('recruiter/jobs/', recruiter_jobs, name='recruiter_jobs'),
    path('recruiter/jobs/add/', add_job, name='add_job'),
    path('recruiter/jobs/<int:job_id>/', recruiter_job_detail, name='recruiter_job_detail'),
    path('recruiter/active-candidates/', active_candidates_count, name='active_candidates_count'),
    # Recruiter Dashboard endpoints
    path('recruiter/dashboard/stats/', recruiter_dashboard_stats, name='recruiter_dashboard_stats'),
    path('recruiter/jobs/<int:job_id>/applicants/', recruiter_job_applicants, name='recruiter_job_applicants'),
    path('recruiter/applicants/', recruiter_all_applicants, name='recruiter_all_applicants'),
    path('recruiter/applicants/recent/', recruiter_recent_applicants, name='recruiter_recent_applicants'),
    path('jobs/', public_jobs, name='public_jobs'),
    path('jobs/<int:job_id>/apply/', apply_job, name='apply_job'),
    # Interviews
    path('interviews/schedule/', schedule_interview, name='schedule_interview'),
    path('interviews/recruiter/', recruiter_interviews, name='recruiter_interviews'),
    path('interviews/candidate/', candidate_interviews, name='candidate_interviews'),
    path('interviews/<int:interview_id>/response/', candidate_interview_response, name='candidate_interview_response'),
    path('interviews/<int:interview_id>/signal/', interview_signal, name='interview_signal'),
    path('interviews/<int:interview_id>/signals/', get_interview_signals, name='get_interview_signals'),
    # Candidate endpoints
    path('candidate/applications/', candidate_applications, name='candidate_applications'),
    path('candidate/dashboard/stats/', candidate_dashboard_stats, name='candidate_dashboard_stats'),
    path('candidate/applications/<int:application_id>/withdraw/', candidate_withdraw_application, name='candidate_withdraw_application'),
    # Candidate Profile endpoints
    path('candidate/profile/', candidate_profile, name='candidate_profile'),
    path('candidate/upload-cv/', upload_cv, name='upload_cv'),
    path('candidate/<int:user_id>/cv-metadata/', get_cv_metadata, name='get_cv_metadata'),
    # OAuth endpoints (NEW)
    path('auth/google/', google_oauth, name='google_oauth'),
    path('auth/github/', github_oauth, name='github_oauth'),
    path('auth/linkedin/', linkedin_oauth, name='linkedin_oauth'),
    # Social auth (OLD - keep for backwards compatibility if needed)
    path('auth/google/login/', google_login, name='google_login'),
    path('auth/google/callback/', google_callback, name='google_callback'),
    path('auth/github/login/', github_login, name='github_login'),
    path('auth/github/callback/', github_callback, name='github_callback'),
]
