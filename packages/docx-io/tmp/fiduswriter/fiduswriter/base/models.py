from django.db import models
from django.conf import settings
from django.utils import timezone


class Presence(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    server_url = models.URLField()
    timestamp = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.server_url} - {self.timestamp}"

    @classmethod
    def prune(cls):
        # Remove all presences that haven't been updated for 5 minutos
        cls.objects.filter(
            timestamp__lt=timezone.now() - timezone.timedelta(minutes=5)
        ).delete()
