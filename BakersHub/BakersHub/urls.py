from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('', include('FrontEnd.urls')),
    path('user-api/', include('UserDetail.urls')),
    path('product-api/', include('Product.urls')),
    path('inventory-api/', include('Inventory.urls')),
    path('order-api/', include('Order.urls')),
    path('shoppinglist-api/', include('ShoppingList.urls')),
    path('expense-api/', include('Expense.urls')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
