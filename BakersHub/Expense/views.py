from rest_framework import viewsets, status
from rest_framework.response import Response

from django.utils.dateparse import parse_datetime
from django.db.models import Q

from .models import Expense
from .serializers import ExpenseSerializer

from utils.decorators import handle_exceptions, check_authentication   # using your structure


class ExpenseViewSet(viewsets.ViewSet):
    
    @handle_exceptions
    @check_authentication()
    def list(self, request):
        user_id = request.query_params.get("user_id")
        expenses = Expense.objects.filter(is_active=True)
        
        # 🔎 Filters
        if user_id:
            expenses = expenses.filter(user_id=user_id)

        expense_name = request.query_params.get("expense_name")
        if expense_name:
            expenses = expenses.filter(expense_name__icontains=expense_name)

        category = request.query_params.get("expense_category")
        if category:
            expenses = expenses.filter(expense_category=category)

        # 📅 Date filter (range or month/year)
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        if start_date and end_date:
            expenses = expenses.filter(created_at__range=[start_date, end_date])

        month = request.query_params.get("month")
        year = request.query_params.get("year")
        if month and year:
            expenses = expenses.filter(created_at__month=month, created_at__year=year)

        serializer = ExpenseSerializer(expenses[::-1], many=True)
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
        serializer = ExpenseSerializer(data=request.data)
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
            expense = Expense.objects.get(pk=pk, is_active=True)
        except Expense.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Expense not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ExpenseSerializer(expense, data=request.data, partial=False)
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
            expense = Expense.objects.get(pk=pk, is_active=True)
        except Expense.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Expense not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
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
            expense = Expense.objects.get(pk=pk, is_active=True)
        except Expense.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Expense not found."
            }, status=status.HTTP_404_NOT_FOUND)

        expense.is_active = False
        expense.save()
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": "Expense soft-deleted successfully.",
            "error": None
        }, status=status.HTTP_200_OK)

