from django.urls import path
from .views import health_check, create_whatsapp_order

urlpatterns = [
    path("health/", health_check),
    path("orders/whatsapp/", create_whatsapp_order),
]
