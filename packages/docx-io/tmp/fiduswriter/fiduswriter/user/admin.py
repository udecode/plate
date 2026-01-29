from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from django.utils.translation import gettext_lazy as _

from . import models


class UserAdmin(DefaultUserAdmin):
    fieldsets = DefaultUserAdmin.fieldsets + (
        (_("Connections"), {"fields": ("contacts",)}),
    )


admin.site.register(models.User, UserAdmin)


class UserInviteAdmin(admin.ModelAdmin):
    pass


admin.site.register(models.UserInvite, UserInviteAdmin)
