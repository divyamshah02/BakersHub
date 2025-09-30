from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("expense_id", "expense_name", "expense_amount", "expense_category", "user_id", "created_at", "is_active")
    list_filter = ("expense_category", "created_at", "is_active")
    search_fields = ("expense_id", "expense_name", "user_id")
    readonly_fields = ("expense_id", "created_at")
