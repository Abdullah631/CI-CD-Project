from rest_framework import serializers
from .models import User, Job, Application, Interview

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class JobSerializer(serializers.ModelSerializer):
    posted_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'status', 'posted_by', 'created_at', 'requirements']


class ApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.StringRelatedField(read_only=True)
    job = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'applicant', 'created_at', 'similarity_score']


class InterviewSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = [
            'id', 'job', 'job_title', 'recruiter', 'recruiter_name',
            'candidate', 'candidate_name', 'scheduled_at', 'status', 'created_at'
        ]

    def get_recruiter_name(self, obj):
        return obj.recruiter.full_name or obj.recruiter.username

    def get_candidate_name(self, obj):
        return obj.candidate.full_name or obj.candidate.username

    def get_job_title(self, obj):
        return obj.job.title
