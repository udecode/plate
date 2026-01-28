import json
from copy import deepcopy

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.views.decorators.http import require_POST

from base.decorators import ajax_required
from document.models import DocumentTemplate, FW_DOCUMENT_VERSION
from document.helpers.serializers import PythonWithURLSerializer
from style.models import DocumentStyle, DocumentStyleFile, ExportTemplate


@login_required
@ajax_required
@require_POST
def get_template(request):
    id = int(request.POST["id"])
    if id == 0:
        doc_template = DocumentTemplate()
        doc_template.user = request.user
        doc_template.save()
        status = 201
    else:
        doc_template = (
            DocumentTemplate.objects.filter(id=id)
            .filter(Q(user=request.user) | Q(user=None))
            .first()
        )
        status = 200
    if doc_template is None:
        return JsonResponse({}, status=405)
    serializer = PythonWithURLSerializer()
    export_templates = serializer.serialize(
        doc_template.exporttemplate_set.all()
    )
    document_styles = serializer.serialize(
        doc_template.documentstyle_set.all(),
        use_natural_foreign_keys=True,
        fields=["title", "slug", "contents", "documentstylefile_set"],
    )
    response = {
        "id": doc_template.id,
        "title": doc_template.title,
        "content": doc_template.content,
        "doc_version": doc_template.doc_version,
        "export_templates": export_templates,
        "document_styles": document_styles,
    }
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def list(request):
    response = {}
    status = 200
    doc_templates = DocumentTemplate.objects.filter(
        Q(user=request.user) | Q(user=None)
    )
    date_format = "%Y-%m-%d"
    response["document_templates"] = [
        {
            "id": obj.id,
            "title": obj.title,
            "is_owner": (obj.user is not None),
            "added": obj.added.strftime(date_format),
            "updated": obj.updated.strftime(date_format),
        }
        for obj in doc_templates
    ]
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def save(request):
    id = request.POST["id"]
    doc_template = DocumentTemplate.objects.filter(
        id=id, user=request.user
    ).first()
    if doc_template is None:
        return JsonResponse({}, status=405)
    response = {}
    status = 200
    doc_template.content = json.loads(request.POST["value"])
    doc_template.title = request.POST["title"]
    doc_template.import_id = request.POST["import_id"]
    doc_template.save()
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def create(request):
    response = {}
    title = request.POST.get("title")
    content = json.loads(request.POST.get("content"))
    import_id = request.POST.get("import_id")
    document_styles = json.loads(request.POST.get("document_styles"))
    export_templates = json.loads(request.POST.get("export_templates"))
    counter = 0
    base_title = title
    while DocumentTemplate.objects.filter(
        Q(title=title), Q(user=request.user) | Q(user=None)
    ).first():
        counter += 1
        title = f"{base_title} {counter}"
    template = DocumentTemplate.objects.create(
        title=title,
        content=content,
        doc_version=FW_DOCUMENT_VERSION,
        import_id=import_id,
        user=request.user,
    )
    response["id"] = template.id
    response["title"] = template.title
    date_format = "%Y-%m-%d"
    response["added"] = template.added.strftime(date_format)
    response["updated"] = template.updated.strftime(date_format)
    files = request.FILES.getlist("files[]")
    for style in document_styles:
        doc_style = DocumentStyle.objects.create(
            title=style["title"],
            slug=style["slug"],
            contents=style["contents"],
            document_template=template,
        )
        for filepath in style["files"]:
            filename = filepath.split("/").pop()
            file = next((x for x in files if x.name == filename), None)
            if file:
                DocumentStyleFile.objects.create(file=file, style=doc_style)
    for e_template in export_templates:
        filename = e_template["file"].split("/").pop()
        file = next((x for x in files if x.name == filename), None)
        if file:
            ExportTemplate.objects.create(
                document_template=template,
                template_file=file,
                file_type=e_template["file_type"],
            )
    return JsonResponse(response, status=201)


@login_required
@ajax_required
@require_POST
def copy(request):
    response = {}
    status = 201
    id = request.POST["id"]
    title = request.POST["title"]
    doc_template = DocumentTemplate.objects.filter(
        Q(id=id), Q(user=request.user) | Q(user=None)
    ).first()
    if doc_template is None:
        return JsonResponse({}, status=405)
    counter = 0
    base_title = title
    while DocumentTemplate.objects.filter(
        Q(title=title), Q(user=request.user) | Q(user=None)
    ).first():
        counter += 1
        title = f"{base_title} {counter}"
    base_import_id = doc_template.import_id
    counter = 0
    import_id = f"{base_import_id}-{counter}"
    while DocumentTemplate.objects.filter(
        Q(import_id=import_id), Q(user=request.user) | Q(user=None)
    ).first():
        counter += 1
        import_id = f"{base_import_id}-{counter}"
    document_styles = [style for style in doc_template.documentstyle_set.all()]
    export_templates = [
        template for template in doc_template.exporttemplate_set.all()
    ]
    content = deepcopy(doc_template.content)
    content["attrs"]["template"] = title
    content["attrs"]["import_id"] = import_id
    new_doc_template = DocumentTemplate(
        title=title, import_id=import_id, user=request.user, content=content
    )
    new_doc_template.save()
    for ds in document_styles:
        style_files = [file for file in ds.documentstylefile_set.all()]
        ds.pk = None
        ds.document_template = new_doc_template
        ds.save()
        for sf in style_files:
            sf.pk = None
            sf.style = ds
            sf.save()
    for et in export_templates:
        et.pk = None
        et.document_template = new_doc_template
        et.save()
    response["id"] = new_doc_template.id
    response["title"] = new_doc_template.title
    return JsonResponse(response, status=status)


@login_required
@ajax_required
@require_POST
def delete(request):
    response = {}
    status = 405
    id = int(request.POST["id"])
    doc_template = DocumentTemplate.objects.filter(
        pk=id, user=request.user
    ).first()
    if doc_template:
        status = 200
        if doc_template.is_deletable():
            doc_template.delete()
            response["done"] = True
        else:
            response["done"] = False
    return JsonResponse(response, status=status)
