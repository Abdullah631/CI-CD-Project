from .models import User, Job, Interview
from django.db import models
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from .serializer import UserSerializer, JobSerializer, ApplicationSerializer, InterviewSerializer
import requests
from django.shortcuts import redirect
from django.urls import reverse
from rest_framework import status
from rest_framework.response import Response
import jwt
from django.conf import settings
from datetime import datetime, timedelta
from .decorators import recruiter_required
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


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
def google_oauth(request):
    """Handle Google OAuth authentication"""
    token = request.data.get('token')
    
    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            settings.GOOGLE_OAUTH_CLIENT_ID
        )
        
        # Get user info from token
        email = idinfo.get('email')
        name = idinfo.get('name', '')
        username = email.split('@')[0] if email else name.replace(' ', '_').lower()
        
        if not email:
            return Response({'error': 'Email not found in Google account'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or get user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'password': '',  # OAuth users don't have password
                'role': 'candidate'  # Default role
            }
        )
        
        # If user exists but username was different, update it
        if not created and not user.username:
            user.username = username
            user.save()
        
        # Generate JWT token
        payload = {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        jwt_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        if isinstance(jwt_token, bytes):
            jwt_token = jwt_token.decode('utf-8')
        
        return Response({
            'message': 'Login successful',
            'token': jwt_token,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        # Invalid token
        return Response({'error': f'Invalid Google token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f'Google OAuth error: {str(e)}')
        return Response({'error': 'Authentication failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@csrf_exempt
def github_oauth(request):
    """Handle GitHub OAuth authentication"""
    code = request.data.get('code')
    
    if not code:
        return Response({'error': 'Authorization code is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Exchange code for access token
        token_url = 'https://github.com/login/oauth/access_token'
        token_data = {
            'client_id': settings.GITHUB_OAUTH_CLIENT_ID,
            'client_secret': settings.GITHUB_OAUTH_CLIENT_SECRET,
            'code': code
        }
        
        token_response = requests.post(token_url, data=token_data, headers={'Accept': 'application/json'})
        token_json = token_response.json()
        
        access_token = token_json.get('access_token')
        if not access_token:
            return Response({'error': 'Failed to get access token from GitHub'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user info from GitHub
        user_url = 'https://api.github.com/user'
        headers = {'Authorization': f'token {access_token}'}
        user_response = requests.get(user_url, headers=headers)
        github_user = user_response.json()
        
        # Get email (might need separate request)
        email = github_user.get('email')
        if not email:
            email_response = requests.get('https://api.github.com/user/emails', headers=headers)
            emails = email_response.json()
            for email_obj in emails:
                if email_obj.get('primary'):
                    email = email_obj.get('email')
                    break
            if not email and emails:
                email = emails[0].get('email')
        
        username = github_user.get('login')
        
        if not email:
            return Response({'error': 'Email not found in GitHub account'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or get user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'password': '',  # OAuth users don't have password
                'role': 'candidate'
            }
        )
        
        # Generate JWT token
        payload = {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        jwt_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        if isinstance(jwt_token, bytes):
            jwt_token = jwt_token.decode('utf-8')
        
        return Response({
            'message': 'Login successful',
            'token': jwt_token,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f'GitHub OAuth error: {str(e)}')
        return Response({'error': f'Authentication failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@csrf_exempt
def linkedin_oauth(request):
    """Handle LinkedIn OAuth authentication"""
    code = request.data.get('code')
    redirect_uri = request.data.get('redirect_uri')

    if not code:
        return Response({'error': 'Authorization code is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not redirect_uri:
        return Response({'error': 'redirect_uri is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Exchange code for access token
        token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
        token_data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': settings.LINKEDIN_OAUTH_CLIENT_ID,
            'client_secret': settings.LINKEDIN_OAUTH_CLIENT_SECRET,
        }

        token_headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        token_response = requests.post(token_url, data=token_data, headers=token_headers)
        token_json = token_response.json()

        access_token = token_json.get('access_token')
        if not access_token:
            return Response({'error': 'Failed to get access token from LinkedIn'}, status=status.HTTP_400_BAD_REQUEST)

        # Get user info from LinkedIn (OpenID userinfo endpoint)
        userinfo_url = 'https://api.linkedin.com/v2/userinfo'
        headers = {'Authorization': f'Bearer {access_token}'}
        userinfo_response = requests.get(userinfo_url, headers=headers)
        userinfo = userinfo_response.json()

        email = userinfo.get('email')
        name = userinfo.get('name') or userinfo.get('given_name', '') + ' ' + userinfo.get('family_name', '')
        username = userinfo.get('preferred_username') or (email.split('@')[0] if email else None)

        # Fallback to email endpoint if email missing
        if not email:
            email_resp = requests.get(
                'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
                headers=headers,
            )
            email_json = email_resp.json()
            elements = email_json.get('elements', [])
            if elements:
                email = elements[0].get('handle~', {}).get('emailAddress')

        if not email:
            return Response({'error': 'Email not found in LinkedIn account'}, status=status.HTTP_400_BAD_REQUEST)

        if not username:
            username = email.split('@')[0]

        name = name.strip() if isinstance(name, str) else ''

        # Create or get user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'password': '',
                'role': 'candidate'
            }
        )

        # Generate JWT token
        payload = {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        jwt_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        if isinstance(jwt_token, bytes):
            jwt_token = jwt_token.decode('utf-8')

        return Response({
            'message': 'Login successful',
            'token': jwt_token,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f'LinkedIn OAuth error: {str(e)}')
        return Response({'error': f'Authentication failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    
    # Calculate similarity score based on CV metadata
    similarity_score = 0.0
    if user.cv_metadata and not user.cv_metadata.get('error'):
        from .cv_parser import calculate_similarity_score
        similarity_score = calculate_similarity_score(user.cv_metadata, job.requirements)
    
    app = Application.objects.create(
        job=job,
        applicant=user,
        similarity_score=similarity_score
    )
    from .serializer import ApplicationSerializer
    return Response({
        'message': 'Application submitted',
        'application': ApplicationSerializer(app).data,
        'similarity_score': similarity_score
    }, status=status.HTTP_201_CREATED)


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
        # Allow editing of job fields including requirements
        allowed = {'title', 'description', 'status', 'requirements'}
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


# Candidate Dashboard Endpoints

@api_view(['GET'])
@csrf_exempt
def candidate_applications(request):
    """Get all applications submitted by the authenticated candidate."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'candidate':
        return Response({'error': 'Only candidates can view applications.'}, status=status.HTTP_403_FORBIDDEN)
    
    from .models import Application
    applications = Application.objects.filter(applicant=user).select_related('job').order_by('-created_at')
    apps_data = []
    for app in applications:
        apps_data.append({
            'id': app.id,
            'job_id': app.job.id,
            'job_title': app.job.title,
            'job_description': app.job.description,
            'job_status': app.job.status,
            'recruiter': app.job.posted_by.username,
            'applied_at': app.created_at.isoformat()
        })
    return Response(apps_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@csrf_exempt
def candidate_dashboard_stats(request):
    """Get candidate dashboard statistics."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'candidate':
        return Response({'error': 'Only candidates can view this.'}, status=status.HTTP_403_FORBIDDEN)
    
    from .models import Application
    applications_count = Application.objects.filter(applicant=user).count()
    active_jobs_count = Job.objects.filter(status='active').count()
    
    return Response({
        'applications_count': applications_count,
        'active_jobs_count': active_jobs_count,
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@csrf_exempt
def candidate_withdraw_application(request, application_id):
    """Allow candidate to withdraw an application."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'candidate':
        return Response({'error': 'Only candidates can withdraw applications.'}, status=status.HTTP_403_FORBIDDEN)
    
    from .models import Application
    try:
        application = Application.objects.get(id=application_id, applicant=user)
    except Application.DoesNotExist:
        return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    application.delete()
    return Response({'message': 'Application withdrawn successfully.'}, status=status.HTTP_200_OK)


# Recruiter Dashboard Endpoints

@api_view(['GET'])
@csrf_exempt
def recruiter_dashboard_stats(request):
    """Get recruiter dashboard statistics."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'recruiter':
        return Response({'error': 'Only recruiters can view this.'}, status=status.HTTP_403_FORBIDDEN)
    
    from .models import Application
    
    # Get recruiter's jobs
    recruiter_jobs = Job.objects.filter(posted_by=user)
    active_jobs = recruiter_jobs.filter(status='active').count()
    
    # Get applications for recruiter's jobs
    applications = Application.objects.filter(job__posted_by=user)
    total_applications = applications.count()
    
    # Get active candidates (count unique applicants)
    active_candidates = applications.values('applicant').distinct().count()
    
    return Response({
        'active_jobs': active_jobs,
        'active_candidates': active_candidates,
        'total_applications': total_applications,
        'interviews_scheduled': Interview.objects.filter(recruiter=user).count(),
        'offers_sent': 5,
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@csrf_exempt
def schedule_interview(request):
    """Recruiter schedules an interview with a candidate for a job."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_norm = (getattr(user, 'role', '') or '').strip().lower()
    if role_norm != 'recruiter':
        return Response({'error': 'Only recruiters can schedule interviews.'}, status=status.HTTP_403_FORBIDDEN)

    job_id = request.data.get('job_id')
    candidate_id = request.data.get('candidate_id')
    scheduled_at = request.data.get('scheduled_at')
    if not (job_id and candidate_id and scheduled_at):
        return Response({'error': 'job_id, candidate_id, scheduled_at are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        job = Job.objects.get(id=job_id, posted_by=user)
        candidate = User.objects.get(id=candidate_id)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found or not owned by recruiter.'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'Candidate not found.'}, status=status.HTTP_404_NOT_FOUND)

    from django.utils.dateparse import parse_datetime
    dt = parse_datetime(scheduled_at)
    if not dt:
        return Response({'error': 'Invalid scheduled_at datetime (use ISO 8601).'}, status=status.HTTP_400_BAD_REQUEST)

    interview = Interview.objects.create(job=job, recruiter=user, candidate=candidate, scheduled_at=dt)
    return Response({'message': 'Interview scheduled', 'interview': InterviewSerializer(interview).data}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@csrf_exempt
def candidate_interview_response(request, interview_id):
    """Candidate accepts or declines an interview."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_norm = (getattr(user, 'role', '') or '').strip().lower()
    if role_norm != 'candidate':
        return Response({'error': 'Only candidates can respond.'}, status=status.HTTP_403_FORBIDDEN)

    action = request.data.get('action')
    if action not in ['accept', 'decline']:
        return Response({'error': 'action must be accept or decline.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        interview = Interview.objects.get(id=interview_id, candidate=user)
    except Interview.DoesNotExist:
        return Response({'error': 'Interview not found.'}, status=status.HTTP_404_NOT_FOUND)
    interview.status = 'accepted' if action == 'accept' else 'declined'
    interview.save()
    return Response({'message': f'Interview {action}ed', 'interview': InterviewSerializer(interview).data}, status=status.HTTP_200_OK)

@api_view(['GET'])
@csrf_exempt
def recruiter_interviews(request):
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    if (getattr(user, 'role', '') or '').strip().lower() != 'recruiter':
        return Response({'error': 'Only recruiters can view.'}, status=status.HTTP_403_FORBIDDEN)
    qs = Interview.objects.filter(recruiter=user).order_by('-scheduled_at')
    return Response(InterviewSerializer(qs, many=True).data, status=status.HTTP_200_OK)

@api_view(['GET'])
@csrf_exempt
def candidate_interviews(request):
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    if (getattr(user, 'role', '') or '').strip().lower() != 'candidate':
        return Response({'error': 'Only candidates can view.'}, status=status.HTTP_403_FORBIDDEN)
    qs = Interview.objects.filter(candidate=user).order_by('-scheduled_at')
    return Response(InterviewSerializer(qs, many=True).data, status=status.HTTP_200_OK)

@api_view(['GET'])
@csrf_exempt
def recruiter_job_applicants(request, job_id):
    """Get all applicants for a specific job."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'recruiter':
        return Response({'error': 'Only recruiters can view this.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        job = Job.objects.get(id=job_id, posted_by=user)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found or you do not have permission.'}, status=status.HTTP_404_NOT_FOUND)
    
    from .models import Application
    applications = Application.objects.filter(job=job).select_related('applicant').order_by('-similarity_score', '-created_at')
    
    applicants_data = []
    for app in applications:
        applicants_data.append({
            'application_id': app.id,
            'candidate_id': app.applicant.id,
            'candidate_name': app.applicant.full_name or app.applicant.username,
            'candidate_email': app.applicant.email,
            'candidate_phone': app.applicant.phone_number,
            'job_title': job.title,
            'applied_at': app.created_at.isoformat(),
            'similarity_score': round(app.similarity_score, 2),
            'status': 'Applied',
            'has_cv': bool(app.applicant.cv)
        })
    
    return Response(applicants_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@csrf_exempt
def recruiter_all_applicants(request):
    """Get all applicants for all recruiter's jobs."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'recruiter':
        return Response({'error': 'Only recruiters can view this.'}, status=status.HTTP_403_FORBIDDEN)
    
    from .models import Application
    applications = Application.objects.filter(job__posted_by=user).select_related('applicant', 'job').order_by('-similarity_score', '-created_at')
    
    applicants_data = []
    for app in applications:
        applicants_data.append({
            'application_id': app.id,
            'candidate_id': app.applicant.id,
            'candidate_name': app.applicant.full_name or app.applicant.username,
            'candidate_email': app.applicant.email,
            'candidate_phone': app.applicant.phone_number,
            'job_title': app.job.title,
            'job_id': app.job.id,
            'applied_at': app.created_at.isoformat(),
            'similarity_score': round(app.similarity_score, 2),
            'status': 'Applied',
            'has_cv': bool(app.applicant.cv)
        })
    
    return Response(applicants_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@csrf_exempt
def recruiter_recent_applicants(request):
    """Get recent applicants for recruiter."""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    role_val = getattr(user, 'role', '')
    role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
    if role_norm != 'recruiter':
        return Response({'error': 'Only recruiters can view this.'}, status=status.HTTP_403_FORBIDDEN)
    
    from .models import Application
    # Get last 5 applications
    applications = Application.objects.filter(job__posted_by=user).select_related('applicant', 'job').order_by('-created_at')[:5]
    
    applicants_data = []
    for app in applications:
        applicants_data.append({
            'application_id': app.id,
            'candidate_name': app.applicant.username,
            'job_title': app.job.title,
            'applied_at': app.created_at.isoformat(),
        })
    
    return Response(applicants_data, status=status.HTTP_200_OK)


# ==================== Candidate Profile Endpoints ====================

@api_view(['GET', 'PUT'])
@csrf_exempt
def candidate_profile(request):
    """Get or update candidate profile"""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    
    if request.method == 'GET':
        profile_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'phone_number': user.phone_number,
            'cv': user.cv.url if user.cv else None,
            'cv_metadata': user.cv_metadata,
            'cv_last_updated': user.cv_last_updated.isoformat() if user.cv_last_updated else None,
            'photo': user.photo.url if user.photo else None,
            'role': user.role,
            'joined_date': user.date.isoformat()
        }
        return Response(profile_data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        # Update profile fields
        user.full_name = request.data.get('full_name', user.full_name)
        user.phone_number = request.data.get('phone_number', user.phone_number)
        
        # Handle photo upload if provided
        if 'photo' in request.FILES:
            user.photo = request.FILES['photo']
        
        user.save()
        
        profile_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'phone_number': user.phone_number,
            'photo': user.photo.url if user.photo else None,
            'message': 'Profile updated successfully'
        }
        return Response(profile_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@csrf_exempt
def upload_cv(request):
    """Upload CV and extract metadata using Gemini"""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    
    if 'cv' not in request.FILES:
        return Response({'error': 'CV file is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    cv_file = request.FILES['cv']
    
    # Validate file is PDF or supported format
    if not cv_file.name.lower().endswith(('.pdf', '.doc', '.docx', '.txt')):
        return Response(
            {'error': 'Only PDF, DOC, DOCX, and TXT files are supported'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Save CV file
        print(f"[UPLOAD_CV] Saving CV file for user {user.id}")
        user.cv = cv_file
        user.cv_last_updated = datetime.utcnow()
        user.save()
        print(f"[UPLOAD_CV] CV file saved at: {user.cv.path}")
        
        # Extract metadata from CV using Gemini
        from .cv_parser import extract_cv_metadata
        cv_path = user.cv.path
        print(f"[UPLOAD_CV] Starting metadata extraction from {cv_path}")
        metadata = extract_cv_metadata(cv_path)
        print(f"[UPLOAD_CV] Metadata extracted: {metadata}")
        
        # Save metadata to user
        user.cv_metadata = metadata
        user.save()
        print(f"[UPLOAD_CV] Metadata saved to database")
        
        return Response({
            'message': 'CV uploaded and processed successfully',
            'cv_url': user.cv.url,
            'metadata': metadata
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"[UPLOAD_CV] CV upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to process CV: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@csrf_exempt
def get_cv_metadata(request, user_id):
    """Get CV metadata for a specific user (recruiter viewing candidate)"""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    
    try:
        candidate = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'candidate_id': candidate.id,
        'candidate_name': candidate.full_name or candidate.username,
        'candidate_email': candidate.email,
        'cv_url': candidate.cv.url if candidate.cv else None,
        'cv_metadata': candidate.cv_metadata,
        'cv_last_updated': candidate.cv_last_updated.isoformat() if candidate.cv_last_updated else None
    }, status=status.HTTP_200_OK)


# WebRTC Signaling endpoints for video interviews
interview_signals = {}  # In-memory storage: {interview_id: {'recruiter': [...], 'candidate': [...]}}

@api_view(['POST'])
@csrf_exempt
def interview_signal(request, interview_id):
    """Store WebRTC signaling data for interview"""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    
    try:
        # Verify user is part of this interview
        interview = Interview.objects.filter(id=interview_id).filter(
            models.Q(recruiter=user) | models.Q(candidate=user)
        ).first()
        
        if not interview:
            return Response({'error': 'Interview not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        signal_data = request.data.get('signal')
        user_role = request.data.get('role', '').lower()
        
        if not signal_data:
            return Response({'error': 'Signal data required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"[INTERVIEW_SIGNAL] Interview {interview_id}, From: {user_role}, Signal type: {signal_data.get('type')}")
        
        # Initialize storage for this interview
        if interview_id not in interview_signals:
            interview_signals[interview_id] = {'recruiter': [], 'candidate': []}
        
        # Store signal for the other party to retrieve
        target_role = 'candidate' if user_role == 'recruiter' else 'recruiter'
        interview_signals[interview_id][target_role].append(signal_data)
        
        print(f"[INTERVIEW_SIGNAL] Stored for {target_role}. Queue size: {len(interview_signals[interview_id][target_role])}")
        
        return Response({'message': 'Signal sent'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"[INTERVIEW_SIGNAL] Error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@csrf_exempt
def get_interview_signals(request, interview_id):
    """Retrieve pending WebRTC signals for interview"""
    user, err = _get_user_from_bearer(request)
    if err:
        return err
    
    try:
        # Verify user is part of this interview
        interview = Interview.objects.filter(id=interview_id).filter(
            models.Q(recruiter=user) | models.Q(candidate=user)
        ).first()
        
        if not interview:
            return Response({'error': 'Interview not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Determine user role
        user_role = 'recruiter' if interview.recruiter == user else 'candidate'
        
        # Get signals for this user and clear them
        if interview_id in interview_signals:
            signals = interview_signals[interview_id].get(user_role, [])
            if signals:
                print(f"[GET_SIGNALS] Interview {interview_id}, Role: {user_role}, Returning {len(signals)} signals")
                for sig in signals:
                    print(f"  - Signal type: {sig.get('type')}")
            interview_signals[interview_id][user_role] = []  # Clear after retrieval
            return Response(signals, status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"[GET_INTERVIEW_SIGNALS] Error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
