from rest_framework import serializers
from .models import Order, OrderItem, Category


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "order", "product", "category", "quantity", "unit", "price", "created_at", "is_active"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["created_at"] = instance.created_at.strftime("%Y-%m-%d %H:%M:%S") if instance.created_at else None
        return rep


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)  # nested items

    class Meta:
        model = Order
        fields = [
            "id",
            "user_id",
            "order_id",
            "customer_name",
            "customer_number",
            "delivery",
            "extra_note",
            "status",
            "created_at",
            "is_active",
            "items"
        ]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["delivery"] = instance.delivery.strftime("%Y-%m-%d %H:%M:%S") if instance.delivery else None
        rep["created_at"] = instance.created_at.strftime("%Y-%m-%d %H:%M:%S") if instance.created_at else None
        return rep


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "user_id", "category", "created_at", "is_active"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["created_at"] = instance.created_at.strftime("%Y-%m-%d %H:%M:%S") if instance.created_at else None
        return rep
