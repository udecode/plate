from django.urls import re_path

from . import views

urlpatterns = [
    re_path("^get/$", views.get_template, name="document_template_get"),
    re_path("^list/$", views.list, name="document_template_list"),
    re_path("^save/$", views.save, name="document_template_save"),
    re_path("^create/$", views.create, name="document_template_create"),
    re_path("^copy/$", views.copy, name="document_template_copy"),
    re_path("^delete/$", views.delete, name="document_template_delete"),
]
