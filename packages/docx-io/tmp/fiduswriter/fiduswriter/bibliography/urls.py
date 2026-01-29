from django.urls import re_path

from . import views

urlpatterns = [
    re_path("^save/$", views.save, name="bibliography_save"),
    re_path("^delete/$", views.delete, name="bibliography_delete"),
    re_path(
        "^save_category/$",
        views.save_category,
        name="bibliopgraphy_save_category",
    ),
    re_path(
        "^delete_category/$",
        views.delete_category,
        name="bibliography_delete_category",
    ),
    re_path("^biblist/$", views.biblist, name="bibliography_biblist"),
]
