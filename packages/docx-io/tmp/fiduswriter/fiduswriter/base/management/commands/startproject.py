import os

from base.management import BaseCommand
from django.core.management.utils import get_random_secret_key
from django.conf import settings


class Command(BaseCommand):
    help = (
        "Creates a new Fidus Writer project in the current directory or "
        "optionally in the given directory."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "directory", nargs="?", help="Optional destination directory"
        )

    def handle(self, *args, **options):
        TARGET_PATH = options.pop("directory")
        SECRET_KEY = get_random_secret_key()
        if not TARGET_PATH:
            TARGET_PATH = settings.PROJECT_PATH
        if not os.path.exists(TARGET_PATH):
            os.makedirs(TARGET_PATH)
        SRC_PATH = settings.SRC_PATH
        with open(os.path.join(SRC_PATH, "configuration-default.py")) as file:
            CONFIGURATION = file.read()
        CONFIGURATION += "\n# Don't share the SECRET_KEY with anyone."
        CONFIGURATION += f"\nSECRET_KEY = '{SECRET_KEY}'"
        with open(os.path.join(TARGET_PATH, "configuration.py"), "w") as file:
            file.write(CONFIGURATION)
