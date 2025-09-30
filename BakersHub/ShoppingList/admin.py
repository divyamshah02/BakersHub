from django.contrib import admin
from .models import ShoppingList, ShoppingListItem

class ShoppingListItemInline(admin.TabularInline):
    model = ShoppingListItem
    extra = 1

@admin.register(ShoppingList)
class ShoppingListAdmin(admin.ModelAdmin):
    list_display = ("list_id", "user_id", "name", "created_at", "is_active")
    search_fields = ("list_id", "user_id", "name")
    list_filter = ("is_active", "created_at")
    inlines = [ShoppingListItemInline]

@admin.register(ShoppingListItem)
class ShoppingListItemAdmin(admin.ModelAdmin):
    list_display = ("item_id", "shopping_list", "item_name", "quantity", "unit", "is_bought", "created_at")
    search_fields = ("item_id", "item_name", "shopping_list__list_id")
    list_filter = ("is_bought", "created_at")
