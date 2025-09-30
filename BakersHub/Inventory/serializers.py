from rest_framework import serializers
from .models import Inventory

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = "__all__"

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["created_at"] = instance.created_at.strftime("%Y-%m-%d %H:%M:%S")
        rep["updated_at"] = instance.updated_at.strftime("%Y-%m-%d %H:%M:%S")
        return rep
