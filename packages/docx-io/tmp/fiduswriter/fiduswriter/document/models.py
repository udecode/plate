from django.db import models
from django.db.utils import OperationalError, ProgrammingError
from django.core import checks
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# FW_DOCUMENT_VERSION:
# Also defined in frontend
# document/static/js/modules/schema/index.js

FW_DOCUMENT_VERSION = 3.5


class DocumentTemplate(models.Model):
    title = models.CharField(max_length=255, default="", blank=True)
    import_id = models.CharField(max_length=255, default="", blank=True)
    content = models.JSONField(default=dict)
    doc_version = models.DecimalField(
        max_digits=3, decimal_places=1, default=FW_DOCUMENT_VERSION
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.deletion.CASCADE,
    )
    added = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    auto_delete = True

    def __str__(self):
        return self.title

    def is_deletable(self):
        reverse_relations = [
            f
            for f in self._meta.model._meta.get_fields()
            if (f.one_to_many or f.one_to_one)
            and f.auto_created
            and not f.concrete
            and f.name not in ["documentstyle", "exporttemplate"]
        ]

        for r in reverse_relations:
            if r.remote_field.model.objects.filter(
                **{r.field.name: self}
            ).exists():
                return False
        return True

    @classmethod
    def check(cls, **kwargs):
        errors = super().check(**kwargs)
        errors.extend(cls._check_doc_versions(**kwargs))
        return errors

    @classmethod
    def _check_doc_versions(cls, **kwargs):
        try:
            if cls.objects.filter(
                doc_version__lt=str(FW_DOCUMENT_VERSION)
            ).exists():
                return [
                    checks.Warning(
                        "Document templates need to be upgraded. Please "
                        "navigate to /admin/document/document/maintenance/ "
                        "with a browser as a superuser and upgrade all "
                        "document templates on this server.",
                        obj=cls,
                    )
                ]
            else:
                return []
        except (ProgrammingError, OperationalError):
            # Database has not yet been initialized, so don't throw any error.
            return []


class Document(models.Model):
    title = models.CharField(max_length=255, default="", blank=True)
    path = models.TextField(default="", blank=True)
    content = models.JSONField(default=dict)
    doc_version = models.DecimalField(
        max_digits=3, decimal_places=1, default=FW_DOCUMENT_VERSION
    )
    # The doc_version is the version of the data format in the content field.
    # We upgrade the content field in JavaScript and not migrations so that
    # the same code can be used for migrations and for importing old fidus
    # files that are being uploaded. This field is only used for upgrading data
    # and is therefore not handed to the editor or document overview page.
    version = models.PositiveIntegerField(default=0)
    diffs = models.JSONField(default=list, blank=True)
    # The last few diffs that were received and approved. The number of stored
    # diffs should always be equivalent to or more than all the diffs since the
    # last full save of the document.
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="owner",
        on_delete=models.deletion.CASCADE,
    )
    added = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    comments = models.JSONField(default=dict, blank=True)
    bibliography = models.JSONField(default=dict, blank=True)
    # Whether or not document is listed on document overview list page.
    # True by default and for all normal documents. Can be set to False when
    # documents are added in plugins that list these documents somewhere else.
    listed = models.BooleanField(default=True)
    template = models.ForeignKey(
        DocumentTemplate, on_delete=models.deletion.CASCADE
    )

    def __str__(self):
        if len(self.title) > 0:
            return f"{self.title} ({self.id})"
        else:
            return str(self.id)

    class Meta:
        ordering = ["-id"]

    def clean(self, *args, **kwargs):
        if self.comments is None:
            self.comments = "{}"
        if self.bibliography is None:
            self.bibliography = "{}"

    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)

    def get_absolute_url(self):
        return "/document/%i/" % self.id

    def is_deletable(self):
        reverse_relations = [
            f
            for f in self._meta.model._meta.get_fields()
            if (f.one_to_many or f.one_to_one)
            and f.auto_created
            and not f.concrete
            and f.name
            not in [
                "accessright",
                "accessrightinvite",
                "documentrevision",
                "documentimage",
            ]
        ]

        for r in reverse_relations:
            if r.remote_field.model.objects.filter(
                **{r.field.name: self}
            ).exists():
                return False
        return True

    @classmethod
    def check(cls, **kwargs):
        errors = super().check(**kwargs)
        errors.extend(cls._check_doc_versions(**kwargs))
        return errors

    @classmethod
    def _check_doc_versions(cls, **kwargs):
        try:
            if len(
                cls.objects.filter(doc_version__lt=str(FW_DOCUMENT_VERSION))
            ):
                return [
                    checks.Warning(
                        "Documents need to be upgraded. Please navigate to "
                        "/admin/document/document/maintenance/ with a browser "
                        "as a superuser and upgrade all documents on this "
                        "server.",
                        obj=cls,
                    )
                ]
            else:
                return []
        except (ProgrammingError, OperationalError):
            # Database has not yet been initialized, so don't throw any error.
            return []


