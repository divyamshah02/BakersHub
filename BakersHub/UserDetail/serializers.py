from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "role", "user_id", "name", "contact_number", "email", "company_name", "company_city", "company_state", "company_pincode", "company_address", "device_id", "created_at", "active_user"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if 'contact_number' in representation:
            representation['contact_number'] = str(representation['contact_number']).replace("+91", "")

        return representation


class OTPVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTPVerification
        fields = '__all__'

