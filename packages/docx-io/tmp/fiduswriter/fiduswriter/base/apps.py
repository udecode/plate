from django.apps import AppConfig
from django.core.management import call_command

from npm_mjs.signals import post_npm_install


def bundle_mathlive(sender, **kwargs):
    call_command("bundle_mathlive")


class BaseConfig(AppConfig):
    name = "base"
    default_auto_field = "django.db.models.AutoField"

    def ready(self):
        post_npm_install.connect(bundle_mathlive)
