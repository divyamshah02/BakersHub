from django.db import models
import random
import string

def generate_order_id():
    while True:
        first_digit = random.choice(string.digits[1:])  
        remaining_digits = ''.join(random.choices(string.digits, k=9))
        order_id = first_digit + remaining_digits

        if not Order.objects.filter(order_id=order_id).exists():
            return order_id

class Order(models.Model):
    user_id = models.CharField(max_length=12)
    order_id = models.CharField(max_length=10, unique=True)
    customer_name = models.CharField(max_length=255)
    customer_number = models.CharField(max_length=15, null=True, blank=True)
    delivery = models.DateTimeField()
    extra_note = models.TextField(null=True, blank=True)
    status = models.CharField(
        max_length=50, 
        choices=[('pending', 'Pending'), ('completed', 'Completed')], 
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.order_id:
            self.order_id = generate_order_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_id} - {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.CharField(max_length=255)
    category = models.CharField(max_length=255)
    quantity = models.IntegerField()
    unit = models.CharField(max_length=20)
    price = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.product} x{self.quantity}"


class Category(models.Model):
    user_id = models.CharField(max_length=12)
    category = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.category
