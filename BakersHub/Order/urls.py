from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'order-api', OrderViewSet, basename='order-api')
router.register(r'category-api', CategoryViewSet, basename='category-api')

urlpatterns = [
    path('', include(router.urls)),
]
