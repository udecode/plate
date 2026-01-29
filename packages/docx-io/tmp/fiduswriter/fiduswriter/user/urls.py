from django.conf.urls import include
from django.urls import re_path
from django.conf import settings
from django.views.generic import RedirectView
from . import views

urlpatterns = [
    re_path("^save/$", views.save_profile, name="save_profile"),
    re_path("^avatar/delete/$", views.delete_avatar, name="delete_avatar"),
    re_path("^avatar/upload/$", views.upload_avatar, name="upload_avatar"),
    re_path(
        "^passwordchange/$", views.password_change, name="password_change"
    ),
    re_path("^email/add/$", views.add_email, name="add_email"),
    re_path("^email/delete/$", views.delete_email, name="delete_email"),
    re_path("^email/primary/$", views.primary_email, name="primary_email"),
    re_path(
        "^socialaccountdelete/$",
        views.delete_socialaccount,
        name="delete_socialaccount",
    ),
    # Delete a user
    re_path("^delete/$", views.delete_user, name="delete_user"),
    # Show contacts
    re_path("^contacts/list/$", views.list_contacts, name="list_contacts"),
    re_path(
        "^contacts/delete/$", views.delete_contacts, name="delete_contacts"
    ),
    re_path("^invite/$", views.invite, name="invite"),
    re_path("^invites/add/$", views.invites_add, name="invites_add"),
    re_path("^invites/accept/$", views.invites_accept, name="invites_accept"),
    re_path(
        "^invites/decline/$", views.invites_decline, name="invites_decline"
    ),
    re_path(
        "^get_confirmkey_data/$",
        views.get_confirmkey_data,
        name="get_confirmkey_data",
    ),
    re_path(r"^signup/$", views.signup, name="account_signup"),
    re_path(r"^login/$", views.login, name="account_login"),
    # Authentication handling
    re_path("", include("allauth.urls")),
]

if not settings.PASSWORD_LOGIN:
    urlpatterns.insert(0, re_path("^login/$", RedirectView.as_view(url="/")))
