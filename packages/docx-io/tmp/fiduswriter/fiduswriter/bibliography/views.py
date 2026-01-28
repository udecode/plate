import time
import json

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Max, Count
from django.core.serializers.python import Serializer
from django.views.decorators.http import require_POST

from base.decorators import ajax_required

from bibliography.models import Entry, EntryCategory


class SimpleSerializer(Serializer):
    def end_object(self, obj):
        self._current["id"] = obj._get_pk_val()
        self.objects.append(self._current)


serializer = SimpleSerializer()


# returns list of bibliography items
@login_required
@require_POST
@ajax_required
def biblist(request):
    response = {}
    last_modified_onclient = int(request.POST["last_modified"])
    number_of_entries_onclient = int(request.POST["number_of_entries"])
    aggregation_values = Entry.objects.filter(
        entry_owner=request.user.id
    ).aggregate(Max("last_modified"), Count("id"))
    last_modified__max = aggregation_values["last_modified__max"]
    number_of_entries_onserver = aggregation_values["id__count"]
    if last_modified__max:
        last_modified_onserver = int(
            time.mktime(last_modified__max.timetuple())
        )
    else:
        last_modified_onserver = 0
    if (
        last_modified_onclient < last_modified_onserver
        or number_of_entries_onclient > number_of_entries_onserver
        or request.user.id != int(request.POST["user_id"])
    ):
        entries = Entry.objects.filter(entry_owner=request.user).values(
            "id",
            "entry_key",
            "entry_owner",
            "bib_type",
            "cats",
            "fields",
        )
        response["bib_list"] = list(entries)
        response["last_modified"] = last_modified_onserver
        response["number_of_entries"] = number_of_entries_onserver
    response["bib_categories"] = serializer.serialize(
        EntryCategory.objects.filter(category_owner=request.user)
    )
    response["user_id"] = request.user.id
    status = 200
    return JsonResponse(response, status=status)


# save bibliography entries from bibtex importer or form
@login_required
@require_POST
@ajax_required
def save(request):
    response = {}
    bibs = json.loads(request.POST["bibs"])
    status = 200
    response["id_translations"] = []
    for b_id in list(bibs.keys()):
        bib = bibs[b_id]
        if request.POST["is_new"] == "true":
            inserting_obj = {
                "entry_owner_id": request.user.id,
                "entry_key": bib["entry_key"][-64:],
                "bib_type": bib["bib_type"],
                "cats": bib["cats"],
                "fields": bib["fields"],
            }
            similar = Entry.objects.filter(**inserting_obj).first()
            if similar:
                response["id_translations"].append([b_id, similar.id])
            else:
                the_entry = Entry(**inserting_obj)
                the_entry.save()
                response["id_translations"].append([b_id, the_entry.id])

        else:
            the_entry = Entry.objects.get(id=b_id)
            the_entry.entry_key = bib["entry_key"][-64:]
            the_entry.bib_type = bib["bib_type"]
            the_entry.cats = bib["cats"]
            the_entry.fields = bib["fields"]
            the_entry.save()
            response["id_translations"].append([b_id, the_entry.id])
    return JsonResponse(response, status=status)


# delete an entry
@login_required
@require_POST
@ajax_required
def delete(request):
    response = {}
    status = 201
    ids = request.POST.getlist("ids[]")
    id_chunks = [ids[x : x + 100] for x in range(0, len(ids), 100)]
    for id_chunk in id_chunks:
        Entry.objects.filter(
            pk__in=id_chunk, entry_owner=request.user
        ).delete()
    return JsonResponse(response, status=status)


# save changes or create a new category
@login_required
@require_POST
@ajax_required
def save_category(request):
    response = {}
    response["entries"] = []
    ids = request.POST.getlist("ids[]")
    titles = request.POST.getlist("titles[]")
    EntryCategory.objects.filter(category_owner=request.user).exclude(
        id__in=ids
    ).delete()
    x = 0
    for the_id in ids:
        the_id = int(the_id)
        the_title = titles[x]
        x += 1
        if 0 == the_id:
            # if the category is new, then create new
            the_cat = EntryCategory(
                category_title=the_title, category_owner=request.user
            )
        else:
            # if the category already exists, update the title
            the_cat = EntryCategory.objects.get(pk=the_id)
            the_cat.category_title = the_title
        the_cat.save()
        response["entries"].append(
            {"id": the_cat.id, "category_title": the_cat.category_title}
        )
    status = 201

    return JsonResponse(response, status=status)


# Delete one or more categories
@login_required
@require_POST
@ajax_required
def delete_category(request):
    response = {}
    status = 201
    ids = request.POST.getlist("ids[]")
    EntryCategory.objects.filter(pk__in=ids, entry_owner=request.user).delete()
    return JsonResponse(response, status=status)
