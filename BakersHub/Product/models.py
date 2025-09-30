from django.db import models
from django.utils import timezone
import random, string

def generate_product_id():
    while True:
        code = "PR" + ''.join(random.choices(string.digits, k=10))
        if not Product.objects.filter(product_id=code).exists():
            return code

def generate_ingredient_id():
    while True:
        code = "IN" + ''.join(random.choices(string.digits, k=10))
        if not Ingredient.objects.filter(ingredient_id=code).exists():
            return code

class Product(models.Model):
    user_id = models.CharField(max_length=12)  
    product_id = models.CharField(max_length=12, unique=True)
    product_name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=255)

    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.product_id:
            self.product_id = generate_product_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.product_name

class Ingredient(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="ingredients")
    ingredient_id = models.CharField(max_length=12, unique=True)
    name = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)  # e.g. g, kg, ml

    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.ingredient_id:
            self.ingredient_id = generate_ingredient_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.quantity}{self.unit})"
