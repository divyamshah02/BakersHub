from django.contrib import admin
from .models import Product, Ingredient

class IngredientInline(admin.TabularInline):
    model = Ingredient
    extra = 1
    fields = ("ingredient_id", "name", "quantity", "unit", "is_active")
    readonly_fields = ("ingredient_id", "created_at")

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("product_id", "product_name", "category", "user_id", "created_at", "is_active")
    list_filter = ("category", "created_at", "is_active")
    search_fields = ("product_id", "product_name", "category", "user_id")
    readonly_fields = ("product_id", "created_at")
    inlines = [IngredientInline]

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ("ingredient_id", "name", "quantity", "unit", "product", "created_at", "is_active")
    list_filter = ("unit", "created_at", "is_active")
    search_fields = ("ingredient_id", "name", "product__product_name")
    readonly_fields = ("ingredient_id", "created_at")
