from django.urls import re_path

from . import views

urlpatterns = [
    re_path(
        "^documentlist/$", views.get_documentlist, name="get_documentlist"
    ),
    re_path(
        "^documentlist/extra/$",
        views.get_documentlist_extra,
        name="get_documentlist_extra",
    ),
    re_path("^get_ws_base/$", views.get_ws_base, name="get_ws_base"),
    re_path("^delete/$", views.delete, name="delete"),
    re_path("^move/$", views.move, name="move"),
    re_path("^create_doc/$", views.create_doc, name="create_doc"),
    re_path("^import/create/$", views.import_create, name="import_create"),
    re_path("^import/image/$", views.import_image, name="import_image"),
    re_path("^import/$", views.import_doc, name="import_doc"),
    re_path("^upload/$", views.upload_revision, name="upload_revision"),
    re_path(
        "^get_revision/(?P<revision_id>[0-9]+)/$",
        views.get_revision,
        name="get_revision",
    ),
    re_path(
        "^delete_revision/$", views.delete_revision, name="delete_revision"
    ),
    re_path(
        "^get_access_rights/$",
        views.get_access_rights,
        name="get_access_rights",
    ),
    re_path(
        "^save_access_rights/$",
        views.save_access_rights,
        name="save_access_rights",
    ),
    re_path("^comment_notify/$", views.comment_notify, name="comment_notify"),
    re_path(
        "^admin/get_template/$",
        views.get_template_admin,
        name="get_template_admin",
    ),
    re_path(
        "^get_template/$",
        views.get_template,
        name="get_template",
    ),
    re_path(
        "^get_template_for_doc/$",
        views.get_template_for_doc,
        name="get_template_for_doc",
    ),
    re_path(
        "^admin/create_template/$",
        views.create_template_admin,
        name="create_template_admin",
    ),
    re_path(
        "^admin/get_template/(?P<type>base|extras)/$",
        views.get_template_admin,
        name="get_template_admin",
    ),
    re_path(
        "^admin/get_all_old/$", views.get_all_old_docs, name="get_all_old_docs"
    ),
    re_path("^admin/save_doc/$", views.save_doc, name="save_doc"),
    re_path(
        "^admin/add_images_to_doc/$",
        views.add_images_to_doc,
        name="add_images_to_doc",
    ),
    re_path(
        "^admin/get_all_revision_ids/$",
        views.get_all_revision_ids,
        name="get_all_revision_ids",
    ),
    re_path(
        "^admin/get_all_template_ids/$",
        views.get_all_template_ids,
        name="get_all_template_ids",
    ),
    re_path(
        "^admin/save_template/$", views.save_template, name="save_template"
    ),
    re_path(
        "^admin/get_user_biblist/$",
        views.get_user_biblist,
        name="get_user_biblist",
    ),
    re_path(
        "^admin/update_revision/$",
        views.update_revision,
        name="update_revision",
    ),
]
