from django.urls import re_path

from . import consumers

urlpatterns = [
    re_path(
        "^(?P<document_id>[0-9]+)/$",
        consumers.WebsocketConsumer.as_asgi(),
        name="document_consumer",
    ),
]
