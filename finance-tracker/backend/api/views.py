from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import path
from django.contrib.auth import authenticate
from .serializers import  UserSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action


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
        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return Response({
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "access": access_token,
            "refresh": refresh_token
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
    http_method_names = ['get', 'post', 'patch', 'delete']

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

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear_transactions(self, request):
        transactions = Transaction.objects.filter(user=self.request.user)
        count = transactions.count()
        transactions.delete()
        return Response({'message': f'Successfully deleted {count} transactions.'})


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
        return GoalTransaction.objects.filter(goal__user=self.request.user)

    def perform_create(self, serializer):
        goal = serializer.validated_data['goal']
        amount = serializer.validated_data['amount']

        # Ensure user owns the goal
        if goal.user != self.request.user:
            raise ValidationError("You do not own this goal.")

        # Calculate current_amount before the new transaction
        current_amount = goal.get_current_amount() or 0
        new_amount = current_amount + amount

        # Check if new_amount would exceed target_amount
        if new_amount > goal.target_amount:
            raise ValidationError(
                f"Transaction would exceed goal target of ${goal.target_amount:.2f}. "
                f"Current: ${current_amount:.2f}, Maximum additional amount: ${(goal.target_amount - current_amount):.2f}."
            )

        serializer.save()

    def perform_update(self, serializer):
        goal = serializer.validated_data['goal']
        amount = serializer.validated_data['amount']

        # Ensure user owns the goal
        if goal.user != self.request.user:
            raise ValidationError("You do not own this goal.")

        # Calculate current_amount excluding the transaction being updated
        transaction = self.get_object()
        current_amount = goal.get_current_amount() - transaction.amount
        new_amount = current_amount + amount

        # Check if new_amount would exceed target_amount
        if new_amount > goal.target_amount:
            raise ValidationError(
                f"Transaction would exceed goal target of ${goal.target_amount:.2f}. "
                f"Current: ${current_amount:.2f}, Maximum additional amount: ${(goal.target_amount - current_amount):.2f}."
            )

        serializer.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def full_user_data(request):
    user = request.user
    serializer = FullUserSerializer(user)
    return Response(serializer.data)
