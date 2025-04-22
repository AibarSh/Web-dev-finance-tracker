from rest_framework import serializers
from .models import User, Goal, Transaction, GoalTransaction, Asset


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'date_joined']
        read_only_fields = ['date_joined']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'user', 'name', 'value']
        read_only_fields = ['user', 'id']  # user and id set by backend

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class GoalSerializer(serializers.ModelSerializer):
    current_amount = serializers.DecimalField(source='get_current_amount', max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = Goal
        fields = ['id', 'user', 'name', 'target_amount', 'current_amount']

class GoalTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalTransaction
        fields = '__all__'

class FullUserSerializer(serializers.ModelSerializer):
    assets = AssetSerializer(many=True, source='asset_set')
    transactions = TransactionSerializer(many=True, source='transaction_set')
    goals = GoalSerializer(many=True, source='goal_set')

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'date_joined', 'assets', 'transactions', 'goals']
