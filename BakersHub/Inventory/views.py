from rest_framework import viewsets, status
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from .models import Inventory
from .serializers import InventorySerializer
from utils.decorators import handle_exceptions, check_authentication  # your custom decorators


class InventoryViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication
    def list(self, request):
        user_id = request.query_params.get("user_id")
        inventory_id = request.query_params.get("inventory_id")
        created_from = request.query_params.get("created_from")
        created_to = request.query_params.get("created_to")
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        qs = Inventory.objects.filter(is_active=True)

        if user_id:
            qs = qs.filter(user_id=user_id)
        if inventory_id:
            qs = qs.filter(inventory_id=inventory_id)
        if created_from and created_to:
            qs = qs.filter(created_at__range=[parse_date(created_from), parse_date(created_to)])
        elif month and year:
            qs = qs.filter(created_at__month=month, created_at__year=year)

        serializer = InventorySerializer(qs, many=True)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication
    def create(self, request):
        serializer = InventorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": serializer.data,
                "error": None
            }, status=status.HTTP_201_CREATED)
        return Response({
            "success": False,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": None,
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @handle_exceptions
    @check_authentication
    def update(self, request, pk=None):
        try:
            inventory = Inventory.objects.get(pk=pk, is_active=True)
        except Inventory.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Inventory item not found"
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = InventorySerializer(inventory, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": serializer.data,
                "error": None
            }, status=status.HTTP_200_OK)
        return Response({
            "success": False,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": None,
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @handle_exceptions
    @check_authentication
    def delete(self, request, pk=None):
        try:
            inventory = Inventory.objects.get(pk=pk, is_active=True)
        except Inventory.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Inventory item not found"
            }, status=status.HTTP_404_NOT_FOUND)

        inventory.is_active = False
        inventory.save()
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": "Inventory item deleted successfully",
            "error": None
        }, status=status.HTTP_200_OK)
