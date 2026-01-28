import os
from django.core.management.commands.compilemessages import (
    Command as CompilemessagesCommand,
)

from base.management import BaseCommand


class Command(CompilemessagesCommand, BaseCommand):
    def handle(self, *args, **options):
        if os.environ.get("NO_COMPILEMESSAGES") == "true":
            self.stdout.write(
                "Using packaged version. Skipping compile messages."
            )
        else:
            return super().handle(*args, **options)
