from django.contrib import admin
from .models import Order, OrderItem, Category

class OrderItemInline(admin.TabularInline):  # or StackedInline
    model = OrderItem
    extra = 1  # show 1 empty row for quick adding
    fields = ("product", "category", "quantity", "unit", "price", "is_active")
    show_change_link = True

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_id", "user_id", "customer_name", "customer_number", "delivery", "status", "created_at", "is_active")
    list_filter = ("status", "is_active", "created_at")
    search_fields = ("order_id", "user_id", "customer_name", "customer_number")
    inlines = [OrderItemInline]  # 👈 show order items inline

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "user_id", "category", "created_at", "is_active")
    list_filter = ("is_active", "created_at")
    search_fields = ("category", "user_id")
