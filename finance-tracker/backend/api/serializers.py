from rest_framework import serializers
from .models import User, Goal, Transaction, GoalTransaction, Asset
from django.contrib.auth import authenticate
from rest_framework.validators import UniqueValidator

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="This email is already registered."
            )
        ]
    )

    username = serializers.CharField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="This username is already taken."
            )
        ]
    )

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
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'), 
                             email=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            data['user'] = user
        else:
            raise serializers.ValidationError("Email and password are required")
        return data

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ['id', 'user', 'name', 'value']
        read_only_fields = ['user', 'id']  # user and id set by backend

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'date', 'amount', 'type', 'category', 'description']
        read_only_fields = ['id']

class GoalTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalTransaction
        fields = '__all__'
        
class GoalSerializer(serializers.ModelSerializer):
    current_amount = serializers.DecimalField(source='get_current_amount', max_digits=15, decimal_places=2, read_only=True)
    goal_transactions = GoalTransactionSerializer(source='goaltransaction_set', many=True, read_only=True)

    class Meta:
        model = Goal
        fields = ['id', 'user', 'name', 'target_amount', 'current_amount', 'goal_transactions']
        read_only_fields = ['user', 'current_amount', 'goal_transactions']



class FullUserSerializer(serializers.ModelSerializer):
    assets = AssetSerializer(many=True, source='asset_set')
    transactions = TransactionSerializer(many=True, source='transaction_set')
    goals = GoalSerializer(many=True, source='goal_set')

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'date_joined', 'assets', 'transactions', 'goals']
