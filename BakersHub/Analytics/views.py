from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime

from Order.models import *
from Order.serializers import *

from Expense.models import *
from Expense.serializers import *

from utils.decorators import handle_exceptions, check_authentication
from dateutil.relativedelta import relativedelta


class DashboardViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication()
    def list(self, request):
        user_id = request.user.user_id
        orders = Order.objects.filter(user_id=user_id, is_active=True)
        expenses = Expense.objects.filter(user_id=user_id, is_active=True)

        filter_type = request.query_params.get('filter_type', 'this_month')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        now = datetime.now()
        period_label = ""

        if filter_type == 'this_month':
            orders = orders.filter(created_at__month=now.month, created_at__year=now.year)
            expenses = expenses.filter(created_at__month=now.month, created_at__year=now.year)
            period_label = now.strftime("%B, %Y")  # e.g., June, 2025

        elif filter_type == 'last_month':
            last_month = now - relativedelta(months=1)
            orders = orders.filter(created_at__month=last_month.month, created_at__year=last_month.year)
            expenses = expenses.filter(created_at__month=last_month.month, created_at__year=last_month.year)
            period_label = last_month.strftime("%B, %Y")

        elif filter_type == 'last_year_this_month':
            orders = orders.filter(created_at__month=now.month, created_at__year=now.year - 1)
            expenses = expenses.filter(created_at__month=now.month, created_at__year=now.year - 1)
            period_label = f"{now.strftime('%B')}, {now.year - 1}"

        elif filter_type == 'this_year_fy':
            if now.month >= 4:
                fy_start = datetime(now.year, 4, 1)
                fy_end = datetime(now.year + 1, 3, 31, 23, 59, 59)
                period_label = f"FY {now.year}-{now.year + 1}"
            else:
                fy_start = datetime(now.year - 1, 4, 1)
                fy_end = datetime(now.year, 3, 31, 23, 59, 59)
                period_label = f"FY {now.year - 1}-{now.year}"
            orders = orders.filter(created_at__gte=fy_start, created_at__lte=fy_end)
            expenses = expenses.filter(created_at__gte=fy_start, created_at__lte=fy_end)

        elif filter_type == 'this_year':
            orders = orders.filter(created_at__year=now.year)
            expenses = expenses.filter(created_at__year=now.year)
            period_label = f"Year {now.year}"

        elif filter_type == 'custom_range':
            if start_date and end_date:
                try:
                    start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
                    end_datetime = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
                    orders = orders.filter(created_at__gte=start_datetime, created_at__lte=end_datetime)
                    expenses = expenses.filter(created_at__gte=start_datetime, created_at__lte=end_datetime)
                    period_label = f"{start_datetime.strftime('%d %B %Y')} – {end_datetime.strftime('%d %B %Y')}"
                except ValueError:
                    return Response({
                        "success": False,
                        "user_not_logged_in": False,
                        "user_unauthorized": False,
                        "data": None,
                        "error": "Invalid date format. Use YYYY-MM-DD."
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    "success": False,
                    "user_not_logged_in": False,
                    "user_unauthorized": False,
                    "data": None,
                    "error": "start_date and end_date are required for custom_range filter."
                }, status=status.HTTP_400_BAD_REQUEST)

        # (Keep rest of your order/expense calculations as is)
        order_data = OrderSerializer(orders.order_by('-created_at')[:5], many=True).data
        expenses_data = ExpenseSerializer(expenses.order_by('-created_at')[:5], many=True).data

        total_sales = 0
        total_completed_sales = 0
        for order in orders.all():
            if order.status == 'completed':
                total_completed_sales += 1
                for item in order.items.all():
                    total_sales += float(item.price)

        total_expenses = sum(float(e.expense_amount) for e in expenses.all())

        data = {
            'period_label': period_label,  # ✅ Added this
            'total_completed_sales': total_completed_sales,
            'total_sales': total_sales,
            'total_expenses': total_expenses,
            'total_profit': total_sales - total_expenses,
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
