from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

import random
import string
from datetime import timedelta

def generate_user_id(role_code):
    while True:
        first_digit = random.choice(string.digits[1:])  
        remaining_digits = ''.join(random.choices(string.digits, k=9))
        user_id = first_digit + remaining_digits

        user_id = role_code + user_id
        if not User.objects.filter(user_id=user_id).exists():
            return user_id

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('baker', 'Baker'),
    ]

    role = models.CharField(max_length=7, choices=ROLE_CHOICES)
    user_id = models.CharField(max_length=12, unique=True)  # Login ID
    
    name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15, unique=True)
    email = models.EmailField(null=True, blank=True)

    company_name = models.CharField(max_length=255, null=True, blank=True)
    company_city = models.CharField(max_length=60, null=True, blank=True)
    company_state = models.CharField(max_length=60, null=True, blank=True)
    company_pincode = models.CharField(max_length=10, null=True, blank=True)
    company_address = models.CharField(max_length=255, null=True, blank=True)

    device_id = models.CharField(max_length=255, blank=True, default="")

    created_at = models.DateTimeField(default=timezone.now)
    active_user = models.BooleanField(default=True)

    plan_type = models.CharField(max_length=4, choices=[('free', 'Free'), ('paid', 'Paid')])
    lifetime_free_account = models.BooleanField(default=False)

    free_plan_day = models.IntegerField(null=True, blank=True)
    free_plan_start = models.DateField(null=True, blank=True)
    free_plan_end = models.DateField(null=True, blank=True)

    paid_plan_day = models.IntegerField(null=True, blank=True)
    paid_plan_start = models.DateField(null=True, blank=True)
    paid_plan_end = models.DateField(null=True, blank=True)
    last_paid_date = models.DateField(null=True, blank=True)


    USERNAME_FIELD = 'contact_number'
    REQUIRED_FIELDS = ['role', 'username']

    def __str__(self):
        return f"{self.name} ({self.role})"

    def save(self, *args, **kwargs):
        if not self.user_id:
            role_codes = {
                'admin': 'AD',
                'baker': 'BK',
            }
            
            if not self.role:
                raise ValueError("Role must be set before saving User")

            new_user_id = generate_user_id(role_code=role_codes[self.role])
            self.user_id = new_user_id
            self.username = new_user_id

        # Handle plan logic
        if self.plan_type == 'free' and self.free_plan_start and self.free_plan_day:
            self.free_plan_end = self.free_plan_start + timedelta(days=self.free_plan_day)

        if self.plan_type == 'paid' and self.paid_plan_start and self.paid_plan_day:
            self.paid_plan_end = self.paid_plan_start + timedelta(days=self.paid_plan_day)

        super().save(*args, **kwargs)


class OTPVerification(models.Model):
    mobile = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)    
    
    is_verified = models.BooleanField(default=False)
    attempt_count = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.mobile} - {self.otp}"
