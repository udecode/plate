import os
import re

from importlib import import_module

from django.conf.urls import include
from django.urls import re_path
from django.http import HttpResponse
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.views.i18n import JavaScriptCatalog
from django.views.static import serve as static_serve

from .views import app as app_view, api_404 as api_404_view
from .views import admin_console as admin_console_view
from .views import manifest_json


admin.site.site_header = settings.ADMIN_SITE_HEADER
admin.site.site_title = settings.ADMIN_SITE_TITLE
admin.site.index_title = settings.ADMIN_INDEX_TITLE
admin.site.index_template = "admin/overview.html"
admin_site_urls = (
    [
        re_path(
            "console/",
            admin.site.admin_view(admin_console_view, cacheable=True),
            name="admin_console",
        ),
    ]
    + admin.site.urls[0],
    admin.site.urls[1],
    admin.site.urls[2],
)
# Django URLs -- Notice that these are only consulted after the
# protocol based routing in routing.py
urlpatterns = [
    re_path(
        "^robots.txt$",
        lambda r: HttpResponse(
            "User-agent: *\nDisallow: /document/\nDisallow: /bibliography/",
            content_type="text/plain",
        ),
    ),
    re_path(
        "^hello-fiduswriter$",
        lambda r: HttpResponse(
            "Hello from Fidus Writer",
            content_type="text/plain",
        ),
    ),
    re_path("^manifest.json$", manifest_json, name="manifest_json"),
    re_path(
        "^sw.js$",
        static_serve,
        {
            "document_root": os.path.join(
                settings.PROJECT_PATH, "static-transpile/js"
            ),
            "path": "sw.js",
        },
    ),
    # I18n manual language switcher
    re_path("^api/i18n/", include("django.conf.urls.i18n")),
    # I18n Javascript translations
    re_path(
        r"^api/jsi18n/$",
        JavaScriptCatalog.as_view(),
        name="javascript-catalog",
    ),
    # Admin interface
    path("admin/", admin_site_urls),
    # Login as other user
    path("admin/", include("loginas.urls")),
]
if settings.MEDIA_URL[0] == "/":
    urlpatterns += [
        # media files
        re_path(
            r"^%s(?P<path>.*)$" % re.escape(settings.MEDIA_URL.lstrip("/")),
            static_serve,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]


if not settings.DEBUG and settings.STATIC_URL[0] == "/":
    # Only serve static files from collecting folder if not running in debug mode.
    urlpatterns += [
        re_path(
            r"^%s(?P<path>.*)$" % re.escape(settings.STATIC_URL.lstrip("/")),
            static_serve,
            {"document_root": settings.STATIC_ROOT},
        ),
    ]

for app in settings.INSTALLED_APPS:
    try:
        _module = import_module("%s.urls" % app)
    except ImportError:
        pass
    else:
        app_name = app.rsplit(".", 1).pop()
        urlpatterns += [
            re_path("^api/%s/" % app_name, include("%s.urls" % app))
        ]

if hasattr(settings, "EXTRA_URLS"):
    for extra_url in settings.EXTRA_URLS:
        urlpatterns += [
            re_path(extra_url[0], include(extra_url[1])),
        ]
if not settings.DEBUG:
    urlpatterns += [
        re_path("^api/.*", api_404_view, name="api_404"),
    ]

urlpatterns += [
    re_path("^.*/$", app_view, name="app"),
    re_path("^$", app_view, name="app"),
]
