from rest_framework.throttling import ScopedRateThrottle


class CheckoutRateThrottle(ScopedRateThrottle):
    scope = "checkout"


class HealthRateThrottle(ScopedRateThrottle):
    scope = "health"
