import {Dialog, postJson} from "../common"

export class RespondInviteDialog {
    constructor(
        invites,
        addCallback = _contacts => {},
        deleteCallback = _invites => {},
        doneCallback = () => {}
    ) {
        this.invites = invites
        this.addCallback = addCallback
        this.deleteCallback = deleteCallback
        this.doneCallback = doneCallback
    }

    init() {
        const buttons = [
            {
                text:
                    this.invites.length > 1
                        ? gettext("Accept all invites")
                        : gettext("Accept invite"),
                classes: "fw-dark",
                click: () => {
                    postJson("/api/user/invites/accept/", {
                        invites: JSON.stringify(this.invites)
                    }).then(({json, status}) => {
                        dialog.close()
                        if (status == 200) {
                            //user removed from contacts
                            this.deleteCallback(this.invites)
                            this.addCallback(json.contacts)
                            this.doneCallback()
                        }
                    })
                }
            },
            {
                text:
                    this.invites.length > 1
                        ? gettext("Decline all invites")
                        : gettext("Decline invite"),
                classes: "fw-dark",
                click: () => {
                    postJson("/api/user/invites/decline/", {
                        invites: JSON.stringify(this.invites)
                    }).then(({status}) => {
                        dialog.close()
                        if (status == 200) {
                            //user removed from contacts
                            this.deleteCallback(this.invites)
                            this.doneCallback()
                        }
                    })
                }
            },
            {
                type: "cancel"
            }
        ]
        const dialog = new Dialog({
            title: gettext("Accept of invite"),
            id: "confirmaccept",
            body: `<p>${
                this.invites.length > 1
                    ? gettext("Do you want to accept the below invites?")
                    : gettext("Do you want to accept the below invite?")
            }</p>
            ${this.invites.map(invite => `<p>${invite.name} (${invite.email})</p>`).join("")}`,
            height: 60,
            buttons
        })
        dialog.open()
    }
}
