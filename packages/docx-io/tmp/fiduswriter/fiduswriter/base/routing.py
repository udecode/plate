from importlib import import_module

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from django.urls import path
from django.core.asgi import get_asgi_application
from django.conf import settings

websocket_routes = []

for app in settings.INSTALLED_APPS:
    app_name = app.rsplit(".", 1).pop()
    # add ws consumers
    try:
        ws_urls = import_module("%s.ws_urls" % app)
    except ImportError:
        pass
    else:
        websocket_routes += [
            path(f"ws/{app_name}/", URLRouter(ws_urls.urlpatterns)),
        ]

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(websocket_routes))
        ),
    }
)
