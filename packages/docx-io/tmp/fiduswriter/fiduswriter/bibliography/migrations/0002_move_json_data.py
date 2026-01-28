import json
from django.db import migrations, models


def text_to_json(apps, schema_editor):
    Entry = apps.get_model("bibliography", "Entry")
    entries = Entry.objects.all()
    for entry in entries:
        entry.cats = json.loads(entry.entry_cat)
        entry.fields = json.loads(entry.fields_text)
        entry.save()


def json_to_text(apps, schema_editor):
    Entry = apps.get_model("bibliography", "Entry")
    entries = Entry.objects.all()
    for entry in entries:
        entry.entry_cat = json.dumps(entry.cats)
        entry.fields_text = json.dumps(entry.fields)
        entry.save()


class Migration(migrations.Migration):
    dependencies = [
        ("bibliography", "0001_squashed_0011_auto_20170101_1647"),
    ]

    operations = [
        migrations.AddField(
            model_name="entry",
            name="cats",
            field=models.JSONField(default=list),
        ),
        migrations.RenameField(
            model_name="entry", old_name="fields", new_name="fields_text"
        ),
        migrations.AddField(
            model_name="entry",
            name="fields",
            field=models.JSONField(default=dict),
        ),
        migrations.RunPython(text_to_json, json_to_text),
        migrations.RemoveField(
            model_name="entry",
            name="entry_cat",
        ),
        migrations.RemoveField(
            model_name="entry",
            name="fields_text",
        ),
    ]
