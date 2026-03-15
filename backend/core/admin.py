from datetime import timedelta

from django.contrib import admin
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.utils.html import format_html

from .models import Order, OrderItem


# ── Custom AdminSite – injects live stats into the index page ────────────────

class NevkAdminSite(admin.AdminSite):
    """Subclass that populates the admin index with dashboard statistics."""

    def index(self, request, extra_context=None):
        extra_context = extra_context or {}
        try:
            extra_context.update(self._dashboard_stats())
        except Exception:
            pass  # never break the admin on a DB error
        return super().index(request, extra_context)

    # ------------------------------------------------------------------
    def _dashboard_stats(self):
        from catalog.models import Category, Product  # avoid circular import

        today = timezone.now().date()
        last_7_start = today - timedelta(days=6)
        last_14_start = today - timedelta(days=13)

        # ── Products ──────────────────────────────────────────────────
        total_products = Product.objects.filter(is_active=True).count()
        low_stock_count = Product.objects.filter(
            is_active=True, stock__gt=0, stock__lt=5
        ).count()
        out_of_stock_count = Product.objects.filter(
            is_active=True, stock=0
        ).count()
        featured_count = Product.objects.filter(
            is_active=True, is_featured=True
        ).count()
        total_categories = Category.objects.filter(is_active=True).count()

        # ── Orders ────────────────────────────────────────────────────
        pending_count = Order.objects.filter(
            status=Order.STATUS_PENDING
        ).count()
        whatsapp_count = Order.objects.filter(
            status=Order.STATUS_SENT_TO_WHATSAPP
        ).count()
        confirmed_count = Order.objects.filter(
            status=Order.STATUS_CONFIRMED
        ).count()
        cancelled_count = Order.objects.filter(
            status=Order.STATUS_CANCELLED
        ).count()
        total_orders = pending_count + whatsapp_count + confirmed_count + cancelled_count
        todays_orders = Order.objects.filter(created_at__date=today).count()

        total_revenue = float(
            Order.objects.filter(status=Order.STATUS_CONFIRMED)
            .aggregate(total=Sum("subtotal"))["total"]
            or 0
        )

        # ── Revenue last 7 days (bar) ─────────────────────────────────
        rev_qs = (
            Order.objects.filter(
                status=Order.STATUS_CONFIRMED,
                created_at__date__gte=last_7_start,
            )
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(total=Sum("subtotal"))
            .order_by("day")
        )
        rev_map = {r["day"]: float(r["total"]) for r in rev_qs}
        revenue_labels, revenue_data = [], []
        for i in range(7):
            d = last_7_start + timedelta(days=i)
            revenue_labels.append(d.strftime("%b %d"))
            revenue_data.append(rev_map.get(d, 0))

        # ── Orders per day last 14 days (line) ────────────────────────
        orders_qs = (
            Order.objects.filter(created_at__date__gte=last_14_start)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(cnt=Count("id"))
            .order_by("day")
        )
        orders_map = {r["day"]: r["cnt"] for r in orders_qs}
        orders_trend_labels, orders_trend_data = [], []
        for i in range(14):
            d = last_14_start + timedelta(days=i)
            orders_trend_labels.append(d.strftime("%b %d"))
            orders_trend_data.append(orders_map.get(d, 0))

        # ── Active products per category (horizontal bar) ─────────────
        cat_qs = (
            Category.objects.filter(is_active=True)
            .annotate(
                cnt=Count("products", filter=Q(products__is_active=True))
            )
            .values("name", "cnt")
            .order_by("-cnt")[:8]
        )
        cat_labels = [c["name"] for c in cat_qs]
        cat_data = [c["cnt"] for c in cat_qs]

        return {
            "dash_total_products": total_products,
            "dash_low_stock": low_stock_count,
            "dash_out_of_stock": out_of_stock_count,
            "dash_featured": featured_count,
            "dash_total_categories": total_categories,
            "dash_total_orders": total_orders,
            "dash_pending_orders": pending_count,
            "dash_confirmed_orders": confirmed_count,
            "dash_cancelled_orders": cancelled_count,
            "dash_todays_orders": todays_orders,
            "dash_total_revenue": total_revenue,
            # Chart data (JSON-safe Python lists)
            "dash_revenue_labels": revenue_labels,
            "dash_revenue_data": revenue_data,
            "dash_orders_trend_labels": orders_trend_labels,
            "dash_orders_trend_data": orders_trend_data,
            "dash_order_status_labels": [
                "Pending", "Sent to WhatsApp", "Confirmed", "Cancelled"
            ],
            "dash_order_status_data": [
                pending_count, whatsapp_count, confirmed_count, cancelled_count
            ],
            "dash_cat_labels": cat_labels,
            "dash_cat_data": cat_data,
        }


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("name", "quantity", "unit_price", "line_total")
    can_delete = False
    ordering = ("id",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "customer_name",
        "customer_phone",
        "item_count",
        "subtotal",
        "whatsapp_chat_link",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("id", "customer_name", "customer_phone", "whatsapp_number")
    list_per_page = 30
    date_hierarchy = "created_at"
    save_on_top = True
    list_select_related = ()
    actions = ("mark_confirmed", "mark_cancelled", "mark_pending")
    readonly_fields = (
        "id",
        "subtotal",
        "item_count",
        "whatsapp_number",
        "whatsapp_url",
        "whatsapp_chat_link",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        ("Order Status", {"fields": ("status",)}),
        (
            "Customer",
            {"fields": ("customer_name", "customer_phone", "note")},
        ),
        (
            "Checkout Summary",
            {"fields": ("subtotal", "item_count")},
        ),
        (
            "WhatsApp",
            {"fields": ("whatsapp_number", "whatsapp_url", "whatsapp_chat_link")},
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
    inlines = [OrderItemInline]

    @admin.display(description="WhatsApp")
    def whatsapp_chat_link(self, obj):
        if not obj.whatsapp_url:
            return "—"
        return format_html('<a href="{}" target="_blank" rel="noopener">Open Chat</a>', obj.whatsapp_url)

    @admin.action(description="Mark selected orders as confirmed")
    def mark_confirmed(self, request, queryset):
        updated = queryset.update(status=Order.STATUS_CONFIRMED)
        self.message_user(request, f"Marked {updated} order(s) as confirmed.")

    @admin.action(description="Mark selected orders as cancelled")
    def mark_cancelled(self, request, queryset):
        updated = queryset.update(status=Order.STATUS_CANCELLED)
        self.message_user(request, f"Marked {updated} order(s) as cancelled.")

    @admin.action(description="Mark selected orders as pending")
    def mark_pending(self, request, queryset):
        updated = queryset.update(status=Order.STATUS_PENDING)
        self.message_user(request, f"Marked {updated} order(s) as pending.")


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "name", "quantity",
                    "unit_price", "line_total")
    list_filter = ("order__status",)
    search_fields = ("name", "order__id")
    list_select_related = ("order",)
    list_per_page = 50


admin.site.site_header = "Nevk Cosmetics Admin"
admin.site.site_title = "Nevk Cosmetics Admin"
admin.site.index_title = "Store Management"

# Patch the existing singleton so @admin.register decorators remain valid
admin.site.__class__ = NevkAdminSite
