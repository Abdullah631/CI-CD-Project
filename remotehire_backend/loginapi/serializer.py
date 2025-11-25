from rest_framework import serializers
from .models import User
from .models import Job
from .models import Application

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class JobSerializer(serializers.ModelSerializer):
    posted_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'status', 'posted_by', 'created_at']


class ApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.StringRelatedField(read_only=True)
    job = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'applicant', 'created_at']
