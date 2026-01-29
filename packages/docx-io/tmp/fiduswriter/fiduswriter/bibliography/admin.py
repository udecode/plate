from django.contrib import admin
from bibliography.models import Entry, EntryCategory


class EntryCategoryAdmin(admin.ModelAdmin):
    pass


admin.site.register(EntryCategory, EntryCategoryAdmin)


class EntryAdmin(admin.ModelAdmin):
    pass


admin.site.register(Entry, EntryAdmin)
