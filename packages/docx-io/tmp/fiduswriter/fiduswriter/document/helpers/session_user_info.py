from document.models import AccessRight, Document, DocumentTemplate


class SessionUserInfo:
    """
    Class for storing information about users in session
    author: akorovin
    """

    def __init__(self, current_user):
        self.user = current_user
        self.is_owner = False
        self.access_rights = "read"
        self.document_id = 0
        self.path = ""
        self.path_object = None

    async def create_doc(self, template_id):
        """
        Asynchronously create a new document
        """
        # Get the template asynchronously
        template = await DocumentTemplate.objects.filter(
            id=int(template_id)
        ).afirst()

        # Create document asynchronously
        if template:
            document = await Document.objects.acreate(
                owner_id=self.user.id, template=template
            )
        else:
            document = await Document.objects.acreate(owner_id=self.user.id)

        return document

    async def init_access(self, document_id) -> tuple[Document, bool]:
        """
        Asynchronously initializes access to document by id

        :param document_id: The ID of the document to access
        :return: Returns document and bool value that user can access
        :rtype: tuple
        """
        can_access = False

        # Use select_related to prefetch owner and template in one query
        document = (
            await Document.objects.select_related("owner", "template")
            .filter(id=int(document_id))
            .afirst()
        )

        if document is None:
            return (False, False)
        else:
            self.document_id = document.id

            # Now document.owner is already loaded, so this won't trigger a new query
            if document.owner.id == self.user.id:
                self.access_rights = "write"
                self.is_owner = True
                self.path = document.path
                self.path_object = document
                can_access = True
            else:
                self.is_owner = False

                # Get access rights asynchronously with prefetched relations
                access_right = await AccessRight.objects.filter(
                    document_id=document.id, user=self.user
                ).afirst()

                if access_right:
                    self.access_rights = access_right.rights
                    self.path = access_right.path
                    self.path_object = access_right
                    can_access = True

        return (document, can_access)
