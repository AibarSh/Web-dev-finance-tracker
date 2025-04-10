from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from django.contrib.auth import authenticate
from .serializers import TransactionSerializer, UserSerializer
from rest_framework.authtoken.models import Token

from rest_framework import viewsets, generics, status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Page, Block,Transaction, UserSession
from .serializers import PageSerializer, BlockSerializer, LoginSerializer
from django.utils import timezone

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]


class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer

class BlockViewSet(viewsets.ModelViewSet):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "token": token.key
        }, status=status.HTTP_201_CREATED)
# Login View
class LoginView(GenericAPIView):
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, email=email, password=password)
        
        if user is not None:
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            # Save login session
            UserSession.objects.create(
                user=user,
                token=token.key,
                login_time=timezone.now(),
                is_active=True
            )
            
            return Response({
                'token': token.key,
                'user_id': user.id,
                'email': user.email,
                'username': user.username
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get user's active session
            session = UserSession.objects.get(
                user=request.user,
                token=request.auth.key,
                is_active=True
            )
            # Update session
            session.logout_time = timezone.now()
            session.is_active = False
            session.save()
            
            # Delete token
            request.auth.delete()
            
            return Response({"message": "Successfully logged out"}, 
                          status=status.HTTP_200_OK)
        except UserSession.DoesNotExist:
            return Response({"error": "No active session found"}, 
                          status=status.HTTP_400_BAD_REQUEST)