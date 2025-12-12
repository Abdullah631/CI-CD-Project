from django.db import models
import json

class User(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)
    photo = models.ImageField(upload_to='photos/')
    
    # Profile fields
    full_name = models.CharField(max_length=255, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    cv = models.FileField(upload_to='resumes/', null=True, blank=True)
    cv_metadata = models.JSONField(default=dict, blank=True)  # Extracted from CV
    cv_last_updated = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.username

class Job(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
    ]
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    posted_by = models.ForeignKey(User, related_name='jobs', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Job requirements for similarity matching
    requirements = models.JSONField(default=dict, blank=True)  # Skills, experience, education needed

    def __str__(self):
        return f"{self.title} ({self.posted_by})"


class Application(models.Model):
    job = models.ForeignKey(Job, related_name='applications', on_delete=models.CASCADE)
    applicant = models.ForeignKey(User, related_name='applications', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    similarity_score = models.FloatField(default=0.0)  # 0-100 based on CV metadata match

    def __str__(self):
        return f"Application: {self.applicant} -> {self.job}"


class Interview(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    job = models.ForeignKey(Job, related_name='interviews', on_delete=models.CASCADE)
    recruiter = models.ForeignKey(User, related_name='scheduled_interviews', on_delete=models.CASCADE)
    candidate = models.ForeignKey(User, related_name='candidate_interviews', on_delete=models.CASCADE)
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Interview: {self.job.title} with {self.candidate.username} at {self.scheduled_at}"
