from django.core.management.base import BaseCommand as DjangoBaseCommand

from base import get_version


class BaseCommand(DjangoBaseCommand):
    def get_version(self):
        return get_version()
