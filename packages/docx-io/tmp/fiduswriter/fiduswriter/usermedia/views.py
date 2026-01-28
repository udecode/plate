from time import mktime
import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.core.serializers.python import Serializer
from django.utils.translation import gettext as _
from django.views.decorators.http import require_POST
from django.conf import settings

from base.decorators import ajax_required
from usermedia.models import Image, ImageCategory, UserImage
from .models import ALLOWED_FILETYPES


class SimpleSerializer(Serializer):
    def end_object(self, obj):
        self._current["id"] = obj._get_pk_val()
        self.objects.append(self._current)


serializer = SimpleSerializer()


# save changes or create a new entry
@login_required
@ajax_required
@require_POST
def save(request):
    response = {}
    response["errormsg"] = {}
    if (
        "image" in request.FILES
        and request.FILES["image"].content_type not in ALLOWED_FILETYPES
    ):
        status = 200  # Not implemented
        response["errormsg"]["error"] = _("Filetype not supported")
    elif (
        settings.MEDIA_MAX_SIZE
        and "image" in request.FILES
        and request.FILES["image"].size > settings.MEDIA_MAX_SIZE
    ):
        status = 413
        response["errormsg"]["error"] = _("Image too large")
    else:
        image = False
        if "id" in request.POST and "image" not in request.FILES:
            user_image = UserImage.objects.filter(
                image_id=int(request.POST["id"]), owner=request.user
            ).first()
            if user_image:
                image = user_image.image
                status = 200
        if image is False:
            image = Image()
            image.uploader = request.user
            user_image = UserImage()
            user_image.owner = request.user
            status = 201
            if "checksum" in request.POST:
                image.checksum = request.POST["checksum"]
        user_image.title = request.POST["title"]
        if "copyright" in request.POST:
            user_image.copyright = json.loads(request.POST["copyright"])
        if "cats" in request.POST:
            user_image.cats = json.loads(request.POST["cats"])
        if "image" in request.FILES:
            image.image = request.FILES["image"]
        if status == 201 and "image" not in request.FILES:
            status = 200
            response["errormsg"]["error"] = _("No file uploaded")
        else:
            image.save()
            user_image.image = image
            user_image.save()
            response["values"] = {
                "id": image.id,
                "title": user_image.title,
                "copyright": user_image.copyright,
                "image": image.image.url,
                "file_type": image.file_type,
                "added": mktime(image.added.timetuple()) * 1000,
                "checksum": image.checksum,
                "cats": user_image.cats,
            }
            if image.thumbnail:
                response["values"]["thumbnail"] = image.thumbnail.url
                response["values"]["height"] = image.height
                response["values"]["width"] = image.width
    return JsonResponse(response, status=status)


# delete an image
@login_required
@ajax_required
@require_POST
def delete(request):
    response = {}
    status = 201
    ids = request.POST.getlist("ids[]")
    UserImage.objects.filter(image_id__in=ids, owner=request.user).delete()
    for image in Image.objects.filter(id__in=ids):
        if image.is_deletable():
            image.delete()
    return JsonResponse(response, status=status)


# returns list of images
@login_required
@ajax_required
@require_POST
def images(request):
    response = {}
    status = 200
    response["imageCategories"] = serializer.serialize(
        ImageCategory.objects.filter(category_owner=request.user)
    )
    response["images"] = []
    user_images = UserImage.objects.filter(owner=request.user).select_related(
        "image"
    )
    for user_image in user_images:
        image = user_image.image
        if image.image:
            field_obj = {
                "id": image.id,
                "title": user_image.title,
                "copyright": user_image.copyright,
                "image": image.image.url,
                "file_type": image.file_type,
                "added": mktime(image.added.timetuple()) * 1000,
                "checksum": image.checksum,
                "cats": user_image.cats,
            }
            if image.thumbnail:
                field_obj["thumbnail"] = image.thumbnail.url
                field_obj["height"] = image.height
                field_obj["width"] = image.width
            response["images"].append(field_obj)
    return JsonResponse(response, status=status)


# save changes or create a new category
@login_required
@ajax_required
@require_POST
def save_category(request):
    response = {}
    response["entries"] = []
    ids = request.POST.getlist("ids[]")
    titles = request.POST.getlist("titles[]")
    ImageCategory.objects.filter(category_owner=request.user).exclude(
        id__in=ids
    ).delete()
    x = 0
    for the_id in ids:
        the_id = int(the_id)
        the_title = titles[x]
        x += 1
        if 0 == the_id:
            # if the category is new, then create new
            the_cat = ImageCategory(
                category_title=the_title, category_owner=request.user
            )
        else:
            # if the category already exists, update the title
            the_cat = ImageCategory.objects.get(pk=the_id)
            the_cat.category_title = the_title
        the_cat.save()
        response["entries"].append(
            {"id": the_cat.id, "category_title": the_cat.category_title}
        )
    status = 201

    return JsonResponse(response, status=status)
