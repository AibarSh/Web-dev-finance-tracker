from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, LogoutView, AssetViewSet, TransactionViewSet, GoalViewSet, GoalTransactionViewSet

router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'goals', GoalViewSet)
router.register(r'goal-transactions', GoalTransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
