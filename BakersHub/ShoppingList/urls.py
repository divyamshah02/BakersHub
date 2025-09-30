from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'shoppinglist-api', ShoppingListViewSet, basename='shoppinglist-api')
router.register(r'shoppinglist-item-api', ShoppingListItemViewSet, basename='shoppinglist-item-api')

urlpatterns = [
    path('', include(router.urls)),
]
