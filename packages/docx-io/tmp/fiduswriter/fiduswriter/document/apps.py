from django.apps import AppConfig
from django.core.management import call_command

from npm_mjs.signals import post_transpile


def export_schema(sender, **kwargs):
    call_command("export_schema")


class DocumentConfig(AppConfig):
    name = "document"
    default_auto_field = "django.db.models.AutoField"

    def ready(self):
        import document.signals  # noqa

        post_transpile.connect(export_schema)
