from django.urls import re_path

from . import views

urlpatterns = [
    re_path("^save/$", views.save, name="usermedia_save"),
    re_path("^delete/$", views.delete, name="usermedia_delete"),
    re_path("^images/$", views.images, name="usermedia_images"),
    re_path(
        "^save_category/$", views.save_category, name="usermedia_save_category"
    ),
]
