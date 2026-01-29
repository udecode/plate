import {
    ContentMenu,
    Dialog,
    addAlert,
    findTarget,
    postJson,
    setCheckableLabel
} from "../../common"
import {AddContactDialog} from "../../contacts/add_dialog"
import {
    accessRightOverviewTemplate,
    collaboratorsTemplate,
    contactsTemplate
} from "./templates"

/**
 * Functions for the document access rights dialog.
 */

export class DocumentAccessRightsDialog {
    constructor(documentIds, contacts, newContactCall) {
        this.documentIds = documentIds
        this.contacts = contacts
        this.newContactCall = newContactCall // a function to be called when a new contact has been added with contact details
    }

    init() {
        postJson("/api/document/get_access_rights/", {
            document_ids: this.documentIds
        })
            .catch(error => {
                addAlert("error", gettext("Cannot load document access data."))
                throw error
            })
            .then(({json}) => {
                this.accessRights = json.access_rights
                this.createAccessRightsDialog()
            })
    }

    getDropdownMenu(currentRight, onChange) {
        return {
            content: [
                {
                    type: "header",
                    title: gettext("Basic"),
                    tooltip: gettext("Basic access rights")
                },
                {
                    type: "action",
                    title: gettext("Write"),
                    icon: "pencil-alt",
                    tooltip: gettext("Write"),
                    action: () => {
                        onChange("write")
                    },
                    selected: currentRight === "write"
                },
                {
                    type: "action",
                    title: gettext("Write tracked"),
                    icon: "pencil-alt",
                    tooltip: gettext("Write with changes tracked"),
                    action: () => {
                        onChange("write-tracked")
                    },
                    selected: currentRight === "write-tracked"
                },
                {
                    type: "action",
                    title: gettext("Comment"),
                    icon: "comment",
                    tooltip: gettext("Comment"),
                    action: () => {
                        onChange("comment")
                    },
                    selected: currentRight === "comment"
                },
                {
                    type: "action",
                    title: gettext("Read"),
                    icon: "eye",
                    tooltip: gettext("Read"),
                    action: () => {
                        onChange("read")
                    },
                    selected: currentRight === "read"
                },
                {
                    type: "header",
                    title: gettext("Review"),
                    tooltip: gettext(
                        "Access rights used within document review"
                    )
                },
                {
                    type: "action",
                    title: gettext("No comments"),
                    icon: "eye",
                    tooltip: gettext(
                        "Read document but not see comments and chats of others"
                    ),
                    action: () => {
                        onChange("read-without-comments")
                    },
                    selected: currentRight === "read-without-comments"
                },
                {
                    type: "action",
                    title: gettext("Review"),
                    icon: "comment",
                    tooltip: gettext(
                        "Comment, but not see comments and chats of others"
                    ),
                    action: () => {
                        onChange("review")
                    },
                    selected: currentRight === "review"
                },
                {
                    type: "action",
                    title: gettext("Review tracked"),
                    icon: "pencil-alt",
                    tooltip: gettext(
                        "Write with tracked changes, but not see comments and chats of others"
                    ),
                    action: () => {
                        onChange("review-tracked")
                    },
                    selected: currentRight === "review-tracked"
                }
            ]
        }
    }

    createAccessRightsDialog() {
        const docCollabs = {}

        // We are potentially dealing with access rights of several documents, so
        // we first need to find out which users have access on all of the documents.
        // Those are the access rights we will display in the dialog.
        this.accessRights.forEach(ar => {
            if (!this.documentIds.includes(ar.document_id)) {
                return
            }
            const holderIdent = ar.holder.type + ar.holder.id
            if (docCollabs[holderIdent]) {
                if (docCollabs[holderIdent].rights != ar.rights) {
                    // We use read rights if the user has different rights on different docs.
                    docCollabs[holderIdent].rights = "read"
                }
                docCollabs[holderIdent].count += 1
            } else {
                docCollabs[holderIdent] = Object.assign({}, ar)
                docCollabs[holderIdent].count = 1
            }
        })

        const collaborators = Object.values(docCollabs).filter(
            col => col.count === this.documentIds.length
        )

        const buttons = [
            {
                text:
                    settings_REGISTRATION_OPEN || settings_SOCIALACCOUNT_OPEN
                        ? gettext("Add contact or invite new user")
                        : gettext("Add contact"),
                classes: "fw-light fw-add-button",
                click: () => {
                    const dialog = new AddContactDialog()
                    dialog.init().then(contactsData => {
                        contactsData.forEach(contactData => {
                            if (contactData.id) {
                                document
                                    .querySelector(
                                        "#my-contacts .fw-data-table-body"
                                    )
                                    .insertAdjacentHTML(
                                        "beforeend",
                                        contactsTemplate({
                                            contacts: [contactData]
                                        })
                                    )
                                document
                                    .querySelector("#share-contact table tbody")
                                    .insertAdjacentHTML(
                                        "beforeend",
                                        collaboratorsTemplate({
                                            collaborators: [
                                                {
                                                    holder: contactData,
                                                    rights: "read"
                                                }
                                            ]
                                        })
                                    )
                                this.newContactCall(contactData)
                            } else {
                                document
                                    .querySelector("#share-contact table tbody")
                                    .insertAdjacentHTML(
                                        "beforeend",
                                        collaboratorsTemplate({
                                            collaborators: [
                                                {
                                                    holder: contactData,
                                                    rights: "read"
                                                }
                                            ]
                                        })
                                    )
                            }
                        })
                    })
                }
            },
            {
                text: gettext("Submit"),
                classes: "fw-dark",
                click: () => {
                    //apply the current state to server
                    const accessRights = []
                    document
                        .querySelectorAll("#share-contact .collaborator-tr")
                        .forEach(el => {
                            accessRights.push({
                                holder: {
                                    id: Number.parseInt(el.dataset.id),
                                    type: el.dataset.type
                                },
                                rights: el.dataset.rights
                            })
                        })
                    this.submitAccessRight(accessRights)
                    this.dialog.close()
                }
            },
            {
                type: "cancel"
            }
        ]
        this.dialog = new Dialog({
            title: gettext("Share your document with others"),
            id: "access-rights-dialog",
            width: 820,
            height: 440,
            body: accessRightOverviewTemplate({
                contacts: this.contacts,
                collaborators
            }),
            buttons
        })
        this.dialog.open()
        this.bindDialogEvents()
    }

