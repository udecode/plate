import json
from django.db import migrations, models, transaction


def text_to_json(apps, schema_editor):
    UserImage = apps.get_model("usermedia", "UserImage")
    uimages = UserImage.objects.all().iterator()
    with transaction.atomic():
        for image in uimages:
            try:
                image.cats = json.loads(image.image_cat)
            except ValueError:
                pass
            try:
                image.copyright = json.loads(image.copyright_text)
            except ValueError:
                image.copyright = {
                    "holder": False,
                    "year": False,
                    "freeToRead": True,
                    "licenses": [],
                }
            image.save()
    DocumentImage = apps.get_model("usermedia", "DocumentImage")
    dimages = DocumentImage.objects.all().iterator()
    with transaction.atomic():
        for image in dimages:
            try:
                image.copyright = json.loads(image.copyright_text)
            except ValueError:
                image.copyright = {
                    "holder": False,
                    "year": False,
                    "freeToRead": True,
                    "licenses": [],
                }
            image.save()


def json_to_text(apps, schema_editor):
    UserImage = apps.get_model("usermedia", "UserImage")
    images = UserImage.objects.all().iterator()
    with transaction.atomic():
        for image in images:
            image.image_cat = json.dumps(image.cats)
            image.copyright_text = json.dumps(image.copyright)
            image.save()
    DocumentImage = apps.get_model("usermedia", "DocumentImage")
    dimages = DocumentImage.objects.all().iterator()
    with transaction.atomic():
        for image in dimages:
            image.copyright_text = json.dumps(image.copyright)
            image.save()


class Migration(migrations.Migration):
    atomic = False  # to prevent migrations running in single transaction
    dependencies = [
        ("usermedia", "0004_auto_20200205_2347"),
    ]

    operations = [
        migrations.AddField(
            model_name="userimage",
            name="cats",
            field=models.JSONField(default=list),
        ),
        migrations.RenameField(
            model_name="userimage",
            old_name="copyright",
            new_name="copyright_text",
        ),
        migrations.AddField(
            model_name="userimage",
            name="copyright",
            field=models.JSONField(default=dict),
        ),
        migrations.RenameField(
            model_name="documentimage",
            old_name="copyright",
            new_name="copyright_text",
        ),
        migrations.AddField(
            model_name="documentimage",
            name="copyright",
            field=models.JSONField(default=dict),
        ),
        migrations.RunPython(text_to_json, json_to_text),
        migrations.RemoveField(
            model_name="userimage",
            name="image_cat",
        ),
        migrations.RemoveField(
            model_name="userimage",
            name="copyright_text",
        ),
        migrations.RemoveField(
            model_name="documentimage",
            name="copyright_text",
        ),
    ]
