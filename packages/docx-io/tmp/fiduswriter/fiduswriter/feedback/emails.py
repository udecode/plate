from django.conf import settings
from django.core.mail import send_mail


def send_feedback(from_sender, reply_to, message):
    send_mail(
        f"Feedback from {from_sender} {reply_to}",
        message,
        settings.DEFAULT_FROM_EMAIL,
        [settings.CONTACT_EMAIL],
        fail_silently=True,
    )
