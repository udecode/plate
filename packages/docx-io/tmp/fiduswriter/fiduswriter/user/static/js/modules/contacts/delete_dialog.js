import {Dialog, postJson} from "../common"

//dialog for removing a user from contacts
export class DeleteContactDialog {
    constructor(contacts) {
        this.contacts = contacts
    }

    init() {
        return new Promise((resolve, reject) => {
            const buttons = [
                {
                    text: gettext("Delete"),
                    classes: "fw-dark",
                    click: () => {
                        postJson("/api/user/contacts/delete/", {
                            contacts: JSON.stringify(this.contacts)
                        }).then(({status}) => {
                            dialog.close()
                            if (status == 200) {
                                //user removed from contacts
                                return resolve()
                            }
                            return reject()
                        })
                    }
                },
                {
                    type: "cancel"
                }
            ]
            const dialog = new Dialog({
                title: gettext("Confirm deletion"),
                id: "confirmdeletion",
                body: `<p>${gettext("Remove from contacts")}?</p>`,
                height: 60,
                buttons
            })
            dialog.open()
        })
    }
}
