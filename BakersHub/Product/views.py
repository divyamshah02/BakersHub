from rest_framework import viewsets, status
from rest_framework.response import Response

from django.db.models import Q

from .models import Product, Ingredient
from .serializers import ProductSerializer, IngredientSerializer

from utils.decorators import handle_exceptions, check_authentication


class ProductViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication
    def list(self, request):
        product_id = request.query_params.get("product_id")
        user_id = request.user.user_id
        category = request.query_params.get("category")
        name = request.query_params.get("product_name")

        products = Product.objects.filter(is_active=True)

        if product_id:  # if a specific product is requested
            try:
                product = products.get(product_id=product_id)
                serializer = ProductSerializer(product)
                return Response({
                    "success": True,
                    "user_not_logged_in": False,
                    "user_unauthorized": False,
                    "data": serializer.data,
                    "error": None
                }, status=status.HTTP_200_OK)
            except Product.DoesNotExist:
                return Response({
                    "success": False,
                    "user_not_logged_in": False,
                    "user_unauthorized": False,
                    "data": None,
                    "error": "Product not found."
                }, status=status.HTTP_404_NOT_FOUND)

        if user_id:
            products = products.filter(user_id=user_id)

        if category:
            products = products.filter(category__icontains=category)

        if name:
            products = products.filter(product_name__icontains=name)

        serializer = ProductSerializer(products, many=True)
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
        serializer = ProductSerializer(data=request.data)
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
    @check_authentication
    def update(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk, is_active=True)
        except Product.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Product not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product, data=request.data, partial=False)
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
    @check_authentication
    def partial_update(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk, is_active=True)
        except Product.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Product not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(product, data=request.data, partial=True)
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
    @check_authentication
    def delete(self, request, pk=None):
        try:
            product = Product.objects.get(pk=pk, is_active=True)
        except Product.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Product not found."
            }, status=status.HTTP_404_NOT_FOUND)

        product.is_active = False
        product.save()
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": "Product soft-deleted successfully.",
            "error": None
        }, status=status.HTTP_200_OK)


class IngredientViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication
    def list(self, request):
        product_id = request.query_params.get("product_id")
        ingredients = Ingredient.objects.filter(is_active=True)

        if product_id:
            ingredients = ingredients.filter(product__product_id=product_id)

        serializer = IngredientSerializer(ingredients, many=True)
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
        serializer = IngredientSerializer(data=request.data)
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
    @check_authentication
    def update(self, request, pk=None):
        try:
            ingredient = Ingredient.objects.get(pk=pk, is_active=True)
        except Ingredient.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Ingredient not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = IngredientSerializer(ingredient, data=request.data, partial=False)
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
    @check_authentication
    def partial_update(self, request, pk=None):
        try:
            ingredient = Ingredient.objects.get(pk=pk, is_active=True)
        except Ingredient.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Ingredient not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = IngredientSerializer(ingredient, data=request.data, partial=True)
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
    @check_authentication
    def delete(self, request, pk=None):
        try:
            ingredient = Ingredient.objects.get(pk=pk, is_active=True)
        except Ingredient.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Ingredient not found."
            }, status=status.HTTP_404_NOT_FOUND)

        ingredient.is_active = False
        ingredient.save()
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": "Ingredient soft-deleted successfully.",
            "error": None
        }, status=status.HTTP_200_OK)

