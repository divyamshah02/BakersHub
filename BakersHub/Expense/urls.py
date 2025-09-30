from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'expense-api', ExpenseViewSet, basename='expense-api')

urlpatterns = [
    path('', include(router.urls)),
]
