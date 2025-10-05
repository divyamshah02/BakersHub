from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime

from Order.models import *
from Order.serializers import *

from Expense.models import *
from Expense.serializers import *

from utils.decorators import handle_exceptions, check_authentication



class DashboardViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication()
    def list(self, request):
        user_id = request.user.user_id
        if not user_id:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Missing user_id."
            }, status=status.HTTP_400_BAD_REQUEST)

        orders = Order.objects.filter(user_id=user_id, is_active=True)
        expenses = Expense.objects.filter(user_id=user_id, is_active=True)

        created_month = request.query_params.get('created_month')
        created_year = request.query_params.get('created_year')

        if created_month and created_year:
            orders = orders.filter(created_at__month=int(created_month), created_at__year=int(created_year))
            expenses = expenses.filter(created_at__month=int(created_month), created_at__year=int(created_year))
        elif created_year:
            orders = orders.filter(created_at__year=int(created_year))
            expenses = expenses.filter(created_at__year=int(created_year))

        order_data = OrderSerializer(orders.order_by('-id')[:5], many=True).data
        expenses_data = ExpenseSerializer(expenses.order_by('-id')[:5], many=True).data

        data = {
            'order_data': order_data,
            'expenses_data': expenses_data,
        }

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": data,
            "error": None
        }, status=status.HTTP_200_OK)


