import autobahn
import uuid
import atexit
import logging
import gc
import asyncio
from time import mktime, time
from copy import deepcopy

from asgiref.sync import sync_to_async
from django.db.utils import DatabaseError
from django.db.models import F, Q
from django.conf import settings
from django.db.utils import IntegrityError

from base.helpers.ws import get_url_base
from document.helpers.session_user_info import SessionUserInfo
from document import prosemirror
from document.helpers.serializers import PythonWithURLSerializer
from base.base_consumer import BaseWebsocketConsumer
from document.models import (
    COMMENT_ONLY,
    CAN_UPDATE_DOCUMENT,
    CAN_COMMUNICATE,
    FW_DOCUMENT_VERSION,
    DocumentTemplate,
)
from usermedia.models import Image, DocumentImage, UserImage
from user.helpers import Avatars

logger = logging.getLogger(__name__)


class WebsocketConsumer(BaseWebsocketConsumer):
    sessions = dict()
    history_length = 1000  # Only keep the last 1000 diffs

    async def connect(self):
        self.document_id = int(
            self.scope["url_route"]["kwargs"]["document_id"]
        )
        redirected = await self.check_server()
        if redirected:
            return
        connected = await super().connect()
        if not connected:
            return
        logger.debug(
            f"Action:Document socket opened by user. "
            f"URL:{self.endpoint} User:{self.user.id} ParticipantID:{self.id}"
        )

    async def check_server(self):
        # The correct server for the document may have changed since the client
        # received its initial connection information. For example, because the
        # number of servers has increased (all servers need to restart to have
        # the right setting).
        if len(settings.PORTS) < 2:
            return False
        # We compare the internal port
        actual_port = self.scope["server"][1]
        expected_conn = settings.PORTS[self.document_id % len(settings.PORTS)]
        expected_port = (
            expected_conn["internal"]
            if isinstance(expected_conn, dict)
            else expected_conn
        )
        if actual_port != expected_port:
            # Redirect to the correct URL
            await self.init()
            origin = (
                dict(self.scope["headers"]).get(b"origin", b"").decode("utf-8")
            )
            expected = get_url_base(origin, expected_conn)
            logger.debug(f"Redirecting from {actual_port} to {expected}.")
            await self.send_message({"type": "redirect", "base": expected})
            await self.do_close()
            return True
        return False

    async def confirm_diff(self, rid):
        response = {"type": "confirm_diff", "rid": rid}
        await self.send_message(response)

    async def subscribe(self, connection_count=0):
        # Create a new instance
        self.user_info = SessionUserInfo(self.user)

        # Initialize access asynchronously
        doc_db, can_access = await self.user_info.init_access(self.document_id)

        if not can_access or float(doc_db.doc_version) != FW_DOCUMENT_VERSION:
            await self.access_denied()
            return

        if (
            doc_db.id in WebsocketConsumer.sessions
            and len(WebsocketConsumer.sessions[doc_db.id]["participants"]) > 0
        ):
            logger.debug(
                f"Action:Serving already opened document. "
                f"URL:{self.endpoint} User:{self.user.id} "
                f" ParticipantID:{self.id}"
            )
            self.session = WebsocketConsumer.sessions[doc_db.id]
            self.id = max(self.session["participants"]) + 1
            self.session["participants"][self.id] = self
            template = False
        else:
            logger.debug(
                f"Action:Opening document from DB. "
                f"URL:{self.endpoint} User:{self.user.id} "
                f"ParticipantID:{self.id}"
            )
            self.id = 0
            if "type" not in doc_db.content:
                doc_db.content = deepcopy(doc_db.template.content)
                if "type" not in doc_db.content:
                    doc_db.content["type"] = "doc"
                if "content" not in doc_db.content:
                    doc_db.content["content"] = [{type: "title"}]
                await doc_db.asave()
            node = prosemirror.from_json(doc_db.content)
            self.session = {
                "doc": doc_db,
                "node": node,
                "node_updates": False,
                "participants": {0: self},
                "last_saved_version": doc_db.version,
            }
            WebsocketConsumer.sessions[doc_db.id] = self.session
            if self.user_info.access_rights == "write":
                template = True
            else:
                template = False
        logger.debug(
            f"Action:Participant ID Assigned. URL:{self.endpoint} "
            f"User:{self.user.id} ParticipantID:{self.id}"
        )
        await self.send_message({"type": "subscribed"})
        if connection_count < 1:
            await self.send_styles()
            await self.send_document(False, template)
        if connection_count >= 1:
            # If the user is reconnecting pass along access_rights to
            # front end to compare it with previous rights.
            await self.send_message(
                {
                    "type": "access_right",
                    "access_right": self.user_info.access_rights,
                }
            )
        if await self.can_communicate():
            await self.handle_participant_update()

    async def send_styles(self):
        doc_db = self.session["doc"]
        response = dict()
        response["type"] = "styles"

        # Create serializer and get data
        serializer = PythonWithURLSerializer()

        # These operations could be expensive - run them in parallel
        export_temps_task = sync_to_async(serializer.serialize)(
            doc_db.template.exporttemplate_set.all(),
            fields=["file_type", "template_file", "title"],
        )

        document_styles_task = sync_to_async(serializer.serialize)(
            doc_db.template.documentstyle_set.all(),
            use_natural_foreign_keys=True,
            fields=["title", "slug", "contents", "documentstylefile_set"],
        )

        # Run queries in parallel using asyncio.gather
        export_temps, document_styles = await asyncio.gather(
            export_temps_task, document_styles_task
        )

        # Get document templates
        document_templates = {}
        query = DocumentTemplate.objects.filter(
            Q(user=self.user) | Q(user=None)
        ).order_by(F("user").desc(nulls_first=True))

        # Use async for to properly consume the async iterator
        async for obj in query.aiterator():
            document_templates[obj.import_id] = {
                "title": obj.title,
                "id": obj.id,
            }

        response["styles"] = {
            "export_templates": [obj["fields"] for obj in export_temps],
            "document_styles": [obj["fields"] for obj in document_styles],
            "document_templates": document_templates,
        }
        await self.send_message(response)

    async def unfixable(self):
        await self.send_document()

    async def send_document(self, messages=False, template=False):
        response = dict()
        response["type"] = "doc_data"
        doc_owner = self.session["doc"].owner
        avatars = Avatars()

        # Use async avatar URL generation
        owner_avatar = await avatars.get_url_async(doc_owner)

        response["doc_info"] = {
            "id": self.session["doc"].id,
            "is_owner": self.user_info.is_owner,
            "access_rights": self.user_info.access_rights,
            "path": self.user_info.path,
            "owner": {
                "id": doc_owner.id,
                "name": doc_owner.readable_name,
                "username": doc_owner.username,
                "avatar": owner_avatar,
                "contacts": [],
            },
        }
        await sync_to_async(WebsocketConsumer.serialize_content)(self.session)
        response["doc"] = {
            "v": self.session["doc"].version,
            "content": self.session["doc"].content,
            "bibliography": self.session["doc"].bibliography,
            "images": {},
        }
        if template:
            response["doc"]["template"] = {
                "id": self.session["doc"].template.id,
                "content": self.session["doc"].template.content,
            }
        if messages:
            response["m"] = messages
        response["time"] = int(time()) * 1000

        # Get document images
        doc_id = self.session["doc"].id
        async for dimage in (
            DocumentImage.objects.filter(document_id=doc_id)
            .select_related("image")
            .only(
                "id",
                "title",
                "copyright",
                "image__id",
                "image__image",
                "image__file_type",
                "image__added",
                "image__checksum",
                "image__thumbnail",
                "image__height",
                "image__width",
            )
            .aiterator()
        ):
            image = dimage.image
            field_obj = {
                "id": image.id,
                "title": dimage.title,
                "copyright": dimage.copyright,
                "image": image.image.url,
                "file_type": image.file_type,
                "added": mktime(image.added.timetuple()) * 1000,
                "checksum": image.checksum,
                "cats": [],
            }
            if image.thumbnail:
                field_obj["thumbnail"] = image.thumbnail.url
                field_obj["height"] = image.height
                field_obj["width"] = image.width
            response["doc"]["images"][image.id] = field_obj

        if self.user_info.access_rights == "read-without-comments":
            response["doc"]["comments"] = []
        elif self.user_info.access_rights in ["review", "review-tracked"]:
            # Reviewer should only get his/her own comments
            filtered_comments = {}
            for key, value in list(self.session["doc"].comments.items()):
                if value["user"] == self.user_info.user.id:
                    filtered_comments[key] = value
            response["doc"]["comments"] = filtered_comments
        else:
            response["doc"]["comments"] = self.session["doc"].comments

        # Get contacts asynchronously
        contacts = []
        async for contact in (
            doc_owner.contacts.all()
            .only("id", "username", "first_name", "last_name")
            .aiterator()
        ):
            contacts.append(contact)

        # Get all avatars in parallel
        contact_avatars = await asyncio.gather(
            *[avatars.get_url_async(contact) for contact in contacts]
        )

        # Now add contacts with their avatars
        for i, contact in enumerate(contacts):
            contact_object = {
                "id": contact.id,
                "name": contact.readable_name,
                "username": contact.get_username(),
                "avatar": contact_avatars[i],
                "type": "user",
            }
            response["doc_info"]["owner"]["contacts"].append(contact_object)

        if self.user_info.is_owner:
            invites = []
            async for invite in doc_owner.invites_by.all().aiterator():
                invites.append(invite)
            for contact in invites:
                contact_object = {
                    "id": contact.id,
                    "name": contact.username,
                    "username": contact.username,
                    "avatar": None,
                    "type": "userinvite",
                }
                response["doc_info"]["owner"]["contacts"].append(
                    contact_object
                )

        response["doc_info"]["session_id"] = self.id
        await self.send_message(response)

    async def reject_message(self, message):
        if message["type"] == "diff":
            await self.send_message(
                {"type": "reject_diff", "rid": message["rid"]}
            )

    async def handle_message(self, message):
        if self.user_info.document_id not in WebsocketConsumer.sessions:
            logger.debug(
                f"Action:Receiving message for closed document. "
                f"URL:{self.endpoint} User:{self.user.id} "
                f"ParticipantID:{self.id}"
            )
            return
        if message["type"] == "get_document":
            await self.send_document()
        elif (
            message["type"] == "participant_update"
            and await self.can_communicate()
        ):
            await self.handle_participant_update()
        elif message["type"] == "chat" and await self.can_communicate():
            await self.handle_chat(message)
        elif message["type"] == "check_version":
            await self.check_version(message)
        elif message["type"] == "selection_change":
            await self.handle_selection_change(message)
        elif message["type"] == "diff" and await self.can_update_document():
            await self.handle_diff(message)
        elif message["type"] == "path_change":
            await self.handle_path_change(message)

    async def update_bibliography(self, bibliography_updates):
        for bu in bibliography_updates:
            if "id" not in bu:
                continue
            id = bu["id"]
            if bu["type"] == "update":
                self.session["doc"].bibliography[id] = bu["reference"]
            elif bu["type"] == "delete":
                del self.session["doc"].bibliography[id]

    async def update_images(self, image_updates):
        for iu in image_updates:
            if "id" not in iu:
                continue
            id = iu["id"]
            if iu["type"] == "update":
                # Ensure that access rights exist
                has_access = await UserImage.objects.filter(
                    image__id=id, owner=self.user_info.user
                ).aexists()

                if not has_access:
                    continue

                doc_image = await DocumentImage.objects.filter(
                    document_id=self.session["doc"].id, image_id=id
                ).afirst()

                if doc_image:
                    doc_image.title = iu["image"]["title"]
                    doc_image.copyright = iu["image"]["copyright"]
                    await doc_image.asave()
                else:
                    await DocumentImage.objects.acreate(
                        document_id=self.session["doc"].id,
                        image_id=id,
                        title=iu["image"]["title"],
                        copyright=iu["image"]["copyright"],
                    )
            elif iu["type"] == "delete":
                await DocumentImage.objects.filter(
                    document_id=self.session["doc"].id, image_id=id
                ).adelete()

                async for image in Image.objects.filter(id=id).aiterator():
                    can_delete = await sync_to_async(image.is_deletable)()
                    if can_delete:
                        await image.adelete()

    async def update_comments(self, comments_updates):
        comments_updates = deepcopy(comments_updates)
        for cd in comments_updates:
            if "id" not in cd:
                # ignore
                continue
            id = cd["id"]
            if cd["type"] == "create":
                self.session["doc"].comments[id] = {
                    "user": cd["user"],
                    "username": cd["username"],
                    "assignedUser": cd["assignedUser"],
                    "assignedUsername": cd["assignedUsername"],
                    "date": cd["date"],
                    "comment": cd["comment"],
                    "isMajor": cd["isMajor"],
                    "resolved": cd["resolved"],
                }
            elif cd["type"] == "delete":
                del self.session["doc"].comments[id]
            elif cd["type"] == "update":
                self.session["doc"].comments[id]["comment"] = cd["comment"]
                if "isMajor" in cd:
                    self.session["doc"].comments[id]["isMajor"] = cd["isMajor"]
                if "assignedUser" in cd and "assignedUsername" in cd:
                    self.session["doc"].comments[id]["assignedUser"] = cd[
                        "assignedUser"
                    ]
                    self.session["doc"].comments[id]["assignedUsername"] = cd[
                        "assignedUsername"
                    ]
                if "resolved" in cd:
                    self.session["doc"].comments[id]["resolved"] = cd[
                        "resolved"
                    ]
            elif cd["type"] == "add_answer":
                if "answers" not in self.session["doc"].comments[id]:
                    self.session["doc"].comments[id]["answers"] = []
                self.session["doc"].comments[id]["answers"].append(
                    {
                        "id": cd["answerId"],
                        "user": cd["user"],
                        "username": cd["username"],
                        "date": cd["date"],
                        "answer": cd["answer"],
                    }
                )
            elif cd["type"] == "delete_answer":
                answer_id = cd["answerId"]
                for answer in self.session["doc"].comments[id]["answers"]:
                    if answer["id"] == answer_id:
                        self.session["doc"].comments[id]["answers"].remove(
                            answer
                        )
            elif cd["type"] == "update_answer":
                answer_id = cd["answerId"]
                for answer in self.session["doc"].comments[id]["answers"]:
                    if answer["id"] == answer_id:
                        answer["answer"] = cd["answer"]

    async def handle_participant_update(self):
        await WebsocketConsumer.send_participant_list(
            self.user_info.document_id
        )

    async def handle_chat(self, message):
        chat = {
            "id": str(uuid.uuid4()),
            "body": message["body"],
            "from": self.user_info.user.id,
            "type": "chat",
        }
        await WebsocketConsumer.send_updates(chat, self.user_info.document_id)

    async def handle_selection_change(self, message):
        if (
            self.user_info.document_id in WebsocketConsumer.sessions
            and message["v"] == self.session["doc"].version
        ):
            await WebsocketConsumer.send_updates(
                message,
                self.user_info.document_id,
                self.id,
                self.user_info.user.id,
            )

    async def handle_path_change(self, message):
        if (
            self.user_info.document_id in WebsocketConsumer.sessions
            and self.user_info.path_object
        ):
            self.user_info.path_object.path = message["path"]
            await self.user_info.path_object.asave(
                update_fields=[
                    "path",
                ]
            )
            await WebsocketConsumer.send_updates(
                message,
                self.user_info.document_id,
                self.id,
                self.user_info.user.id,
            )

    # Checks if the diff only contains changes to comments.
    def only_comments(self, message):
        allowed_operations = ["addMark", "removeMark"]
        only_comment = True
        if "ds" in message:  # ds = document steps
            for step in message["ds"]:
                if not (
                    step["stepType"] in allowed_operations
                    and step["mark"]["type"] == "comment"
                ):
                    only_comment = False
        return only_comment

    async def handle_diff(self, message):
        pv = message["v"]
        dv = self.session["doc"].version
        logger.debug(
            f"Action:Handling Diff. URL:{self.endpoint} User:{self.user.id} "
            f"ParticipantID:{self.id} Client version:{pv} "
            f"Server version:{dv} Message:{message}"
        )
        if (
            self.user_info.access_rights in COMMENT_ONLY
            and not self.only_comments(message)
        ):
            logger.error(
                f"Action:Received non-comment diff from comment-only "
                f"collaborator.Discarding URL:{self.endpoint} "
                f"User:{self.user.id} ParticipantID:{self.id}"
            )
            return
        if pv == dv:
            if "ds" in message:  # ds = document steps
                updated_node = prosemirror.apply(
                    message["ds"], self.session["node"]
                )
                if updated_node:
                    self.session["node"] = updated_node
                    self.session["node_updates"] = True
                else:
                    await self.unfixable()
                    patch_msg = {
                        "type": "patch_error",
                        "user_id": self.user.id,
                    }
                    await self.send_message(patch_msg)
                    # Reset collaboration to avoid any data loss issues.
                    await self.reset_collaboration(
                        patch_msg, self.user_info.document_id, self.id
                    )
                    return
            self.session["doc"].diffs.append(message)
            self.session["doc"].diffs = self.session["doc"].diffs[
                -self.history_length :
            ]
            self.session["doc"].version += 1
            if "ti" in message:  # ti = title
                self.session["doc"].title = message["ti"][-255:]
            if "cu" in message:  # cu = comment updates
                await self.update_comments(message["cu"])
            if "bu" in message:  # bu = bibliography updates
                await self.update_bibliography(message["bu"])
            if "iu" in message:  # iu = image updates
                await self.update_images(message["iu"])
            if self.session["doc"].version % settings.DOC_SAVE_INTERVAL == 0:
                await WebsocketConsumer.save_document_async(
                    self.user_info.document_id
                )
            await self.confirm_diff(message["rid"])
            await WebsocketConsumer.send_updates(
                message,
                self.user_info.document_id,
                self.id,
                self.user_info.user.id,
            )
        elif pv < dv:
            if pv + len(self.session["doc"].diffs) >= dv:
                # We have enough diffs stored to fix it.
                number_diffs = dv - pv
                logger.debug(
                    f"Action:Resending document diffs. URL:{self.endpoint} "
                    f"User:{self.user.id} ParticipantID:{self.id} "
                    f"number of messages to be resent:{number_diffs}"
                )
                messages = self.session["doc"].diffs[-number_diffs:]
                for message in messages:
                    new_message = message.copy()
                    new_message["server_fix"] = True
                    await self.send_message(new_message)
            else:
                logger.debug(
                    f"Action:User is on a very old version of the document. "
                    f"URL:{self.endpoint} User:{self.user.id} "
                    f"ParticipantID:{self.id}"
                )
                # Client has a version that is too old to be fixed
                await self.unfixable()
                return
        else:
            # Client has a higher version than server. Something is fishy!
            logger.debug(
                f"Action:User has higher document version than server.Fishy! "
                f"URL:{self.endpoint} User:{self.user.id} "
                f"ParticipantID:{self.id}"
            )

    async def check_version(self, message):
        pv = message["v"]
        dv = self.session["doc"].version
        logger.debug(
            f"Action:Checking version of document. URL:{self.endpoint} "
            f"User:{self.user.id} ParticipantID:{self.id} "
            f"Client document version:{pv} Server document version:{dv}"
        )
        if pv == dv:
            response = {
                "type": "confirm_version",
                "v": pv,
            }
            await self.send_message(response)
            return
        elif pv > dv:
            logger.debug(
                f"Action:User is on a newer version of the document. "
                f"URL:{self.endpoint} User:{self.user.id} "
                f"ParticipantID:{self.id}"
            )
            await self.unfixable()
            return
        elif pv + len(self.session["doc"].diffs) >= dv:
            number_diffs = dv - pv
            logger.debug(
                f"Action:Resending document diffs. URL:{self.endpoint} "
                f"User:{self.user.id} ParticipantID:{self.id}"
                f"number of messages to be resent:{number_diffs}"
            )
            messages = self.session["doc"].diffs[-number_diffs:]
            await self.send_document(messages)
            return
        else:
            logger.debug(
                f"Action:User is on a very old version of the document. "
                f"URL:{self.endpoint} User:{self.user.id} "
                f"ParticipantID:{self.id}"
            )
            # Client has a version that is too old
            await self.unfixable()
            return

    async def can_update_document(self):
        return self.user_info.access_rights in CAN_UPDATE_DOCUMENT

    async def can_communicate(self):
        return self.user_info.access_rights in CAN_COMMUNICATE

    async def disconnect(self, code):
        if (
            hasattr(self, "endpoint")
            and hasattr(self, "user")
            and hasattr(self, "id")
        ):
            logger.debug(
                f"Action:Closing websocket. URL:{self.endpoint} "
                f"User:{self.user.id} ParticipantID:{self.id}"
            )
        if (
            hasattr(self, "session")
            and hasattr(self, "user_info")
            and hasattr(self.user_info, "document_id")
        ):
            doc_id = self.user_info.document_id
            if doc_id in WebsocketConsumer.sessions:
                # Clear this participant's specific resources
                if (
                    hasattr(self, "id")
                    and self.id in self.session["participants"]
                ):
                    # Remove this participant
                    self.session["participants"].pop(self.id)

                # Complete document cleanup if no participants remain
                if len(self.session["participants"]) == 0:
                    # Save before cleanup
                    await WebsocketConsumer.save_document_async(doc_id)

                    # Break references manually before deleting
                    session = WebsocketConsumer.sessions[doc_id]

                    # Clear prosemirror node structure
                    if "node" in session:
                        # Recursively break node references if possible
                        session["node"] = None

                    # Clear diff history completely
                    if "doc" in session and hasattr(session["doc"], "diffs"):
                        session["doc"].diffs = None  # Not just an empty list

                    # Remove complete session
                    WebsocketConsumer.sessions.pop(doc_id, None)

                    # Force garbage collection
                    gc.collect()

                else:
                    try:
                        # Update participant list if there are still participants
                        await WebsocketConsumer.send_participant_list(
                            self.user_info.document_id
                        )
                    except autobahn.exception.Disconnected:
                        logger.error(
                            "Error sending participant list over disconnected session"
                        )

            # Clear any remaining references to large objects
            if hasattr(self, "session"):
                self.session = None
            if hasattr(self, "user_info"):
                self.user_info = None
            await self.close()

    @classmethod
    async def send_participant_list(cls, document_id):
        if document_id in WebsocketConsumer.sessions:
            avatars = Avatars()
            participant_list = []

            # Create a list of tasks to get avatars
            avatar_tasks = []
            participants_data = []

            for session_id, waiter in list(
                cls.sessions[document_id]["participants"].items()
            ):
                access_rights = waiter.user_info.access_rights
                if access_rights not in CAN_COMMUNICATE:
                    continue
                participants_data.append(
                    {
                        "session_id": session_id,
                        "id": waiter.user_info.user.id,
                        "name": waiter.user_info.user.readable_name,
                        "user": waiter.user_info.user,
                    }
                )
                # Add task to get avatar
                avatar_tasks.append(
                    avatars.get_url_async(waiter.user_info.user)
                )

            # Get all avatars in parallel
            if avatar_tasks:
                avatar_urls = await asyncio.gather(*avatar_tasks)

                # Now build the participant list with avatars
                for i, data in enumerate(participants_data):
                    participant_list.append(
                        {
                            "session_id": data["session_id"],
                            "id": data["id"],
                            "name": data["name"],
                            "avatar": avatar_urls[i],
                        }
                    )

            message = {
                "participant_list": participant_list,
                "type": "connections",
            }
            await WebsocketConsumer.send_updates(message, document_id)

    @classmethod
    async def reset_collaboration(
        cls, patch_exception_msg, document_id, sender_id
    ):
        logger.debug(
            f"Action:Resetting collaboration. DocumentID:{document_id} "
            f"Patch conflict triggered. ParticipantID:{sender_id} "
            f"waiters:{len(cls.sessions[document_id]['participants'])}"
        )

        # Create a list of coroutines to execute
        tasks = []

        for waiter in list(cls.sessions[document_id]["participants"].values()):
            if waiter.id != sender_id:
                tasks.append(waiter.unfixable())
                tasks.append(waiter.send_message(patch_exception_msg))

        # Execute all tasks concurrently
        if tasks:
            await asyncio.gather(*tasks)

    @classmethod
    async def send_updates(
        cls, message, document_id, sender_id=None, user_id=None
    ):
        logger.debug(
            f"Action:Sending message to waiters. DocumentID:{document_id} "
            f"waiters:{len(cls.sessions[document_id]['participants'])}"
        )

        # Create a list of send tasks to execute concurrently
        send_tasks = []

        for waiter in list(cls.sessions[document_id]["participants"].values()):
            if waiter.id != sender_id:
                access_rights = waiter.user_info.access_rights
                msg_to_send = message

                # Check if we need to modify the message based on access rights
                need_copy = False

                if "comments" in message and len(message["comments"]) > 0:
                    # Filter comments if needed
                    if access_rights == "read-without-comments":
                        need_copy = True
                    elif (
                        access_rights in ["review", "review-tracked"]
                        and user_id != waiter.user_info.user.id
                    ):
                        need_copy = True
                elif (
                    message["type"] in ["chat", "connections"]
                    and access_rights not in CAN_COMMUNICATE
                ):
                    continue
                elif (
                    message["type"] == "selection_change"
                    and access_rights not in CAN_COMMUNICATE
                    and user_id != waiter.user_info.user.id
                ):
                    continue
                elif (
                    message["type"] == "path_change"
                    and user_id != waiter.user_info.user.id
                ):
                    continue

                # Create a copy of the message if needed to modify it
                if need_copy:
                    msg_to_send = deepcopy(message)
                    msg_to_send["comments"] = []

                # Add the send task to our list
                send_tasks.append(waiter.send_message(msg_to_send))

        # Execute all send tasks concurrently
        if send_tasks:
            await asyncio.gather(*send_tasks)

    @classmethod
    def serialize_content(cls, session):
        if "node_updates" in session and session["node_updates"]:
            session["doc"].content = prosemirror.to_mini_json(session["node"])
            session["node_updates"] = False

    @classmethod
    async def save_document_async(cls, document_id):
        session = cls.sessions[document_id]
        if session["doc"].version == session["last_saved_version"]:
            return
        logger.debug(
            f"Action:Saving document to DB. DocumentID:{session['doc'].id} "
            f"Doc version:{session['doc'].version}"
        )
        cls.serialize_content(session)
        try:
            # this try block is to avoid a db exception
            # in case the doc has been deleted from the db
            # in fiduswriter the owner of a doc could delete a doc
            # while an invited writer is editing the same doc
            await session["doc"].asave(
                update_fields=[
                    "title",
                    "version",
                    "content",
                    "diffs",
                    "comments",
                    "bibliography",
                    "updated",
                ]
            )

        except DatabaseError as e:
            expected_msg = "Save with update_fields did not affect any rows."
            if str(e) == expected_msg:
                try:
                    await session["doc"].asave()
                except IntegrityError:
                    pass
            else:
                raise e
        session["last_saved_version"] = session["doc"].version

    @classmethod
    def save_document(cls, document_id):
        session = cls.sessions[document_id]
        if session["doc"].version == session["last_saved_version"]:
            return
        logger.debug(
            f"Action:Saving document to DB. DocumentID:{session['doc'].id} "
            f"Doc version:{session['doc'].version}"
        )
        cls.serialize_content(session)
        try:
            # this try block is to avoid a db exception
            # in case the doc has been deleted from the db
            # in fiduswriter the owner of a doc could delete a doc
            # while an invited writer is editing the same doc
            session["doc"].save(
                update_fields=[
                    "title",
                    "version",
                    "content",
                    "diffs",
                    "comments",
                    "bibliography",
                    "updated",
                ]
            )

        except DatabaseError as e:
            expected_msg = "Save with update_fields did not affect any rows."
            if str(e) == expected_msg:
                try:
                    session["doc"].save()
                except IntegrityError:
                    pass
            else:
                raise e
        session["last_saved_version"] = session["doc"].version

    @classmethod
    def save_all_docs(cls):
        for document_id in cls.sessions:
            cls.save_document(document_id)


atexit.register(WebsocketConsumer.save_all_docs)
