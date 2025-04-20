from django.db import models
from django.conf import settings
from datetime import date
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin



class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(
            email=self.normalize_email(email),
            username=username
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None):
        user = self.create_user(
            email=email,
            username=username,
            password=password
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
    
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    date_joined = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    
class UserSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    login_time = models.DateTimeField(default=timezone.now)
    logout_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.login_time}"
    

from django.db.models import Sum

# Model for Net Worth assets
class Asset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    value = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        unique_together = ('user', 'name')  # Ensures unique asset names per user

    def __str__(self):
        return f"{self.name} - ${self.value}"

# Model for financial transactions (Incomes and Expenses)
class Transaction(models.Model):
    INCOME = 'I'
    EXPENSE = 'E'
    TYPE_CHOICES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateTimeField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    type = models.CharField(max_length=1, choices=TYPE_CHOICES, default='E')
    category = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.get_type_display()} - ${self.amount} on {self.date}"

# Model for financial goals
class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=15, decimal_places=2)

    def get_current_amount(self):
        # Calculate current amount as the sum of all related GoalTransaction amounts
        return self.goaltransaction_set.aggregate(total=Sum('amount'))['total'] or 0

    def __str__(self):
        return f"{self.name} - Target: ${self.target_amount}"

# Model for transactions related to goals
class GoalTransaction(models.Model):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)  # Positive to add, negative to remove
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.goal.name} - ${self.amount} on {self.date}"