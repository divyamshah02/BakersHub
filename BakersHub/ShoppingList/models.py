from django.db import models
from django.utils import timezone
import random
import string

def generate_list_id():
    while True:
        code = "SL" + ''.join(random.choices(string.digits, k=10))
        if not ShoppingList.objects.filter(list_id=code).exists():
            return code

def generate_list_item_id():
    while True:
        code = "SI" + ''.join(random.choices(string.digits, k=10))
        if not ShoppingListItem.objects.filter(item_id=code).exists():
            return code

class ShoppingList(models.Model):
    user_id = models.CharField(max_length=12)
    list_id = models.CharField(max_length=12, unique=True)
    name = models.CharField(max_length=255)  # e.g., "DMart List"

    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.list_id:
            self.list_id = generate_list_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ShoppingListItem(models.Model):
    shopping_list = models.ForeignKey(ShoppingList, related_name="items", on_delete=models.CASCADE)
    item_id = models.CharField(max_length=12, unique=True)

    item_name = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)

    is_bought = models.BooleanField(default=False)
    bought_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # if bought
    
    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.item_id:
            self.item_id = generate_list_item_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.item_name} - {self.quantity}{self.unit}"
