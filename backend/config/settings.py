"""
Django settings for Nevk Cosmetics.
"""

import os
import sys
from pathlib import Path

import dj_database_url
from decouple import config, Csv
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent
RUNNING_TESTS = "test" in sys.argv
DEFAULT_LOCAL_FRONTEND_ORIGINS = ",".join(
    [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
)

TRUE_VALUES = {"1", "true", "t", "yes", "y",
               "on", "debug", "development", "dev"}
FALSE_VALUES = {"0", "false", "f", "no", "n",
                "off", "release", "production", "prod"}


def env_bool(name, default=False):
    raw_value = config(name, default=None)
    if raw_value is None:
        return default

    normalized = str(raw_value).strip().lower()
    if normalized in TRUE_VALUES:
        return True
    if normalized in FALSE_VALUES:
        return False

    raise ImproperlyConfigured(
        f"{name} must be a boolean-like value, got {raw_value!r}."
    )


def env_csv(name, default=""):
    return [
        item.strip()
        for item in config(name, default=default, cast=Csv())
        if str(item).strip()
    ]


SECRET_KEY = config("SECRET_KEY")
DEBUG = env_bool("DEBUG", default=False)

# Start with explicit local hosts
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

# Add hosts from env
env_hosts = env_csv("ALLOWED_HOSTS")
for host in env_hosts:
    host = host.strip()
    if host and host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(host)

# Add Render hostname automatically
render_host = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if render_host and render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_host)

# Add hostnames exposed by common hosting providers.
platform_hosts = [
    os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip(),
    os.environ.get("APP_HOSTNAME", "").strip(),
]
for platform_host in platform_hosts:
    if platform_host and platform_host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(platform_host)

fly_app_name = os.environ.get("FLY_APP_NAME", "").strip()
if fly_app_name:
    fly_host = f"{fly_app_name}.fly.dev"
    if fly_host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(fly_host)

heroku_app_name = os.environ.get("HEROKU_APP_NAME", "").strip()
if heroku_app_name:
    heroku_host = f"{heroku_app_name}.herokuapp.com"
    if heroku_host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(heroku_host)

ADMIN_URL = config("ADMIN_URL", default="secure-admin/").strip("/") + "/"
ADMIN_ALLOWED_IPS = env_csv("ADMIN_ALLOWED_IPS")
ADMIN_ALLOWED_HOSTS = env_csv("ADMIN_ALLOWED_HOSTS")

if not DEBUG and not ALLOWED_HOSTS:
    raise ImproperlyConfigured(
        "ALLOWED_HOSTS must be configured when DEBUG=False.")

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default=DEFAULT_LOCAL_FRONTEND_ORIGINS,
    cast=Csv(),
)
CORS_ALLOWED_ORIGINS = [origin.strip()
                        for origin in CORS_ALLOWED_ORIGINS if origin.strip()]

CORS_ALLOWED_ORIGIN_REGEXES = config(
    "CORS_ALLOWED_ORIGIN_REGEXES",
    default="",
    cast=Csv(),
)
CORS_ALLOWED_ORIGIN_REGEXES = [
    regex.strip() for regex in CORS_ALLOWED_ORIGIN_REGEXES if regex.strip()]

CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default=DEFAULT_LOCAL_FRONTEND_ORIGINS,
    cast=Csv(),
)
CSRF_TRUSTED_ORIGINS = [origin.strip()
                        for origin in CSRF_TRUSTED_ORIGINS if origin.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "catalog",
    "core",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "core.middleware.AdminAccessControlMiddleware",
    "django.middleware.gzip.GZipMiddleware",
    "core.middleware.ApiCacheControlMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {
    "default": {
        "ENGINE": config("DB_ENGINE", default="django.db.backends.sqlite3"),
        "NAME": config("DB_NAME", default=str(BASE_DIR / "db.sqlite3")),
        "USER": config("DB_USER", default=""),
        "PASSWORD": config("DB_PASSWORD", default=""),
        "HOST": config("DB_HOST", default=""),
        "PORT": config("DB_PORT", default=""),
        "CONN_MAX_AGE": config("DB_CONN_MAX_AGE", default=60, cast=int),
    }
}

database_url = config("DATABASE_URL", default="").strip()
if database_url:
    DATABASES["default"] = dj_database_url.parse(
        database_url,
        conn_max_age=config("DB_CONN_MAX_AGE", default=60, cast=int),
        ssl_require=env_bool("DB_SSL_REQUIRE", default=not DEBUG),
    )

if RUNNING_TESTS:
    DATABASES["default"] = {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": str(BASE_DIR / "test_db.sqlite3"),
    }

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Johannesburg"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
WHITENOISE_MAX_AGE = config(
    "WHITENOISE_MAX_AGE",
    default=0 if DEBUG else 31536000,
    cast=int,
)

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
}

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", default=not DEBUG)
SESSION_COOKIE_SECURE = env_bool("SESSION_COOKIE_SECURE", default=not DEBUG)
CSRF_COOKIE_SECURE = env_bool("CSRF_COOKIE_SECURE", default=not DEBUG)
SECURE_HSTS_SECONDS = config(
    "SECURE_HSTS_SECONDS",
    default=0 if DEBUG else 31536000,
    cast=int,
)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=not DEBUG,
)
SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", default=not DEBUG)
SECURE_REFERRER_POLICY = config(
    "SECURE_REFERRER_POLICY",
    default="same-origin" if DEBUG else "strict-origin-when-cross-origin",
)
X_FRAME_OPTIONS = config("X_FRAME_OPTIONS", default="DENY")

if RUNNING_TESTS:
    # Keep production defaults strict, but avoid redirect/cookie behavior
    # that breaks local test clients when DEBUG is forced off.
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False

WHATSAPP_ORDER_NUMBER = config("WHATSAPP_ORDER_NUMBER", default="")
FRONTEND_APP_URL = config("FRONTEND_APP_URL", default="").strip().rstrip("/")
BG_REMOVAL_SERVICE_URL = config("BG_REMOVAL_SERVICE_URL", default="").strip()
BG_REMOVAL_SERVICE_TOKEN = config(
    "BG_REMOVAL_SERVICE_TOKEN", default="").strip()
BG_REMOVAL_TIMEOUT = config("BG_REMOVAL_TIMEOUT", default=25, cast=float)
