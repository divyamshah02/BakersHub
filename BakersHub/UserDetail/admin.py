from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Fields to display in list view
    list_display = ("user_id", "contact_number", "name", "role", "email", "plan_type", "active_user", "created_at")
    list_filter = ("role", "active_user", "plan_type", "company_city", "company_state")
    search_fields = ("user_id", "contact_number", "name", "email", "company_name")
    ordering = ("-created_at",)

    # Fieldsets for the detail view (grouped sections)
    fieldsets = (
        (None, {"fields": ("contact_number", "password")}),  # login credentials
        (_("Personal info"), {"fields": ("name", "email", "role", "user_id")}),
        (_("Company info"), {
            "fields": (
                "company_name",
                "company_address",
                "company_city",
                "company_state",
                "company_pincode",
            )
        }),
        (_("Plan info"), {"fields": (
            "plan_type",
            "lifetime_free_account",
            "free_plan_day",
            "free_plan_start",
            "free_plan_end",
            "paid_plan_day",
            "paid_plan_start",
            "paid_plan_end",
            "last_paid_date",
        )}),
        (_("Other details"), {"fields": ("device_id", "active_user", "created_at")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )

    # Fields to use when creating a new user from admin
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("contact_number", "name", "email", "role", "password1", "password2", "plan_type"),
        }),
    )

