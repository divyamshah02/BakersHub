from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime
from .models import Order, OrderItem, Category
from .serializers import OrderSerializer, OrderItemSerializer, CategorySerializer
from utils.decorators import handle_exceptions, check_authentication  # assuming your decorators path


class OrderViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication
    def list(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Missing user_id."
            }, status=status.HTTP_400_BAD_REQUEST)

        orders = Order.objects.filter(user_id=user_id, is_active=True)

        # Filters
        customer_name = request.query_params.get('customer_name')
        customer_number = request.query_params.get('customer_number')
        delivery_date_from = request.query_params.get('delivery_from')
        delivery_date_to = request.query_params.get('delivery_to')
        created_month = request.query_params.get('created_month')
        created_year = request.query_params.get('created_year')

        if customer_name:
            orders = orders.filter(customer_name__icontains=customer_name)
        if customer_number:
            orders = orders.filter(customer_number__icontains=customer_number)
        if delivery_date_from and delivery_date_to:
            orders = orders.filter(delivery__date__range=[delivery_date_from, delivery_date_to])
        elif delivery_date_from:
            orders = orders.filter(delivery__date=delivery_date_from)
        if created_month and created_year:
            orders = orders.filter(created_at__month=int(created_month), created_at__year=int(created_year))
        elif created_year:
            orders = orders.filter(created_at__year=int(created_year))

        serializer = OrderSerializer(orders, many=True)
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
        data = request.data
        user_id = request.user.user_id
        customer_name = data.get('customer_name')
        customer_number = data.get('customer_number')
        delivery = data.get('delivery')
        extra_note = data.get('extra_note')
        status_val = data.get('status', 'pending')
        items = data.get('items', [])

        if not all([user_id, customer_name, delivery, items]):
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Missing required fields or items."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create order
        order = Order.objects.create(
            user_id=user_id,
            customer_name=customer_name,
            customer_number=customer_number,
            delivery=delivery,
            extra_note=extra_note,
            status=status_val,
            is_active=True
        )

        # Handle order items
        for item in items:
            product = item.get('product')
            category_name = item.get('category')
            quantity = item.get('quantity')
            unit = item.get('unit')
            price = item.get('price')

            # Check / create category for user
            if category_name:
                category_obj, _ = Category.objects.get_or_create(
                    user_id=user_id,
                    category=category_name,
                    defaults={"is_active": True}
                )
            OrderItem.objects.create(
                order=order,
                product=product,
                category=category_name,
                quantity=quantity,
                unit=unit,
                price=price,
                is_active=True
            )

        serializer = OrderSerializer(order)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_201_CREATED)

    @handle_exceptions
    @check_authentication
    def update(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk, is_active=True)
        except Order.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Order not found."
            }, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        order.customer_name = data.get('customer_name', order.customer_name)
        order.customer_number = data.get('customer_number', order.customer_number)
        order.delivery = data.get('delivery', order.delivery)
        order.extra_note = data.get('extra_note', order.extra_note)
        order.status = data.get('status', order.status)
        order.save()

        serializer = OrderSerializer(order)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication
    def partial_update(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk, is_active=True)
        except Order.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Order not found."
            }, status=status.HTTP_404_NOT_FOUND)

        status_val = request.data.get('status')
        if status_val:
            order.status = status_val
            order.save()

        serializer = OrderSerializer(order)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication
    def delete(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk, is_active=True)
        except Order.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Order not found."
            }, status=status.HTTP_404_NOT_FOUND)

        order.is_active = False
        order.save()

        # Soft delete order items
        order.items.update(is_active=False)

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": f"Order {order.order_id} deleted successfully.",
            "error": None
        }, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication
    def list(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Missing user_id."
            }, status=status.HTTP_400_BAD_REQUEST)

        categories = Category.objects.filter(user_id=user_id, is_active=True)
        serializer = CategorySerializer(categories, many=True)
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
        user_id = request.data.get('user_id')
        category_name = request.data.get('category')
        if not all([user_id, category_name]):
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Missing user_id or category."
            }, status=status.HTTP_400_BAD_REQUEST)

        category, created = Category.objects.get_or_create(
            user_id=user_id,
            category=category_name,
            defaults={"is_active": True}
        )
        serializer = CategorySerializer(category)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_201_CREATED)

    @handle_exceptions
    @check_authentication
    def update(self, request, pk=None):
        try:
            category = Category.objects.get(pk=pk, is_active=True)
        except Category.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Category not found."
            }, status=status.HTTP_404_NOT_FOUND)

        category_name = request.data.get('category')
        if category_name:
            category.category = category_name
            category.save()

        serializer = CategorySerializer(category)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication
    def delete(self, request, pk=None):
        try:
            category = Category.objects.get(pk=pk, is_active=True)
        except Category.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Category not found."
            }, status=status.HTTP_404_NOT_FOUND)

        category.is_active = False
        category.save()

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": f"Category {category.category} deleted successfully.",
            "error": None
        }, status=status.HTTP_200_OK)

