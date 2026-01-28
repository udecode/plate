from django.contrib import admin
from usermedia.models import Image, UserImage, ImageCategory, DocumentImage


class ImageAdmin(admin.ModelAdmin):
    pass


admin.site.register(Image, ImageAdmin)


class UserImageAdmin(admin.ModelAdmin):
    pass


admin.site.register(UserImage, UserImageAdmin)


class DocumentImageAdmin(admin.ModelAdmin):
    pass


admin.site.register(DocumentImage, DocumentImageAdmin)


class ImageCategoryAdmin(admin.ModelAdmin):
    pass


admin.site.register(ImageCategory, ImageCategoryAdmin)
