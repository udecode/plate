from django.urls import re_path
from . import views

urlpatterns = [
    re_path("^feedback/$", views.feedback, name="feedback"),
]
