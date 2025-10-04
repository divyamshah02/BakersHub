from rest_framework import serializers
from .models import ShoppingList, ShoppingListItem

class ShoppingListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingListItem
        fields = "__all__"
        read_only_fields = ("item_id", "created_at")

class ShoppingListSerializer(serializers.ModelSerializer):
    # items = ShoppingListItemSerializer(many=True, read_only=True)

    class Meta:
        model = ShoppingList
        fields = "__all__"
        read_only_fields = ("list_id", "created_at", "is_active")

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        
        items_obj = ShoppingListItem.objects.filter(shopping_list__list_id=rep['list_id'], is_active=True)
        items = ShoppingListItemSerializer(items_obj, many=True).data
        rep["items"] = items
        return rep
