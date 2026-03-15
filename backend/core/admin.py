from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("name", "quantity", "unit_price", "line_total")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "customer_name",
        "customer_phone",
        "item_count",
        "subtotal",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("id", "customer_name", "customer_phone")
    readonly_fields = (
        "subtotal",
        "item_count",
        "whatsapp_number",
        "whatsapp_url",
        "created_at",
        "updated_at",
    )
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "name", "quantity",
                    "unit_price", "line_total")
    list_filter = ("order__status",)
    search_fields = ("name", "order__id")


admin.site.site_header = "Nevk Cosmetics Admin"
admin.site.site_title = "Nevk Cosmetics Admin"
admin.site.index_title = "Store Management"
