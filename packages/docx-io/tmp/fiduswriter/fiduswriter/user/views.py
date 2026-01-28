import json

from django.http import JsonResponse, HttpRequest
from django.db.models import Q
from django.contrib.auth import logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.shortcuts import HttpResponseRedirect
from django.views.decorators.http import require_POST
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.files import File

from base.decorators import ajax_required
from .forms import UserForm
from document.models import AccessRight
from .models import UserInvite
from .helpers import Avatars
from . import emails

from allauth.account.models import (
    EmailAddress,
    EmailConfirmation,
    EmailConfirmationHMAC,
)
from allauth.account.views import LoginView, SignupView
from allauth.account import signals
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.signals import social_account_removed
from django.contrib.auth.forms import PasswordChangeForm
from allauth.account.forms import AddEmailForm

from avatar.models import Avatar
from avatar import views as avatarviews
from avatar.forms import UploadAvatarForm
from avatar.signals import avatar_updated


@login_required
@ajax_required
@require_POST
def password_change(request):
    """
    Change password
    """
    response = {}
    form = PasswordChangeForm(user=request.user, data=request.POST)
    if form.is_valid():
        status = 200
        form.save()
        # Updating the password logs out all other sessions for the user
        # except the current one.
        update_session_auth_hash(request, form.user)
    else:
        response["msg"] = form.errors
        status = 201

    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def add_email(request):
    """
    Add email address
    """
    response = {}
    add_email_form = AddEmailForm(request.user, request.POST)
    if add_email_form.is_valid():
        status = 200
        email_address = add_email_form.save(request)
        signals.email_added.send(
            sender=request.user.__class__,
            request=request,
            user=request.user,
            email_address=email_address,
        )
    else:
        status = 201
        response["msg"] = add_email_form.errors

    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def delete_email(request):
    response = {}
    email = request.POST["email"]
    response["msg"] = f"Removed e-mail address {email}"
    status = 200
    email_address = EmailAddress.objects.filter(
        user=request.user, email=email, primary=False
    ).first()
    if not email_address:
        return JsonResponse({"msg": "Cannot remove email."}, status=404)
    email_address.delete()
    signals.email_removed.send(
        sender=request.user.__class__,
        request=request,
        user=request.user,
        email_address=email_address,
    )
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def primary_email(request):
    response = {}
    email = request.POST["email"]
    email_address = EmailAddress.objects.filter(
        user=request.user, email=email, verified=True
    ).first()
    if not email_address:
        return JsonResponse({"msg": "Cannot set primary email."}, 404)
    from_email_address = EmailAddress.objects.filter(
        user=request.user, primary=True
    ).first()
    status = 200
    email_address.set_as_primary()
    response["msg"] = "Primary e-mail address set"
    signals.email_changed.send(
        sender=request.user.__class__,
        request=request,
        user=request.user,
        from_email_address=from_email_address,
        to_email_address=email_address,
    )
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def delete_socialaccount(request):
    account = SocialAccount.objects.filter(
        id=request.POST["socialaccount"], user=request.user
    ).first()
    if not account:
        return JsonResponse({"msg": "Unknown account"}, status=404)
    account.delete()
    social_account_removed.send(
        sender=SocialAccount, request=request, socialaccount=account
    )
    return JsonResponse({"msg": "Deleted account"}, status=200)


def create_avatar_thumbnail(avatar, size=settings.AVATAR_DEFAULT_SIZE):
    if not avatar.thumbnail_exists(size):
        avatar.create_thumbnail(size)
        # Now check if the thumbnail was actually created
        if not avatar.thumbnail_exists(size):
            # Thumbnail was not saved. There must be some PIL bug
            # with this image type. We store the original file instead.
            avatar.avatar.storage.save(
                avatar.avatar_name(size),
                File(avatar.avatar.storage.open(avatar.avatar.name, "rb")),
            )


