from django.db import models
from django.utils.translation import gettext as _


class DocumentStyle(models.Model):
    title = models.CharField(
        max_length=128,
        help_text="The human readable title.",
        default="Default",
    )
    slug = models.SlugField(
        max_length=20,
        help_text="The base of the filenames the style occupies.",
        default="default",
    )
    contents = models.TextField(
        help_text="The CSS style definiton.", default=""
    )
    document_template = models.ForeignKey(
        "document.DocumentTemplate", on_delete=models.deletion.CASCADE
    )

    def __str__(self):
        return self.title

    class Meta:
        unique_together = (("slug", "document_template"),)


def documentstylefile_location(instance, filename):
    # preserve the original filename
    instance.filename = filename
    return "/".join(["style-files", filename])


class DocumentStyleFile(models.Model):
    file = models.FileField(
        upload_to=documentstylefile_location,
        help_text=(
            "A file references in the style. The filename will be replaced "
            "with the final url of the file in the style."
        ),
    )
    filename = models.CharField(
        max_length=255, help_text="The original filename."
    )
    style = models.ForeignKey(
        "DocumentStyle", on_delete=models.deletion.CASCADE
    )

    def __str__(self):
        return self.filename + " of " + self.style.title

    def natural_key(self):
        return (self.file.url, self.filename)

    class Meta:
        unique_together = (("filename", "style"),)


TEMPLATE_CHOICES = (("docx", "DOCX"), ("odt", "ODT"))


def template_filename(instance, filename):
    instance.title = filename.split(".")[0]
    return "/".join(["export-template-files", filename])


class ExportTemplate(models.Model):
    template_file = models.FileField(upload_to=template_filename)
    title = models.CharField(
        max_length=128,
        help_text="The human readable title.",
        default=_("Default"),
    )
    file_type = models.CharField(
        max_length=5, choices=TEMPLATE_CHOICES, blank=False
    )
    document_template = models.ForeignKey(
        "document.DocumentTemplate", on_delete=models.deletion.CASCADE
    )

    def __str__(self):
        return self.title + " (" + self.file_type + ")"

    class Meta:
        unique_together = (("title", "document_template"),)
