from allauth.account.adapter import DefaultAccountAdapter
from allauth.utils import build_absolute_uri


class AccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        """Constructs the email confirmation (activation) url.
        Note that if you have architected your system such that email
        confirmations are sent outside of the request context `request`
        can be `None` here.
        """
        url = f"/account/confirm-email/{emailconfirmation.key}/"
        ret = build_absolute_uri(request, url)
        return ret

    def send_mail(self, template_prefix, email, context):
        if template_prefix == "account/email/password_reset_key":
            # We replace the password reset URL to avoid a '/api' in the URL.
            key = context["password_reset_url"].split("/")[-2]
            url = f"/account/change-password/{key}/"
            context["password_reset_url"] = build_absolute_uri(
                context["request"], url
            )
        return super().send_mail(template_prefix, email, context)
