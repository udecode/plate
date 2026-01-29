import json
from django.db import migrations, models, transaction


def text_to_json(apps, schema_editor):
    Document = apps.get_model("document", "Document")
    documents = Document.objects.all().iterator()
    with transaction.atomic():
        for document in documents:
            document.content = json.loads(document.contents)
            document.diffs = json.loads(document.last_diffs)
            document.comments = json.loads(document.comments_text)
            document.bibliography = json.loads(document.bibliography_text)
            for field in document._meta.local_fields:
                if field.name == "updated":
                    field.auto_now = False
            document.save()
    DocumentTemplate = apps.get_model("document", "DocumentTemplate")
    templates = DocumentTemplate.objects.all()
    with transaction.atomic():
        for template in templates:
            template.content = json.loads(template.definition)
            template.save()


def json_to_text(apps, schema_editor):
    Document = apps.get_model("document", "Document")
    documents = Document.objects.all().iterator()
    with transaction.atomic():
        for document in documents:
            document.contents = json.dumps(document.content)
            document.last_diffs = json.dumps(document.diffs)
            document.comments_text = json.dumps(document.comments)
            document.bibliography_text = json.dumps(document.bibliography)
            for field in document._meta.local_fields:
                if field.name == "updated":
                    field.auto_now = False
            document.save()
    DocumentTemplate = apps.get_model("document", "DocumentTemplate")
    templates = DocumentTemplate.objects.all()
    with transaction.atomic():
        for template in templates:
            template.definition = json.dumps(template.content)
            template.save()


class Migration(migrations.Migration):
    atomic = False  # to prevent migrations running in single transaction
    dependencies = [
        ("document", "0003_fidus_3_3"),
    ]

    operations = [
        migrations.RenameField(
            model_name="document",
            old_name="comments",
            new_name="comments_text",
        ),
        migrations.AddField(
            model_name="document",
            name="comments",
            field=models.JSONField(default=dict),
        ),
        migrations.RenameField(
            model_name="document",
            old_name="bibliography",
            new_name="bibliography_text",
        ),
        migrations.AddField(
            model_name="document",
            name="bibliography",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="document",
            name="content",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="document",
            name="diffs",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="documenttemplate",
            name="content",
            field=models.JSONField(default=dict),
        ),
        migrations.RunPython(text_to_json, json_to_text),
        migrations.RemoveField(
            model_name="document",
            name="comments_text",
        ),
        migrations.RemoveField(
            model_name="document",
            name="bibliography_text",
        ),
        migrations.RemoveField(
            model_name="document",
            name="contents",
        ),
        migrations.RemoveField(
            model_name="document",
            name="last_diffs",
        ),
        migrations.RemoveField(
            model_name="documenttemplate",
            name="definition",
        ),
    ]
