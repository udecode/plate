from django.urls import re_path

from . import views

urlpatterns = [
    re_path(
        "^delete_document_style/$",
        views.delete_document_style,
        name="delete_document_style",
    ),
    re_path(
        "^save_document_style/$",
        views.save_document_style,
        name="save_document_style",
    ),
    re_path(
        "^delete_export_template/$",
        views.delete_export_template,
        name="delete_export_template",
    ),
    re_path(
        "^save_export_template/$",
        views.save_export_template,
        name="save_export_template",
    ),
]
