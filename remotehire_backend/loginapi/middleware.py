import jwt
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from .models import User


class JWTAuthenticationMiddleware(MiddlewareMixin):
    """Simple JWT decoding middleware.

    Looks for Authorization: Bearer <token> header, decodes it using
    settings.SECRET_KEY and sets request.user to the matching User instance.
    """
    def process_request(self, request):
        request.user = getattr(request, 'user', None)
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        # Debug: log that we saw an Authorization header (shortened)
        if auth_header:
            try:
                print('JWT_MW: HTTP_AUTHORIZATION=', auth_header[:200])
            except Exception:
                pass
        if not auth_header:
            return
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return
        token = parts[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            print('JWT_MW: payload=', {k: payload.get(k) for k in ('user_id','exp')})
            user_id = payload.get('user_id')
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    request.user = user
                    print('JWT_MW: set request.user id=', user.id, 'role=', getattr(user, 'role', None))
                except User.DoesNotExist:
                    print('JWT_MW: user id not found', user_id)
                    request.user = None
        except Exception as e:
            print('JWT_MW: jwt decode error', repr(e))
            request.user = None
