from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime

from Order.models import *
from Order.serializers import *

from Expense.models import *
from Expense.serializers import *

from utils.decorators import handle_exceptions, check_authentication



class DashboardViewSet_old(viewsets.ViewSet):

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

        total_sales = 0
        total_completed_sales = 0
        for order_detail in order_data:
            if order_detail['status'] == 'completed':
                total_completed_sales+=1
                for item_data in order_detail['items']:
                    total_sales+=float(item_data['price'])

        total_expenses = 0
        for expense_detail in expenses_data:
            total_expenses+=float(expense_detail['expense_amount'])

        data = {
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


from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

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

        # Get filter parameters
        filter_type = request.query_params.get('filter_type', 'this_month')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Apply filters based on filter_type
        now = datetime.now()
        
        if filter_type == 'this_month':
            # Current month
            orders = orders.filter(
                created_at__month=now.month,
                created_at__year=now.year
            )
            expenses = expenses.filter(
                created_at__month=now.month,
                created_at__year=now.year
            )
            
        elif filter_type == 'last_month':
            # Previous month
            last_month = now - relativedelta(months=1)
            orders = orders.filter(
                created_at__month=last_month.month,
                created_at__year=last_month.year
            )
            expenses = expenses.filter(
                created_at__month=last_month.month,
                created_at__year=last_month.year
            )
            
        elif filter_type == 'last_year_this_month':
            # Same month, previous year
            orders = orders.filter(
                created_at__month=now.month,
                created_at__year=now.year - 1
            )
            expenses = expenses.filter(
                created_at__month=now.month,
                created_at__year=now.year - 1
            )
            
        elif filter_type == 'this_year_fy':
            # Financial Year (April to March)
            if now.month >= 4:
                # Current FY: April this year to March next year
                fy_start = datetime(now.year, 4, 1)
                fy_end = datetime(now.year + 1, 3, 31, 23, 59, 59)
            else:
                # Current FY: April last year to March this year
                fy_start = datetime(now.year - 1, 4, 1)
                fy_end = datetime(now.year, 3, 31, 23, 59, 59)
            
            orders = orders.filter(
                created_at__gte=fy_start,
                created_at__lte=fy_end
            )
            expenses = expenses.filter(
                created_at__gte=fy_start,
                created_at__lte=fy_end
            )
            
        elif filter_type == 'this_year':
            # Calendar year (January to December)
            orders = orders.filter(created_at__year=now.year)
            expenses = expenses.filter(created_at__year=now.year)
            
        elif filter_type == 'custom_range':
            # Custom date range
            if start_date and end_date:
                try:
                    start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
                    end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
                    # Set end time to end of day
                    end_datetime = end_datetime.replace(hour=23, minute=59, second=59)
                    
                    orders = orders.filter(
                        created_at__gte=start_datetime,
                        created_at__lte=end_datetime
                    )
                    expenses = expenses.filter(
                        created_at__gte=start_datetime,
                        created_at__lte=end_datetime
                    )
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

        # Get last 5 orders and expenses (ordered by most recent)
        order_data = OrderSerializer(orders.order_by('-created_at')[:5], many=True).data
        expenses_data = ExpenseSerializer(expenses.order_by('-created_at')[:5], many=True).data

        # Calculate totals
        total_sales = 0
        total_completed_sales = 0
        
        # Calculate from all filtered orders, not just the last 5
        all_orders = orders.all()
        for order in all_orders:
            if order.status == 'completed':
                total_completed_sales += 1
                # Calculate total from order items
                for item in order.items.all():
                    total_sales += float(item.price)

        total_expenses = 0
        # Calculate from all filtered expenses, not just the last 5
        all_expenses = expenses.all()
        for expense in all_expenses:
            total_expenses += float(expense.expense_amount)

        data = {
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
