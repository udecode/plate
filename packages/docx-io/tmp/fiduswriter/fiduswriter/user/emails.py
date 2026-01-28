from django.core.mail import send_mail
from django.conf import settings
from django.utils.translation import gettext as _

from base.html_email import html_email


def send_invite_notification(sender, email, link):
    message_text = _(
        "Hey %(email)s,%(sender)s has invited you to connect on Fidus "
        "Writer. "
        "\nAccept or reject the invite through this link: %(link)s"
    ) % {
        "sender": sender,
        "email": email,
        "link": link,
    }
    body_html_intro = _(
        "<p>Hey %(email)s,<br> %(sender)s has "
        "invited you to connect on Fidus Writer.</p>"
    ) % {
        "sender": sender,
        "email": email,
        "link": link,
    }

    body_html = (
        "<h1>%(invite)s</h1>"
        "%(body_html_intro)s"
        '<div class="actions"><a class="button" href="%(link)s">'
        "%(Accept)s"
        "</a></div>"
    ) % {
        "invite": _("Invite for Fidus Writer"),
        "body_html_intro": body_html_intro,
        "link": link,
        "Accept": _("Sign up/log in and accept/reject the invite"),
    }
    send_mail(
        _("Fidus Writer contact invite"),
        message_text,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=True,
        html_message=html_email(body_html),
    )


def send_decline_notification(
    recipient_name, recipient_email, sender_name, link
):
    message_text = _(
        "Hey %(recipient_name)s, %(sender_name)s has declined your invite to "
        "connect on Fidus Writer. "
        "\nSee your list of contacts here: %(link)s"
    ) % {
        "recipient_name": recipient_name,
        "sender_name": sender_name,
        "link": link,
    }
    body_html_intro = _(
        "<p>Hey %(recipient_name)s,<br> %(sender_name)s has "
        "declined your invite to connect on Fidus Writer.</p>"
    ) % {
        "recipient_name": recipient_name,
        "sender_name": sender_name,
    }

    body_html = (
        "<h1>%(invite)s</h1>"
        "%(body_html_intro)s"
        '<div class="actions"><a class="button" href="%(link)s">'
        "%(LinkText)s"
        "</a></div>"
    ) % {
        "invite": _("Invite for Fidus Writer declined"),
        "body_html_intro": body_html_intro,
        "link": link,
        "LinkText": _("See your list of contacts"),
    }
    send_mail(
        _("Fidus Writer invite declined"),
        message_text,
        settings.DEFAULT_FROM_EMAIL,
        [recipient_email],
        fail_silently=True,
        html_message=html_email(body_html),
    )


def send_accept_notification(
    recipient_name, recipient_email, sender_name, link
):
    message_text = _(
        "Hey %(recipient_name)s, %(sender_name)s has accepted your invite to "
        "connect on Fidus Writer. "
        "\nSee your list of contacts here: %(link)s"
    ) % {
        "recipient_name": recipient_name,
        "sender_name": sender_name,
        "link": link,
    }
    body_html_intro = _(
        "<p>Hey %(recipient_name)s,<br> %(sender_name)s has "
        "accepted your invite to connect on Fidus Writer.</p>"
    ) % {
        "recipient_name": recipient_name,
        "sender_name": sender_name,
    }

    body_html = (
        "<h1>%(invite)s</h1>"
        "%(body_html_intro)s"
        '<div class="actions"><a class="button" href="%(link)s">'
        "%(LinkText)s"
        "</a></div>"
    ) % {
        "invite": _("Invite for Fidus Writer accepted"),
        "body_html_intro": body_html_intro,
        "link": link,
        "LinkText": _("See your list of contacts"),
    }
    send_mail(
        _("Fidus Writer invite accepted"),
        message_text,
        settings.DEFAULT_FROM_EMAIL,
        [recipient_email],
        fail_silently=True,
        html_message=html_email(body_html),
    )
