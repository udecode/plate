from django.contrib import admin
from django.shortcuts import render
from django.urls import path
from django.utils.translation import gettext as _
from . import models


class DocumentAdmin(admin.ModelAdmin):
    def get_urls(self):
        urls = super().get_urls()
        extra_urls = [
            path(
                "maintenance/",
                self.admin_site.admin_view(self.maintenance_view),
            )
        ]
        urls = extra_urls + urls
        return urls

    def maintenance_view(self, request):
        response = {}
        return render(request, "admin/document/maintenance.html", response)


admin.site.register(models.Document, DocumentAdmin)


class DocumentTemplateAdmin(admin.ModelAdmin):
    actions = [
        "duplicate",
    ]
    list_display = (
        "title",
        "user",
    )

    def duplicate(self, request, queryset):
        for template in queryset:
            document_styles = list(template.documentstyle_set.all())
            export_templates = list(template.exporttemplate_set.all())
            template.pk = None
            template.save()
            for ds in document_styles:
                style_files = list(ds.documentstylefile_set.all())
                ds.pk = None
                ds.document_template = template
                ds.save()
                for sf in style_files:
                    sf.pk = None
                    sf.style = ds
                    sf.save()
            for et in export_templates:
                et.pk = None
                et.document_template = template
                et.save()

    duplicate.short_description = _("Duplicate selected document templates")


admin.site.register(models.DocumentTemplate, DocumentTemplateAdmin)


class AccessRightAdmin(admin.ModelAdmin):
    pass


admin.site.register(models.AccessRight, AccessRightAdmin)


class DocumentRevisionAdmin(admin.ModelAdmin):
    pass


admin.site.register(models.DocumentRevision, DocumentRevisionAdmin)
