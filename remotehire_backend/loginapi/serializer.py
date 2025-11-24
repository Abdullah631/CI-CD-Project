from rest_framework import serializers
from .models import User
from .models import Job

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class JobSerializer(serializers.ModelSerializer):
    posted_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'status', 'posted_by', 'created_at']
