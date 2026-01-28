from django.db import models
from django.conf import settings


class EntryCategory(models.Model):
    category_title = models.CharField(max_length=100)
    category_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.deletion.CASCADE
    )

    def __str__(self):
        return self.category_title

    class Meta:
        verbose_name_plural = "Entry categories"


class Entry(models.Model):
    entry_key = models.CharField(max_length=64)
    # identifier of the user, who created the entry.
    entry_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.deletion.CASCADE
    )
    # identifier of the entrytype for the entry.
    cats = models.JSONField(default=list)
    last_modified = models.DateTimeField(auto_now=True)
    bib_type = models.CharField(max_length=30, default="")
    fields = models.JSONField(default=dict)  # all the fields

    def __str__(self):
        return self.entry_key

    class Meta:
        verbose_name_plural = "Entries"
