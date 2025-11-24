from functools import wraps
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings
from .models import User


def recruiter_required(func):
    @wraps(func)
    def inner(request, *args, **kwargs):
        user = getattr(request, 'user', None)
        # Attempt to decode token if middleware didn't set request.user
        if not user:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header:
                parts = auth_header.split()
                if len(parts) == 2 and parts[0].lower() == 'bearer':
                    token = parts[1]
                    try:
                        print('decorator: attempting jwt.decode for token (head)=', token[:120])
                        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                        print('decorator: payload=', {k: payload.get(k) for k in ('user_id','exp')})
                        user_id = payload.get('user_id')
                        if user_id:
                            try:
                                user = User.objects.get(id=user_id)
                                request.user = user
                            except User.DoesNotExist:
                                user = None
                    except Exception:
                        user = None

        if not user:
            return Response({'error': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
        # Debugging information
        try:
            print('decorator: user=', user)
            print('decorator: user.role=', getattr(user, 'role', None))
        except Exception:
            pass
        role_val = getattr(user, 'role', '')
        role_norm = role_val.strip().lower() if isinstance(role_val, str) else ''
        print('decorator: user role raw=', repr(role_val), 'normalized=', role_norm)
        if role_norm != 'recruiter':
            return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
        return func(request, *args, **kwargs)

    return inner
