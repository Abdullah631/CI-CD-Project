from django.urls import path
from .views import register_user, login_user, recruiter_jobs, add_job

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),
    path('recruiter/jobs/', recruiter_jobs, name='recruiter_jobs'),
    path('recruiter/jobs/add/', add_job, name='add_job'),
]
