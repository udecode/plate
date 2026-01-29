import os
import json
import zipfile
import tempfile
from decimal import Decimal

from django.db import migrations, models
from django.core.files import File

# FW 3.2 documents can be upgraded to 3.3 by adding IDs to lists and tables
OLD_FW_DOCUMENT_VERSION = 3.2
FW_DOCUMENT_VERSION = 3.3

ID_COUNTER = 0


def update_node(node):
    global ID_COUNTER
    if "contents" in node:  # revision
        update_node(node["contents"])
    if "type" in node:
        if node["type"] in ["bullet_list", "ordered_list"]:
            if "attrs" not in node:
                node["attrs"] = {}
            ID_COUNTER += 1
            node["attrs"]["id"] = "{}{:0>8d}".format("L", ID_COUNTER)
        elif node["type"] == "table" and "content" in node:
            if "attrs" not in node:
                node["attrs"] = {}
            ID_COUNTER += 1
            node["attrs"]["id"] = "{}{:0>8d}".format("T", ID_COUNTER)
            node["attrs"]["caption"] = False
            if "content" in node:
                node["content"] = [
                    {"type": "table_caption"},
                    {"type": "table_body", "content": node["content"]},
                ]
        elif node["type"] == "table_cell" and (
            "content" not in node or len(node["content"]) == 0
        ):
            node["content"] = [{"type": "paragraph"}]
        elif node["type"] == "figure":
            if "attrs" not in node:
                node["attrs"] = {}
            attrs = node["attrs"]
            if "figureCategory" in attrs:
                attrs["category"] = attrs["figureCategory"]
                del attrs["figureCategory"]
            else:
                attrs["category"] = "none"
            node["content"] = []
            if "image" in attrs and attrs["image"] is not False:
                node["content"].append(
                    {"type": "image", "attrs": {"image": attrs["image"]}}
                )
            else:
                equation = ""
                if "equation" in attrs:
                    equation = attrs["equation"]
                node["content"].append(
                    {
                        "type": "figure_equation",
                        "attrs": {"equation": equation},
                    }
                )
            if "image" in attrs:
                del attrs["image"]
            if "equation" in attrs:
                del attrs["equation"]
            caption = {"type": "figure_caption"}
            if (
                "caption" in attrs
                and attrs["caption"] is not False
                and len(attrs["caption"]) > 0
            ):
                caption["content"] = [
                    {"type": "text", "text": attrs["caption"]}
                ]
                attrs["caption"] = True
            else:
                attrs["caption"] = False
            if attrs["category"] == "table":
                node["content"].insert(0, caption)
            else:
                node["content"].append(caption)
            node["attrs"] = attrs
        elif (
            node["type"] == "footnote"
            and "attrs" in node
            and "footnote" in node["attrs"]
        ):
            for sub_node in node["attrs"]["footnote"]:
                update_node(sub_node)
    if "content" in node:
        for sub_node in node["content"]:
            update_node(sub_node)
    if (
        "attrs" in node
        and "initial" in node["attrs"]
        and bool(node["attrs"]["initial"])
    ):
        for sub_node in node["attrs"]["initial"]:
            update_node(sub_node)


def update_document_string(doc_string):
    doc = json.loads(doc_string)
    update_node(doc)
    return json.dumps(doc)


# from https://stackoverflow.com/questions/25738523/how-to-update-one-file-inside-zip-file-using-python
def update_revision_zip(file_field, file_name):
    # generate a temp file
    tmpfd, tmpname = tempfile.mkstemp()
    os.close(tmpfd)
    # create a temp copy of the archive without filename
    with zipfile.ZipFile(file_field.open(), "r") as zin:
        with zipfile.ZipFile(tmpname, "w") as zout:
            zout.comment = zin.comment  # preserve the comment
            for item in zin.infolist():
                if item.filename == "filetype-version":
                    zout.writestr(item, str(FW_DOCUMENT_VERSION))
                elif item.filename == "document.json":
                    doc_string = zin.read(item.filename)
                    zout.writestr(item, update_document_string(doc_string))
                else:
                    zout.writestr(item, zin.read(item.filename))
    # replace with the temp archive
    with open(tmpname, "rb") as tmp_file:
        file_field.save(file_name, File(tmp_file))
    os.remove(tmpname)


def update_documents(apps, schema_editor):
    Document = apps.get_model("document", "Document")
    documents = Document.objects.all().iterator()
    for document in documents:
        if document.doc_version == Decimal(str(OLD_FW_DOCUMENT_VERSION)):
            document.contents = update_document_string(document.contents)
            document.doc_version = FW_DOCUMENT_VERSION
            for field in document._meta.local_fields:
                if field.name == "updated":
                    field.auto_now = False
            document.save()

    DocumentTemplate = apps.get_model("document", "DocumentTemplate")
    templates = DocumentTemplate.objects.all()
    for template in templates:
        if template.doc_version == Decimal(str(OLD_FW_DOCUMENT_VERSION)):
            template.definition = update_document_string(template.definition)
            template.doc_version = FW_DOCUMENT_VERSION
            template.save()

    DocumentRevision = apps.get_model("document", "DocumentRevision")
    revisions = DocumentRevision.objects.all()
    for revision in revisions:
        if not revision.file_object:
            revision.delete()
            continue
        if revision.doc_version == Decimal(str(OLD_FW_DOCUMENT_VERSION)):
            revision.doc_version = FW_DOCUMENT_VERSION
            revision.save()
            # Set the version number also in the zip file.
            update_revision_zip(revision.file_object, revision.file_name)


class Migration(migrations.Migration):
    dependencies = [
        ("document", "0002_fidus_3_2"),
    ]

    operations = [
        migrations.AlterField(
            model_name="document",
            name="doc_version",
            field=models.DecimalField(
                decimal_places=1, default=3.3, max_digits=3
            ),
        ),
        migrations.AlterField(
            model_name="documentrevision",
            name="doc_version",
            field=models.DecimalField(
                decimal_places=1, default=3.3, max_digits=3
            ),
        ),
        migrations.AlterField(
            model_name="documenttemplate",
            name="doc_version",
            field=models.DecimalField(
                decimal_places=1, default=3.3, max_digits=3
            ),
        ),
        migrations.RunPython(update_documents),
    ]
