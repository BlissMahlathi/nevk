from django.urls import path

from .views import health_check, create_whatsapp_order, catalog_archived

urlpatterns = [
    path("health/", health_check),
    path("orders/whatsapp/", create_whatsapp_order),
    path("catalog/", catalog_archived),
    path("catalog/<path:subpath>/", catalog_archived),
]
