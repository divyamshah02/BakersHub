from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('user-api/', include('UserDetail.urls')),
    path('product-api/', include('Product.urls')),
    path('inventory-api/', include('Inventory.urls')),
    path('order-api/', include('Order.urls')),
    path('shoppinglist-api/', include('ShoppingList.urls')),
    path('expense-api/', include('Expense.urls')),
    
    # path('', include('FrontEnd.urls')),
]
