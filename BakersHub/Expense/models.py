from django.db import models
from django.utils import timezone
import random
import string

def generate_expense_id():
    while True:
        first_digit = random.choice(string.digits[1:])  
        remaining_digits = ''.join(random.choices(string.digits, k=9))
        expense_id = "EX" + first_digit + remaining_digits
        if not Expense.objects.filter(expense_id=expense_id).exists():
            return expense_id

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('raw_material', 'Raw Material'),
        ('packaging', 'Packaging'),
        ('transport', 'Transport'),
        ('misc', 'Miscellaneous'),
    ]
    
    user_id = models.CharField(max_length=12)
    expense_id = models.CharField(max_length=12, unique=True)
    expense_name = models.CharField(max_length=255)
    expense_amount = models.DecimalField(max_digits=10, decimal_places=2)
    expense_quantity = models.IntegerField()
    expense_unit = models.CharField(max_length=50)
    expense_category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="misc")

    expense_bill = models.FileField(upload_to='expense_bills/', null=True, blank=True)
    extra_note = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.expense_id:
            self.expense_id = generate_expense_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.expense_name} ({self.expense_amount})"
