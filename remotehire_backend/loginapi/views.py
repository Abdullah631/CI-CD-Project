from .models import User, Job
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from .serializer import UserSerializer, JobSerializer
from rest_framework import status
from rest_framework.response import Response
import jwt
from django.conf import settings
from datetime import datetime, timedelta
from .decorators import recruiter_required


def _get_user_from_bearer(request):
    """Decode Bearer token from request and return a User or (None, error_response).
    Returns (user, None) on success or (None, Response) on error.
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header:
        return None, Response({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None, Response({'error': 'Invalid authorization header.'}, status=status.HTTP_401_UNAUTHORIZED)
    token = parts[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None, Response({'error': 'Token has expired.'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print('views._get_user_from_bearer: jwt decode error', repr(e))
        return None, Response({'error': 'Invalid token.'}, status=status.HTTP_401_UNAUTHORIZED)
    user_id = payload.get('user_id')
    if not user_id:
        return None, Response({'error': 'Invalid token payload.'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None, Response({'error': 'User not found.'}, status=status.HTTP_401_UNAUTHORIZED)
    return user, None


@api_view(['POST'])
@csrf_exempt
def register_user(request):
    # Log headers and incoming data for debugging
    try:
        print('REGISTER_REQUEST: HTTP_AUTHORIZATION=', request.META.get('HTTP_AUTHORIZATION'))
    except Exception:
        pass
    print('REGISTER_REQUEST: data=', getattr(request, 'data', None))
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Register Successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@csrf_exempt
def login_user(request):
    try:
        print('LOGIN_REQUEST: HTTP_AUTHORIZATION=', request.META.get('HTTP_AUTHORIZATION'))
        print('LOGIN_REQUEST: raw body=', request.body.decode('utf-8'))
    except Exception:
        pass
    username = request.data.get('username')
    password = request.data.get('password')
    try:
        user = User.objects.get(username=username, password=password)
        payload = {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        # Ensure token is a str (pyjwt may return bytes in some versions)
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        return Response({
            "message": "Login Successfully",
            "token": token,
            "role": user.role,
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@csrf_exempt
def add_job(request):
    """Create a job post. Authenticates by Bearer token and requires role 'recruiter'.
    This view decodes the token itself to avoid middleware/ decorator ordering issues.
    """
    print('ADD_JOB CALLED: HTTP_AUTHORIZATION=', request.META.get('HTTP_AUTHORIZATION'))
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    # normalize role
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    print('ADD_JOB: user=', user, 'role=', repr(role_val), 'normalized=', role_norm)
    if role_norm != 'recruiter':
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    serializer = JobSerializer(data=data)
    if serializer.is_valid():
        job = Job.objects.create(
            title=serializer.validated_data['title'],
            description=serializer.validated_data.get('description', ''),
            status=serializer.validated_data.get('status', 'active'),
            posted_by=user
        )
        return Response({'message': 'Job created successfully', 'job_id': job.id}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@csrf_exempt
def recruiter_jobs(request):
    print('RECRUITER_JOBS CALLED: HTTP_AUTHORIZATION=', request.META.get('HTTP_AUTHORIZATION'))
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'recruiter':
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
    jobs = Job.objects.filter(posted_by=user).order_by('-created_at')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
