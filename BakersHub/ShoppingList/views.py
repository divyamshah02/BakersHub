from rest_framework import viewsets, status
from rest_framework.response import Response

from django.utils.dateparse import parse_date

from .models import ShoppingList, ShoppingListItem
from .serializers import ShoppingListSerializer, ShoppingListItemSerializer

from utils.decorators import handle_exceptions, check_authentication  # your custom decorators


class ShoppingListViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication()
    def list(self, request):
        user_id = request.query_params.get("user_id")
        list_id = request.query_params.get("list_id")
        created_from = request.query_params.get("created_from")
        created_to = request.query_params.get("created_to")
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        qs = ShoppingList.objects.filter(is_active=True)

        if user_id:
            qs = qs.filter(user_id=user_id)
        if list_id:
            qs = qs.filter(list_id=list_id)

        if created_from and created_to:
            qs = qs.filter(created_at__range=[parse_date(created_from), parse_date(created_to)])
        elif month and year:
            qs = qs.filter(created_at__month=month, created_at__year=year)

        serializer = ShoppingListSerializer(qs[::-1], many=True)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication()
    def create(self, request):
        serializer = ShoppingListSerializer(data=request.data)
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
    @check_authentication()
    def update(self, request, pk=None):
        try:
            shopping_list = ShoppingList.objects.get(pk=pk, is_active=True)
        except ShoppingList.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Shopping list not found"
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ShoppingListSerializer(shopping_list, data=request.data, partial=True)
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
    @check_authentication()
    def delete(self, request, pk=None):
        try:
            shopping_list = ShoppingList.objects.get(pk=pk, is_active=True)
        except ShoppingList.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Shopping list not found"
            }, status=status.HTTP_404_NOT_FOUND)

        shopping_list.is_active = False
        shopping_list.save()
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": "Shopping list deleted successfully",
            "error": None
        }, status=status.HTTP_200_OK)


class ShoppingListItemViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication()
    def list(self, request):
        list_id = request.query_params.get("list_id")
        is_bought = request.query_params.get("is_bought")
        created_from = request.query_params.get("created_from")
        created_to = request.query_params.get("created_to")

        qs = ShoppingListItem.objects.filter(shopping_list__list_id=list_id, is_active=True)

        # if list_id:
        #     qs = qs.filter(shopping_list__list_id=list_id)
        if is_bought is not None:
            qs = qs.filter(is_bought=(is_bought.lower() == "true"))
        if created_from and created_to:
            qs = qs.filter(created_at__range=[parse_date(created_from), parse_date(created_to)])

        serializer = ShoppingListItemSerializer(qs, many=True)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication()
    def create(self, request):
        serializer = ShoppingListItemSerializer(data=request.data)
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
    @check_authentication()
    def update(self, request, pk=None):
        try:
            item = ShoppingListItem.objects.get(pk=pk)
        except ShoppingListItem.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Item not found"
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ShoppingListItemSerializer(item, data=request.data, partial=True)
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
    @check_authentication()
    def partial_update(self, request, pk=None):
        try:
            shopping_list_item = ShoppingListItem.objects.get(pk=pk, is_active=True)
        except ShoppingListItem.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "shopping_list_item not found."
            }, status=status.HTTP_404_NOT_FOUND)

        is_bought = request.data.get('is_bought')
        bought_amount = request.data.get('bought_amount')
        if is_bought is True:
            shopping_list_item.is_bought = is_bought
            shopping_list_item.bought_amount = bought_amount
            shopping_list_item.save()

        serializer = ShoppingListItemSerializer(shopping_list_item)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication()
    def delete(self, request, pk=None):
        try:
            item = ShoppingListItem.objects.get(pk=pk)
        except ShoppingListItem.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Item not found"
            }, status=status.HTTP_404_NOT_FOUND)

        item.is_active = False
        item.save()
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": "Item deleted successfully",
            "error": None
        }, status=status.HTTP_200_OK)

