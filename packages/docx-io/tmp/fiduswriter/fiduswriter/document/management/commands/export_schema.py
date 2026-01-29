import hashlib
import json
import os
import subprocess
from tempfile import mkstemp

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        "Copy the document schema used in the frontend to a JSON file so that "
        "also the backend can make use of it."
    )

    def handle(self, *args, **options):
        self.stdout.write("Checking document schema")
        call_command("npm_install")

        # Calculate hash of the schema_export.js file
        current_hash = self.calculate_schema_hash()

        # Check if the hash has changed
        if self.has_schema_changed(current_hash):
            self.export_schema()
            self.save_hash(current_hash)
            self.stdout.write("Document schema updated.")
        else:
            self.stdout.write(
                "Document schema is up to date. Skipping export."
            )

    def calculate_schema_hash(self):
        schema_export_path = os.path.join(
            settings.PROJECT_PATH, "static-transpile/js/schema_export.js"
        )
        hasher = hashlib.md5()
        with open(schema_export_path, "rb") as f:
            hasher.update(f.read())
        return hasher.hexdigest()

    def has_schema_changed(self, current_hash):
        cache_file = os.path.join(
            settings.PROJECT_PATH, ".schema_export_cache.json"
        )
        if os.path.exists(cache_file):
            with open(cache_file) as f:
                cached_data = json.load(f)
                return cached_data.get("hash") != current_hash
        return True

    def save_hash(self, current_hash):
        cache_file = os.path.join(
            settings.PROJECT_PATH, ".schema_export_cache.json"
        )
        with open(cache_file, "w") as f:
            json.dump({"hash": current_hash}, f)

    def export_schema(self):
        json_path = os.path.join(settings.PROJECT_PATH, "static-libs/json/")
        if not os.path.exists(json_path):
            os.makedirs(json_path)
        schema_json_path = os.path.join(json_path, "schema.json")
        schema_export_path = os.path.join(
            settings.PROJECT_PATH, "static-transpile/js/schema_export.js"
        )
        if not os.path.exists(schema_export_path):
            raise FileNotFoundError(
                f"Schema export file not found at {schema_export_path}"
            )
        with open(schema_export_path) as js_file:
            js = js_file.read()

        node_file, node_file_path = mkstemp()
        with open(node_file, "w") as f:
            f.write(
                "global.window = {}; "
                + "global.gettext = ()=>{}; "
                + "global.self = {};\n"
                + js
            )

        json = subprocess.check_output(["node", node_file_path]).decode(
            "utf-8"
        )
        os.unlink(node_file_path)

        with open(schema_json_path, "w") as schema_json:
            schema_json.write(json)
