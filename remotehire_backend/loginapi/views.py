from .models import User
from rest_framework.decorators import api_view
from .serializer import UserSerializer
from rest_framework import status
from rest_framework.response import Response

@api_view(['POST'])
def register_user(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Register Successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
def login_user(request):
    username=request.data.get('username')
    password=request.data.get('password')
    try:
        user =User.objects.get(username=username, password=password)
        serializer = UserSerializer(user)
        return Response({"message":"Login Successfully"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