RIGHTS_CHOICES = (
    ("write", "Writer"),
    # Can write content and can read+write comments.
    # Can chat with collaborators.
    # Has read access to revisions.
    ("write-tracked", "Write with tracked changes"),
    # Can write tracked content and can read/write comments.
    # Cannot turn off tracked changes.
    # Can chat with collaborators.
    # Has read access to revisions.
    ("comment", "Commentator"),
    # Can read content and can read+write comments.
    # Can chat with collaborators.
    # Has read access to revisions.
    ("review-tracked", "Reviewer who can write with tracked changes"),
    # Can write tracked content and can read/write his own comments.
    # Cannot turn off tracked changes.
    # Cannot chat with collaborators.
    # Has no access to revisions.
    ("review", "Reviewer"),
    # Can read the content and can read/write his own comments.
    # Comments by users with this access right only show the user's
    # numeric ID, not their username.
    # Cannot chat with collaborators nor see that they are connected.
    # Has no access to revisions.
    ("read", "Reader"),
    # Can read content, including comments
    # Can chat with collaborators.
    # Has read access to revisions.
    ("read-without-comments", "Reader without comment access"),
    # Can read content, but not the comments.
    # Cannot chat with collaborators.
    # Has no access to revisions.
)

# Editor and Reviewer can only comment and not edit document
COMMENT_ONLY = ("review", "comment")

CAN_UPDATE_DOCUMENT = [
    "write",
    "write-tracked",
    "review",
    "review-tracked",
    "comment",
]

# Whether the collaborator is allowed to know about other collaborators
# and communicate with them.
CAN_COMMUNICATE = ["read", "write", "comment", "write-tracked"]


class AccessRight(models.Model):
    document = models.ForeignKey(Document, on_delete=models.deletion.CASCADE)
    path = models.TextField(default="", blank=True)
    holder_choices = models.Q(app_label="user", model="user") | models.Q(
        app_label="user", model="userinvite"
    )
    holder_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, limit_choices_to=holder_choices
    )
    holder_id = models.PositiveIntegerField()
    holder_obj = GenericForeignKey("holder_type", "holder_id")
    rights = models.CharField(
        max_length=21, choices=RIGHTS_CHOICES, blank=False
    )

    class Meta:
        unique_together = (("document", "holder_type", "holder_id"),)

    def __str__(self):
        return "%(name)s %(rights)s on %(doc_id)d" % {
            "name": self.holder_obj.readable_name,
            "rights": self.rights,
            "doc_id": self.document.id,
        }


def revision_filename(instance, filename):
    return f"document-revisions/{instance.pk}.fidus"


class DocumentRevision(models.Model):
    document = models.ForeignKey(Document, on_delete=models.deletion.CASCADE)
    doc_version = models.DecimalField(
        max_digits=3, decimal_places=1, default=FW_DOCUMENT_VERSION
    )
    note = models.CharField(max_length=255, default="", blank=True)
    date = models.DateTimeField(auto_now=True)
    file_object = models.FileField(upload_to=revision_filename)
    file_name = models.CharField(max_length=255, default="", blank=True)

    def save(self, *args, **kwargs):
        if self.pk is None:
            # We remove the file_object the first time so that we can use the
            # pk as the name of the saved revision file.
            file_object = self.file_object
            self.file_object = None
            super().save(*args, **kwargs)
            self.file_object = file_object
            kwargs.pop("force_insert", None)
        super().save(*args, **kwargs)

    def __str__(self):
        if len(self.note) > 0:
            return "{note} ({id}) of {doc_id}".format(
                note=self.note,
                id=self.id,
                doc_id=self.document.id,
            )
        else:
            return "{id} of {doc_id}".format(
                id=self.id,
                doc_id=self.document.id,
            )

    @classmethod
    def check(cls, **kwargs):
        errors = super().check(**kwargs)
        errors.extend(cls._check_doc_versions(**kwargs))
        return errors

    @classmethod
    def _check_doc_versions(cls, **kwargs):
        try:
            if len(
                cls.objects.filter(doc_version__lt=str(FW_DOCUMENT_VERSION))
            ):
                return [
                    checks.Warning(
                        "Document revisions need to be upgraded. Please "
                        "navigate to /admin/document/document/maintenance/ "
                        "with a browser as a superuser and upgrade all "
                        "document revisions on this server.",
                        obj=cls,
                    )
                ]
            else:
                return []
        except (ProgrammingError, OperationalError):
            # Database has not yet been initialized, so don't throw any error.
            return []
