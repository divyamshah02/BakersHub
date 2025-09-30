from django.contrib import admin
from .models import Inventory

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("inventory_id", "user_id", "item_name", "quantity", "unit", "created_at", "updated_at", "is_active")
    search_fields = ("inventory_id", "item_name", "user_id")
    list_filter = ("is_active", "created_at")
