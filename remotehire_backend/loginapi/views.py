from .models import User, Job
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from .serializer import UserSerializer, JobSerializer
import requests
from django.shortcuts import redirect
from django.urls import reverse
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


@api_view(['GET'])
@csrf_exempt
def public_jobs(request):
    """Return list of active jobs for candidates/public."""
    jobs = Job.objects.filter(status='active').order_by('-created_at')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@csrf_exempt
def apply_job(request, job_id):
    """Allow authenticated candidate to apply to a job."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    # only candidates can apply
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'candidate':
        return Response({'error': 'Only candidates can apply to jobs.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

    # create application if not exists
    from .models import Application
    existing = Application.objects.filter(job=job, applicant=user).first()
    if existing:
        return Response({'message': 'Already applied.'}, status=status.HTTP_200_OK)
    app = Application.objects.create(job=job, applicant=user)
    from .serializer import ApplicationSerializer
    return Response({'message': 'Application submitted', 'application': ApplicationSerializer(app).data}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@csrf_exempt
def recruiter_job_detail(request, job_id):
    """Retrieve, update, or delete a single job owned by the authenticated recruiter."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'recruiter':
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Ensure the authenticated user is the owner
    if job.posted_by_id != user.id:
        return Response({'error': 'You do not have permission for this job.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        serializer = JobSerializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method in ('PUT', 'PATCH'):
        data = request.data.copy()
        # Only allow editing of certain fields
        allowed = {'title', 'description', 'status'}
        update_fields = {k: v for k, v in data.items() if k in allowed}
        if not update_fields:
            return Response({'error': 'No editable fields provided.'}, status=status.HTTP_400_BAD_REQUEST)
        for k, v in update_fields.items():
            setattr(job, k, v)
        job.save()
        serializer = JobSerializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'DELETE':
        job.delete()
        return Response({'message': 'Job deleted successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@csrf_exempt
def active_candidates_count(request):
    """Return count of users with role 'candidate'. Accessible to authenticated recruiters."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'recruiter':
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    count = User.objects.filter(role__iexact='candidate').count()
    return Response({'count': count}, status=status.HTTP_200_OK)


@api_view(['GET'])
@csrf_exempt
def google_login(request):
    """Redirect user to Google's OAuth2 consent screen. Requires settings.GOOGLE_CLIENT_ID and FRONTEND_URL/redirect setup."""
    client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
    if not client_id:
        return Response({'error': 'Google OAuth not configured on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # build redirect uri for callback
    callback_path = reverse('google_callback')
    redirect_uri = request.build_absolute_uri(callback_path)
    scope = 'openid email profile'
    auth_url = (
        'https://accounts.google.com/o/oauth2/v2/auth'
        f'?client_id={client_id}&response_type=code&scope={scope}&redirect_uri={redirect_uri}&access_type=offline&prompt=consent'
    )
    return redirect(auth_url)


@api_view(['GET'])
@csrf_exempt
def google_callback(request):
    code = request.GET.get('code')
    if not code:
        return Response({'error': 'Missing code'}, status=status.HTTP_400_BAD_REQUEST)
    client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
    client_secret = getattr(settings, 'GOOGLE_CLIENT_SECRET', None)
    if not client_id or not client_secret:
        return Response({'error': 'Google OAuth not configured on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    callback_path = reverse('google_callback')
    redirect_uri = request.build_absolute_uri(callback_path)
    # exchange code for tokens
    token_resp = requests.post('https://oauth2.googleapis.com/token', data={
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code'
    })
    if token_resp.status_code != 200:
        return Response({'error': 'Failed to obtain token from Google', 'details': token_resp.text}, status=status.HTTP_400_BAD_REQUEST)
    token_data = token_resp.json()
    id_token = token_data.get('id_token')
    if not id_token:
        return Response({'error': 'No id_token returned by Google'}, status=status.HTTP_400_BAD_REQUEST)
    # verify id_token with Google
    info_resp = requests.get(f'https://oauth2.googleapis.com/tokeninfo?id_token={id_token}')
    if info_resp.status_code != 200:
        return Response({'error': 'Failed to verify id_token', 'details': info_resp.text}, status=status.HTTP_400_BAD_REQUEST)
    info = info_resp.json()
    email = info.get('email')
    username = email.split('@')[0] if email else info.get('sub')
    # create or get user
    user, created = User.objects.get_or_create(email=email, defaults={'username': username, 'password': '', 'role': 'candidate'})
    # issue jwt
    payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    if isinstance(token, bytes): token = token.decode('utf-8')
    frontend = getattr(settings, 'FRONTEND_URL', 'http://127.0.0.1:5173')
    redirect_to = f"{frontend}/#/signin?token={token}&username={user.username}&role={user.role}"
    return redirect(redirect_to)


@api_view(['GET'])
@csrf_exempt
def github_login(request):
    client_id = getattr(settings, 'GITHUB_CLIENT_ID', None)
    if not client_id:
        return Response({'error': 'GitHub OAuth not configured on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    callback_path = reverse('github_callback')
    redirect_uri = request.build_absolute_uri(callback_path)
    auth_url = (
        'https://github.com/login/oauth/authorize'
        f'?client_id={client_id}&redirect_uri={redirect_uri}&scope=user:email'
    )
    return redirect(auth_url)


@api_view(['GET'])
@csrf_exempt
def github_callback(request):
    code = request.GET.get('code')
    if not code:
        return Response({'error': 'Missing code'}, status=status.HTTP_400_BAD_REQUEST)
    client_id = getattr(settings, 'GITHUB_CLIENT_ID', None)
    client_secret = getattr(settings, 'GITHUB_CLIENT_SECRET', None)
    if not client_id or not client_secret:
        return Response({'error': 'GitHub OAuth not configured on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    callback_path = reverse('github_callback')
    redirect_uri = request.build_absolute_uri(callback_path)
    # exchange code for access token
    token_resp = requests.post('https://github.com/login/oauth/access_token', data={
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_uri
    }, headers={'Accept': 'application/json'})
    if token_resp.status_code != 200:
        return Response({'error': 'Failed to obtain token from GitHub', 'details': token_resp.text}, status=status.HTTP_400_BAD_REQUEST)
    token_data = token_resp.json()
    access_token = token_data.get('access_token')
    if not access_token:
        return Response({'error': 'No access_token returned by GitHub'}, status=status.HTTP_400_BAD_REQUEST)
    # fetch user info
    user_resp = requests.get('https://api.github.com/user', headers={'Authorization': f'token {access_token}', 'Accept': 'application/json'})
    if user_resp.status_code != 200:
        return Response({'error': 'Failed to fetch GitHub user', 'details': user_resp.text}, status=status.HTTP_400_BAD_REQUEST)
    u = user_resp.json()
    # try to get primary email
    email = u.get('email')
    if not email:
        emails_resp = requests.get('https://api.github.com/user/emails', headers={'Authorization': f'token {access_token}', 'Accept': 'application/json'})
        if emails_resp.status_code == 200:
            emails = emails_resp.json()
            primary = next((e for e in emails if e.get('primary') and e.get('verified')), None)
            if primary:
                email = primary.get('email')
            elif emails:
                email = emails[0].get('email')
    username = u.get('login') or (email.split('@')[0] if email else f'gh_{u.get("id")}')
    user, created = User.objects.get_or_create(email=email, defaults={'username': username, 'password': '', 'role': 'candidate'})
    payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    if isinstance(token, bytes): token = token.decode('utf-8')
    frontend = getattr(settings, 'FRONTEND_URL', 'http://127.0.0.1:5173')
    redirect_to = f"{frontend}/#/signin?token={token}&username={user.username}&role={user.role}"
    return redirect(redirect_to)