    bindDialogEvents() {
        this.dialog.dialogEl
            .querySelector("#add-share-contact")
            .addEventListener("click", () => {
                const selectedData = []
                document
                    .querySelectorAll("#my-contacts .fw-checkable.checked")
                    .forEach(el => {
                        const collaboratorEl = document.getElementById(
                            `collaborator-${el.dataset.type}-${el.dataset.id}`
                        )
                        if (collaboratorEl) {
                            if (collaboratorEl.dataset.rights === "delete") {
                                collaboratorEl.dataset.rights = "read"
                                const accessRightIcon =
                                    collaboratorEl.querySelector(
                                        ".icon-access-right"
                                    )
                                accessRightIcon.classList.remove(
                                    "icon-access-delete"
                                )
                                accessRightIcon.classList.add(
                                    "icon-access-read"
                                )
                            }
                        } else {
                            const collaborator = this.contacts.find(
                                contact =>
                                    contact.type === el.dataset.type &&
                                    contact.id ===
                                        Number.parseInt(el.dataset.id)
                            )
                            if (!collaborator) {
                                console.warn(
                                    `No contact found of type: ${el.dataset.type} id: ${el.dataset.id}.`
                                )
                                return
                            }
                            selectedData.push({
                                holder: {
                                    id: collaborator.id,
                                    type: collaborator.type,
                                    name: collaborator.name,
                                    avatar: collaborator.avatar
                                },
                                rights: "read"
                            })
                        }
                    })

                document
                    .querySelectorAll("#my-contacts .checkable-label.checked")
                    .forEach(el => el.classList.remove("checked"))
                document
                    .querySelector("#share-contact table tbody")
                    .insertAdjacentHTML(
                        "beforeend",
                        collaboratorsTemplate({
                            collaborators: selectedData
                        })
                    )
            })
        this.dialog.dialogEl.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, ".fw-checkable", el):
                    setCheckableLabel(el.target)
                    break
                case findTarget(event, ".delete-collaborator", el): {
                    const colRow = el.target.closest(".collaborator-tr")
                    colRow.dataset.rights = "delete"
                    colRow
                        .querySelector(".icon-access-right")
                        .setAttribute(
                            "class",
                            "icon-access-right icon-access-delete"
                        )
                    break
                }
                case findTarget(event, ".edit-right", el): {
                    const colRow = el.target.closest(".collaborator-tr")
                    const currentRight = colRow.dataset.rights
                    const menu = this.getDropdownMenu(
                        currentRight,
                        newRight => {
                            colRow.dataset.rights = newRight
                            colRow
                                .querySelector(".icon-access-right")
                                .setAttribute(
                                    "class",
                                    `icon-access-right icon-access-${newRight}`
                                )
                        }
                    )
                    const contentMenu = new ContentMenu({
                        menu,
                        menuPos: {X: event.pageX, Y: event.pageY},
                        width: 200
                    })
                    contentMenu.open()
                    break
                }
                default:
                    break
            }
        })
    }

    submitAccessRight(newAccessRights) {
        postJson("/api/document/save_access_rights/", {
            document_ids: JSON.stringify(this.documentIds),
            access_rights: JSON.stringify(newAccessRights)
        })
            .then(() => {
                addAlert("success", gettext("Access rights have been saved"))
            })
            .catch(() =>
                addAlert("error", gettext("Access rights could not be saved"))
            )
    }
}
