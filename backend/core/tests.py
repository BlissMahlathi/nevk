import json
from urllib.parse import parse_qs, urlparse

from django.test import TestCase, override_settings

from .models import Order


@override_settings(WHATSAPP_ORDER_NUMBER="27715231720")
class CoreApiTests(TestCase):
    def test_health_check_allows_local_vite_origin(self):
        response = self.client.get(
            "/api/health/",
            HTTP_ORIGIN="http://localhost:8080",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Backend is working"})
        self.assertEqual(response["Cache-Control"], "no-store")
        self.assertEqual(
            response["Access-Control-Allow-Origin"],
            "http://localhost:8080",
        )
        self.assertIn("Origin", response["Vary"])

    def test_create_whatsapp_order_persists_order_and_items(self):
        payload = {
            "customer_name": "Hlulani",
            "customer_phone": "0712345678",
            "note": "Please include gift packaging.",
            "items": [
                {"name": "Rose Shine", "quantity": 2, "price": 120},
                {"name": "Coffee Scrub", "quantity": 1, "price": 50},
            ],
        }

        response = self.client.post(
            "/api/orders/whatsapp/",
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["subtotal"], 290.0)
        self.assertEqual(body["item_count"], 3)
        self.assertEqual(response["Cache-Control"], "no-store")

        order = Order.objects.get(pk=body["order_id"])
        self.assertEqual(order.status, Order.STATUS_SENT_TO_WHATSAPP)
        self.assertEqual(order.customer_name, "Hlulani")
        self.assertEqual(order.items.count(), 2)

        parsed_url = urlparse(body["whatsapp_url"])
        self.assertEqual(parsed_url.scheme, "https")
        self.assertEqual(parsed_url.netloc, "wa.me")
        self.assertTrue(parsed_url.path.endswith("/27715231720"))
        message = parse_qs(parsed_url.query)["text"][0]
        self.assertIn("Rose Shine x2 - R 240.00", message)
        self.assertIn("Coffee Scrub x1 - R 50.00", message)
        self.assertIn("Subtotal: R 290.00", message)

    def test_create_whatsapp_order_requires_items(self):
        response = self.client.post(
            "/api/orders/whatsapp/",
            data=json.dumps({"items": []}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {"detail": "items must be a non-empty list."},
        )
