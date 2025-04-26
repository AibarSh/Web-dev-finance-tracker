from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, LogoutView, asset_detail, asset_list_create, TransactionViewSet, GoalViewSet, GoalTransactionViewSet, full_user_data
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
router = DefaultRouter()
# router.register(r'assets', AssetViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'goals', GoalViewSet)
router.register(r'goal-transactions', GoalTransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user-full-data/', full_user_data, name='user-full-data'),
    path('assets/', asset_list_create, name='asset-list-create'),
    path('assets/<int:pk>/', asset_detail, name='asset-detail'),

]
