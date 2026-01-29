from .models import Document
from django.db.models.signals import post_delete
from django.dispatch import receiver


@receiver(post_delete, sender=Document)
def delete_unused_template(sender, instance, **kwargs):
    if (
        instance.template.user
        and instance.template.document_set.count() == 0
        and instance.template.auto_delete
    ):
        # User's document template no longer used.
        instance.template.delete()
