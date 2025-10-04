from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'login', LoginViewSet, basename='login')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'expenses', ExpensesViewSet, basename='expenses')
router.register(r'index', IndexViewSet, basename='index')
router.register(r'orders', OrdersViewSet, basename='orders')
router.register(r'pantry', PantryViewSet, basename='pantry')
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'shopping', ShoppingViewSet, basename='shopping')

urlpatterns = [
    path('', include(router.urls)),
]
