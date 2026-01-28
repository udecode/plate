from django.utils import translation
from django.utils.deprecation import MiddlewareMixin


class UserLanguageMiddleware(MiddlewareMixin):
    """
    Middleware to set user's preferred language
    """

    def process_request(self, request):
        if request.user.is_authenticated:
            # Set the user's preferred language
            translation.activate(request.user.language)
            # Only modify the session if the language is different to avoid
            # unnecessary session saves and race conditions with deleted sessions
            if request.session.get("django_language") != request.user.language:
                request.session["django_language"] = request.user.language
