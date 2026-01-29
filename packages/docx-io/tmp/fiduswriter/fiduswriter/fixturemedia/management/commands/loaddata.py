from os.path import dirname, isdir, join, isfile

from django.conf import settings
import django.core.management.commands.loaddata
from django.core.files.storage import default_storage
import django.core.serializers
from django.db.models import signals
from django.db.models.fields.files import FileField
from django.apps import apps
from django.core import serializers
from django.core.management.utils import parse_apps_and_model_labels
from django.db import (
    connections,
    transaction,
)


def get_apps():
    return [
        _f for _f in [a.models_module for a in apps.get_app_configs()] if _f
    ]


def get_modelclasses():
    yield from apps.get_models()


def models_with_filefields():
    for modelclass in get_modelclasses():
        if any(
            isinstance(field, FileField) for field in modelclass._meta.fields
        ):
            yield modelclass


class Command(django.core.management.commands.loaddata.Command):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fixture_media_paths = []

    def load_images_for_signal(self, sender, **kwargs):
        instance = kwargs["instance"]
        for field in sender._meta.fields:
            if not isinstance(field, FileField):
                continue
            path = getattr(instance, field.attname)
            if path is None or not path.name:
                continue
            find_file = False
            for fixture_path in self.fixture_media_paths:
                filepath = join(fixture_path, path.name)
                if isfile(filepath):
                    find_file = filepath
            if find_file is False:
                self.stderr.write(
                    ("Expected file {} doesn't exist, skipping").format(
                        path.name
                    )
                )
                continue
            with open(find_file, "rb") as f:
                default_storage.save(path.name, f)

    def handle(self, *fixture_labels, **options):
        # Hook up pre_save events for all the apps' models that have
        # FileFields.
        for modelclass in models_with_filefields():
            signals.pre_save.connect(
                self.load_images_for_signal, sender=modelclass
            )

        self.ignore = options["ignore"]
        self.using = options["database"]
        self.app_label = options["app_label"]
        self.verbosity = options["verbosity"]
        self.excluded_models, self.excluded_apps = parse_apps_and_model_labels(
            options["exclude"]
        )
        self.format = options["format"]

        fixture_paths = []
        self.serialization_formats = (
            serializers.get_public_serializer_formats()
        )
        for fixture_label in fixture_labels:
            for fixture in self.find_fixtures(fixture_label):
                fixture_paths.extend(fixture)
        fixture_paths.extend(self.find_fixture_paths())
        fixture_paths = (join(path, "media") for path in fixture_paths)
        fixture_paths = [path for path in fixture_paths if isdir(path)]
        self.fixture_media_paths = fixture_paths

        with transaction.atomic(using=self.using):
            self.loaddata(fixture_labels)

        # Close the DB connection -- unless we're still in a transaction. This
        # is required as a workaround for an edge case in MySQL: if the same
        # connection is used to create tables, load data, and query, the query
        # can return incorrect results. See Django #7572, MySQL #37735.
        if transaction.get_autocommit(self.using):
            connections[self.using].close()
        # Disconnect signal listeners
        for modelclass in models_with_filefields():
            signals.pre_save.disconnect(
                self.load_images_for_signal, sender=modelclass
            )
        return

    def find_fixture_paths(self):
        """Return the full paths to all possible fixture directories."""
        app_module_paths = []
        for app in get_apps():
            if hasattr(app, "__path__"):
                # It's a 'models/' subpackage
                for path in app.__path__:
                    app_module_paths.append(path)
            else:
                # It's a models.py module
                app_module_paths.append(app.__file__)

        app_fixtures = [
            join(dirname(path), "fixtures") for path in app_module_paths
        ]

        return app_fixtures + list(settings.FIXTURE_DIRS)
