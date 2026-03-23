from urllib.parse import quote
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Order, OrderItem
from .throttles import CheckoutRateThrottle, HealthRateThrottle


@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([HealthRateThrottle])
def health_check(_request):
    return Response({"message": "Backend is working"})


@api_view(["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def catalog_archived(_request, subpath=""):
    return Response(
        {
            "detail": "Django catalog endpoints are archived. Use Supabase for catalog data.",
            "replacement": "supabase",
            "path": subpath,
        },
        status=status.HTTP_410_GONE,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([CheckoutRateThrottle])
def create_whatsapp_order(request):
    items = request.data.get("items", [])
    customer_name = str(request.data.get("customer_name", "")).strip()
    customer_phone = str(request.data.get("customer_phone", "")).strip()
    note = str(request.data.get("note", "")).strip()

    if not isinstance(items, list) or not items:
        return Response(
            {"detail": "items must be a non-empty list."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    normalized_number = "".join(
        ch for ch in settings.WHATSAPP_ORDER_NUMBER if ch.isdigit())
    if not normalized_number:
        return Response(
            {"detail": "WhatsApp order number is not configured on the server."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    lines = []
    subtotal = Decimal("0.00")
    normalized_items = []

    for index, item in enumerate(items, start=1):
        if not isinstance(item, dict):
            return Response(
                {"detail": f"Invalid item format at position {index}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        name = str(item.get("name", "")).strip()
        try:
            quantity = int(item.get("quantity", 0) or 0)
            price = Decimal(str(item.get("price", 0) or 0))
        except (ValueError, TypeError, InvalidOperation):
            return Response(
                {"detail": f"Invalid item data at position {index}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not name or quantity <= 0 or price < 0:
            return Response(
                {"detail": f"Invalid item data at position {index}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        line_total = price * quantity
        subtotal += line_total
        lines.append(f"{index}. {name} x{quantity} - R {line_total:.2f}")
        normalized_items.append(
            {
                "name": name,
                "quantity": quantity,
                "unit_price": price,
                "line_total": line_total,
            }
        )

    message_parts = [
        "Hello Nevk Cosmetics, I would like to place this order:", "", *lines, ""]

    if customer_name:
        message_parts.append(f"Name: {customer_name}")

    if customer_phone:
        message_parts.append(f"Phone: {customer_phone}")

    message_parts.append(f"Subtotal: R {subtotal:.2f}")
    message_parts.append(
        f"Items: {sum(int(item.get('quantity', 0) or 0) for item in items)}")

    if note:
        message_parts.extend(["", f"Note: {note}"])

    message_parts.extend(
        ["", "Please confirm availability and delivery details."])

    message = "\n".join(message_parts)
    whatsapp_url = f"https://wa.me/{normalized_number}?text={quote(message)}"

    with transaction.atomic():
        order = Order.objects.create(
            status=Order.STATUS_SENT_TO_WHATSAPP,
            customer_name=customer_name,
            customer_phone=customer_phone,
            note=note,
            subtotal=subtotal,
            item_count=sum(item["quantity"] for item in normalized_items),
            whatsapp_number=normalized_number,
            whatsapp_url=whatsapp_url,
        )

        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    name=item["name"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    line_total=item["line_total"],
                )
                for item in normalized_items
            ]
        )

    return Response(
        {
            "order_id": order.id,
            "whatsapp_url": whatsapp_url,
            "subtotal": float(subtotal),
            "item_count": sum(item["quantity"] for item in normalized_items),
        },
        status=status.HTTP_200_OK,
    )
