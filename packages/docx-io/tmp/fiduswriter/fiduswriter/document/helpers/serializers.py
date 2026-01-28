from django.core import serializers
from django.db import models
from asgiref.sync import sync_to_async

PythonSerializer = serializers.get_serializer("python")


class PythonWithURLSerializer(PythonSerializer):
    def handle_field(self, obj, field):
        value = field.value_from_object(obj)
        if isinstance(field, models.FileField) and hasattr(value, "url"):
            self._current[field.name] = value.url
        else:
            return super().handle_field(obj, field)

    def end_object(self, obj):
        # We add reverse foreign key relations if they are explicitly added.
        # Needed to include DocumentStyleFont with DocumentStyle
        if self.selected_fields is not None:
            for field in obj._meta.related_objects:
                if not field.one_to_many:
                    continue
                if field.related_name:
                    related_name = field.related_name
                else:
                    related_name = f"{field.name}_set"
                if related_name not in self.selected_fields:
                    continue
                if self.use_natural_foreign_keys and hasattr(
                    field.remote_field.model, "natural_key"
                ):

                    def o2m_value(value):
                        return value.natural_key()

                else:

                    def o2m_value(value):
                        return self._value_from_field(value, value._meta.pk)

                self._current[related_name] = [
                    o2m_value(related)
                    for related in getattr(obj, related_name).iterator()
                ]

        return super().end_object(obj)

    # Add an async version for Django 5.1 compatibility
    async def aserialize(self, queryset, **options):
        """
        Asynchronous version of serialize method for use with async code
        """
        return await sync_to_async(self.serialize)(queryset, **options)
