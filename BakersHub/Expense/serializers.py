from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ("expense_id", "created_at", "is_active")

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.expense_bill:
            rep["expense_bill"] = instance.expense_bill.url
        return rep
