from django.urls import re_path

from . import views

urlpatterns = [
    re_path("^flatpage/$", views.flatpage, name="flatpage"),
    re_path("^configuration/$", views.configuration, name="configuration"),
    re_path(
        "^connection_info/$", views.connection_info, name="connection_info"
    ),
    re_path(
        "^send_system_message/$",
        views.send_system_message,
        name="send_system_message",
    ),
]
