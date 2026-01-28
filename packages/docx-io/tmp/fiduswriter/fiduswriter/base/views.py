import json
import random
from httpx_ws import connect_ws
from django.contrib.auth import get_user_model
from django.conf import settings
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.flatpages.models import FlatPage
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.contrib.admin.views.decorators import staff_member_required

from allauth.socialaccount.adapter import get_adapter

from user.helpers import Avatars
from .decorators import ajax_required
from . import get_version
from .helpers.ws import get_url_base
from .models import Presence


@ensure_csrf_cookie
def app(request):
    """
    Load a page controlled by the JavaScript app.
    Used all user facing pages after login.
    """
    return render(request, "app.html", {"version": get_version()})


def api_404(request):
    """
    Show a 404 error within the API.
    """
    return render(request, "api_404.html", status=404)


@ajax_required
@require_POST
def configuration(request):
    """
    Load the configuration options of the page that are request dependent.
    """
    if len(settings.PORTS) < 2:
        ws_url_base = "/ws"
    else:
        # Get the Origin header safely with a fallback
        origin = request.headers.get("Origin")
        if not origin:
            # Use the current host as fallback
            protocol = "https" if request.is_secure() else "http"
            origin = f"{protocol}://{request.get_host()}"
        ws_url_base = get_url_base(origin, random.choice(settings.PORTS))
    socialaccount_providers = []
    for provider in get_adapter(request).list_providers(request):
        socialaccount_providers.append(
            {
                "id": provider.id,
                "name": provider.name,
                "login_url": provider.get_login_url(request),
            }
        )
    response = {
        "language": request.LANGUAGE_CODE,
        "socialaccount_providers": socialaccount_providers,
        "ws_url_base": ws_url_base,
    }
    user = request.user
    if user.is_authenticated:
        user = (
            get_user_model()
            .objects.prefetch_related("emailaddress_set", "socialaccount_set")
            .get(id=user.id)
        )
        avatars = Avatars()
        response["user"] = {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "name": user.readable_name,
            "last_name": user.last_name,
            "language": user.language,
            "avatar": avatars.get_url(user),
            "emails": [],
            "socialaccounts": [],
            "is_authenticated": True,
        }

        for emailaddress in user.emailaddress_set.all():
            email = {
                "address": emailaddress.email,
            }
            if emailaddress.primary:
                email["primary"] = True
            if emailaddress.verified:
                email["verified"] = True
            response["user"]["emails"].append(email)
        for account in user.socialaccount_set.all():
            try:
                provider_account = account.get_provider_account()
                response["user"]["socialaccounts"].append(
                    {
                        "id": account.id,
                        "provider": account.provider,
                        "name": provider_account.to_str(),
                    }
                )
            except KeyError:
                # Social account provider has been removed.
                pass
        response["user"]["waiting_invites"] = user.invites_to.exists()

    else:
        response["user"] = {"is_authenticated": False}
    return JsonResponse(response, status=200)


def manifest_json(request):
    """
    Load the manifest.json.
    """
    return render(request, "manifest.json")


# view is shown only in admin interface, so authentication is taken care of
def admin_console(request):
    """
    Load the admin console page.
    """
    return render(request, "admin/console.html")


@ajax_required
@require_GET
@staff_member_required
def connection_info(request):
    """
    Return info about currently connected clients.
    """
    response = {}
    Presence.prune()
    response["sessions"] = Presence.objects.count()
    response["users"] = (
        Presence.objects.values_list("user", flat=True).distinct().count()
    )
    return JsonResponse(response, status=200)


def send_to_server(server_url, message, headers):
    with connect_ws(
        server_url,
        headers={
            "Origin": headers["Origin"],
            "Cookie": headers["Cookie"],
            "User-Agent": "Fidus Writer",
        },
    ) as websocket:
        websocket.send_text(
            json.dumps(
                {"type": "system_message", "message": message, "s": 1, "c": 1}
            )
        )


@ajax_required
@require_POST
@staff_member_required
def send_system_message(request):
    """
    Send out a system message to all clients connected to the frontend.
    """
    response = {}
    message = request.POST["message"]

    servers = set(
        Presence.objects.values_list("server_url", flat=True).distinct()
    )

    for server in servers:
        send_to_server(server, message, dict(request.headers))

    return JsonResponse(response, status=200)


@ajax_required
@require_POST
def flatpage(request):
    """
    Models: `flatpages.flatpages`
    Context:
        flatpage
            `flatpages.flatpages` object
    """
    response = {}
    status = 404
    url = request.POST["url"]
    site_id = get_current_site(request).id
    flatpage = FlatPage.objects.filter(url=url, sites=site_id).first()
    if flatpage:
        status = 200
        response["title"] = flatpage.title
        response["content"] = flatpage.content
    return JsonResponse(response, status=status)
