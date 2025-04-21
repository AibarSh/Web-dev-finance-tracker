from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import path
from django.contrib.auth import authenticate
from .serializers import  UserSerializer
from rest_framework.authtoken.models import Token

from rest_framework import viewsets, generics, status, permissions
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import UserSession, Asset, Transaction, Goal, GoalTransaction
from .serializers import AssetSerializer, TransactionSerializer, GoalSerializer, GoalTransactionSerializer
from .serializers import LoginSerializer, FullUserSerializer
from django.utils import timezone

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

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
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Save login session
            UserSession.objects.create(
                user=user,
                token=access_token,
                login_time=timezone.now(),
                is_active=True
            )
            
            return Response({
                'access': access_token,
                'refresh': refresh_token,
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
        


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Asset.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalTransactionViewSet(viewsets.ModelViewSet):
    queryset = GoalTransaction.objects.all()
    serializer_class = GoalTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return transactions related to the user's goals
        return GoalTransaction.objects.filter(goal__user=self.request.user)

    def perform_create(self, serializer):
        # Make sure user owns the goal
        goal = serializer.validated_data['goal']
        if goal.user != self.request.user:
            raise PermissionError("You do not own this goal.")
        serializer.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def full_user_data(request):
    user = request.user
    serializer = FullUserSerializer(user)
    return Response(serializer.data)