@login_required
@ajax_required
@require_POST
def upload_avatar(request):
    """
    Upload avatar image
    """
    response = {}
    status = 405

    avatar, avatars = avatarviews._get_avatars(request.user)
    upload_avatar_form = UploadAvatarForm(
        None, request.FILES, user=request.user
    )
    if upload_avatar_form.is_valid():
        avatar = Avatar(
            user=request.user,
            primary=True,
        )
        image_file = request.FILES["avatar"]
        avatar.avatar.save(image_file.name, image_file)
        avatar.save()
        create_avatar_thumbnail(avatar)
        avatar_updated.send(sender=Avatar, user=request.user, avatar=avatar)
        response["avatar"] = avatar.avatar_url(settings.AVATAR_DEFAULT_SIZE)
        status = 200
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def delete_avatar(request):
    """
    Delete avatar image
    """
    response = {}
    status = 405
    avatar, avatars = avatarviews._get_avatars(request.user)
    if avatar is None:
        response["error"] = "User has no avatar"
    else:
        aid = avatar.id
        for a in avatars:
            # Find the next best avatar, and set it as the new primary
            if a.id != aid:
                a.primary = True
                a.save()
                avatar_updated.send(sender=Avatar, user=request.user, avatar=a)
                response["avatar"] = a.avatar_url(settings.AVATAR_DEFAULT_SIZE)
                break
        Avatar.objects.filter(pk=aid).delete()
        status = 200
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def delete_user(request):
    """
    Delete the user
    """
    response = {}
    user = request.user
    # Only remove users who are not marked as having staff status
    # to prevent administratoras from deleting themselves accidentally.
    if not user.check_password(request.POST["password"]):
        status = 401
    elif user.is_staff:
        status = 403
    else:
        logout(request)
        user.delete()
        status = 200
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def save_profile(request):
    """
    Save user profile information
    """
    response = {}
    form_data = json.loads(request.POST["form_data"])
    User = get_user_model()
    user_object = User.objects.get(pk=request.user.pk)
    user_form = UserForm(form_data["user"], instance=user_object)
    if user_form.is_valid():
        user_form.save()
        # Set the language if it has been updated
        if (
            "language" in form_data["user"]
            and user_object.language != form_data["user"]["language"]
        ):
            user_object.language = (
                form_data["user"]["language"]
                if form_data["user"]["language"]
                else None
            )
            user_object.save(update_fields=["language"])
            # Update session language
            request.session["django_language"] = user_object.language
        status = 200
    else:
        response["errors"] = user_form.errors
        status = 422

    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def list_contacts(request):
    response = {}
    status = 200
    response["contacts"] = []
    avatars = Avatars()
    contacts = request.user.contacts.all().only(
        "id", "username", "first_name", "last_name", "email"
    )
    invites_by = request.user.invites_by.all().only("id", "username", "email")
    invites_to = request.user.invites_to.select_related("by").only(
        "id",
        "by__id",
        "by__username",
        "by__first_name",
        "by__last_name",
        "by__email",
    )

    for user in contacts:
        response["contacts"].append(
            {
                "id": user.id,
                "name": user.readable_name,
                "username": user.get_username(),
                "email": user.email,
                "avatar": avatars.get_url(user),
                "type": "user",
            }
        )
    for invite in invites_by:
        response["contacts"].append(
            {
                "id": invite.id,
                "name": invite.username,
                "username": invite.username,
                "email": invite.email,
                "avatar": None,
                "type": "userinvite",
            }
        )
    for invite in invites_to:
        response["contacts"].append(
            {
                "id": invite.id,
                "name": invite.by.readable_name,
                "username": invite.by.get_username(),
                "email": invite.by.email,
                "avatar": avatars.get_url(invite.by),
                "type": "to_userinvite",
            }
        )
    return JsonResponse(response, status=status)


def is_email(string):
    try:
        validate_email(string)
        return True
    except ValidationError:
        return False


@login_required
@ajax_required
@require_POST
def invites_add(request):
    """
    Add a userinvite as a contact of the current user
    """
    response = {}
    contact_user = False
    email = False
    errored = False
    status = 202
    user_string = request.POST["user_string"]
    if (
        UserInvite.objects.filter(username=user_string)
        .filter(by=request.user)
        .exists()
    ):
        # 'This person is already in your invites!'
        response["error"] = 2
        return JsonResponse(response, status=status)
    User = get_user_model()
    contact_user = User.objects.filter(username=user_string).first()
    if contact_user:
        email = contact_user.email
    elif is_email(user_string):
        email = user_string
        email_address = EmailAddress.objects.filter(email=user_string).first()
        if email_address:
            contact_user = email_address.user
    if contact_user:
        if contact_user.pk is request.user.pk:
            # 'You cannot add yourself to your contacts!'
            response["error"] = 1
            errored = True
        elif request.user.contacts.filter(id=contact_user.id).first():
            # 'This person is already in your contacts!'
            response["error"] = 2
            errored = True
    elif not email:
        # 'Invalid email!'
        response["error"] = 3
        errored = True
    if not errored:
        invite = UserInvite.objects.create(
            username=user_string,
            email=email,
            by=request.user,
            to=contact_user,
        )
        sender = request.user.readable_name
        email = invite.email
        link = HttpRequest.build_absolute_uri(
            request, invite.get_relative_url()
        )
        emails.send_invite_notification(sender, email, link)
        response["contact"] = {
            "id": invite.pk,
            "name": invite.username,
            "email": invite.email,
            "avatar": None,
            "type": "userinvite",
        }
        status = 201
    return JsonResponse(response, status=status)


def invites_connect(user, key=None):
    invites = UserInvite.objects.filter(to__isnull=True)
    if key:
        invites = invites.filter(
            key=key,
        )
    else:
        invites = invites.filter(
            Q(email__in=user.emailaddress_set.all()) | Q(email=user.email)
        )
    if len(invites) == 0:
        return False
    for invite in invites:
        invite.to = user
        invite.save()
    return True


