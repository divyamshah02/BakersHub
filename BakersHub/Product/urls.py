from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'product-api', ProductViewSet, basename='product-api')
router.register(r'ingredient-api', IngredientViewSet, basename='ingredient-api')

urlpatterns = [
    path('', include(router.urls)),
]
