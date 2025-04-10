from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PageViewSet, BlockViewSet, TransactionViewSet, RegisterView, LoginView, LogoutView

router = DefaultRouter()
router.register(r'pages', PageViewSet)
router.register(r'blocks', BlockViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
