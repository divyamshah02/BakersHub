from django.db import models
from django.utils import timezone
import random
import string

def generate_inventory_id():
    while True:
        code = "IV" + ''.join(random.choices(string.digits, k=10))
        if not Inventory.objects.filter(inventory_id=code).exists():
            return code

class Inventory(models.Model):
    user_id = models.CharField(max_length=12)
    inventory_id = models.CharField(max_length=12, unique=True)

    item_name = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.inventory_id:
            self.inventory_id = generate_inventory_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.item_name} - {self.quantity}{self.unit}"