@login_required
@ajax_required
@require_POST
def invite(request):
    response = {}
    status = 200
    key = request.POST["key"]
    connected = invites_connect(request.user, key)
    if connected:
        response["redirect"] = "/user/contacts/"
    else:
        response["redirect"] = "/"
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def invites_accept(request):
    response = {}
    status = 200
    invites = json.loads(request.POST["invites"])
    response["contacts"] = []
    avatars = Avatars()
    for invite in invites:
        ui = (
            UserInvite.objects.filter(id=invite["id"], to=request.user)
            .select_related("by")
            .first()
        )
        if ui:
            by = ui.by
            to = ui.to
            ui.apply()
            response["contacts"].append(
                {
                    "id": by.id,
                    "name": by.readable_name,
                    "email": by.email,
                    "avatar": avatars.get_url(by),
                    "type": "user",
                }
            )
            link = HttpRequest.build_absolute_uri(request, "/user/contacts/")
            emails.send_accept_notification(
                by.readable_name, by.email, to.readable_name, link
            )
    return JsonResponse(response, status=status)


def invite_decline(ui, link):
    # Remove this invite. All connected access rights will be deleted
    # automatically.
    emails.send_decline_notification(
        ui.by.readable_name, ui.by.email, ui.to.readable_name, link
    )
    ui.delete()


@login_required
@ajax_required
@require_POST
def invites_decline(request):
    """
    Decline an invite
    """
    response = {}
    invites = json.loads(request.POST["invites"])
    for invite in invites:
        for ui in request.user.invites_to.filter(id=invite["id"]):
            link = HttpRequest.build_absolute_uri(request, "/user/contacts/")
            invite_decline(ui, link)
    status = 200
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def delete_contacts(request):
    """
    Delete a contact
    """
    response = {}
    former_contacts = json.loads(request.POST["contacts"])
    for former_contact in former_contacts:
        if former_contact["type"] == "user":
            # Revoke all permissions given to this user
            AccessRight.objects.filter(
                user__id=former_contact["id"], document__owner=request.user
            ).delete()
            # Revoke all permissions received from this user
            AccessRight.objects.filter(
                user=request.user, document__owner_id=former_contact["id"]
            ).delete()
            # Remove the user from the contacts
            request.user.contacts.remove(
                request.user.contacts.filter(id=former_contact["id"]).first()
            )
        elif former_contact["type"] == "userinvite":
            # Delete the userinvite. All connected access rights will be
            # deleted automatically.
            request.user.invites_by.filter(id=former_contact["id"]).delete()
        elif former_contact["type"] == "to_userinvite":
            # Remove this invite. All connected access rights will be deleted
            # automatically.
            for ui in request.user.invites_to.filter(id=former_contact["id"]):
                link = HttpRequest.build_absolute_uri(
                    request, "/user/contacts/"
                )
                invite_decline(ui, link)
    status = 200
    return JsonResponse(response, status=status)


@ajax_required
@require_POST
def get_confirmkey_data(request):
    """
    Get data for an email confirmation key
    """
    response = {}
    key = request.POST["key"]
    confirmation = EmailConfirmationHMAC.from_key(key)
    if not confirmation:
        qs = EmailConfirmation.objects.all_valid()
        qs = qs.select_related("email_address__user")
        confirmation = qs.filter(key=key.lower()).first()
    if confirmation:
        status = 200
        response["username"] = confirmation.email_address.user.username
        response["email"] = confirmation.email_address.email
        if request.user:
            if request.user != confirmation.email_address.user:
                response["logout"] = True
                logout(request)
        # We check if the user has another verified email already. If yes,
        # we don't need to display the terms and test server warning again.
        if confirmation.email_address.user.emailaddress_set.filter(
            verified=True
        ).first():
            response["verified"] = True
        else:
            response["verified"] = False
    else:
        status = 404
    return JsonResponse(response, status=status)


class FidusSignupView(SignupView):
    def form_valid(self, form):
        if not settings.REGISTRATION_OPEN:
            return HttpResponseRedirect("/")
        ret = super().form_valid(form)
        if ret.status_code > 399:
            return ret
        if "invite_key" in self.request.POST:
            invites_connect(self.user, self.request.POST["invite_key"])
        return ret


signup = FidusSignupView.as_view()


class FidusLoginView(LoginView):
    def form_valid(self, form):
        form_response = super().form_valid(form)
        is_ajax = (
            self.request.headers.get("x-requested-with") == "XMLHttpRequest"
        )
        user = self.request.user
        if is_ajax and isinstance(user, get_user_model()):
            # Add user's language preference to the response
            response = {"location": form_response["Location"], "user": {}}
            if user.language:
                response["user"]["language"] = user.language
            return JsonResponse(response)
        return form_response


login = FidusLoginView.as_view()
