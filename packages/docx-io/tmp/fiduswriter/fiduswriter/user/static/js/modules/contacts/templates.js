export const deleteContactCell = contact =>
    `<span class="fw-link-text delete-single-contact"
            data-type="${contact.type}" data-id="${contact.id}">
        <i class="fa fa-trash-alt"></i>
    </span>`

//template for contact adding dialog
export const addContactTemplate = () =>
    `<table class="ui-dialog-content-table"><tbody><tr><td>
        <input type="text" name="user_string" id="new-contact-user-string"
                placeholder="${gettext("E-mail address or username")}" />
    </td></tr></tbody></table>`

export const displayContactType = ({type}) => {
    switch (type) {
        case "user":
            return gettext("User")
        case "userinvite":
            return gettext("Invite you sent")
        case "to_userinvite":
            return gettext("Invite you received")
    }
}

export const respondInviteCell = contact =>
    `<button class="fw-button fw-small fw-dark respond-invite" data-id="${contact.id}">
    ${gettext("Respond")}
</button>`
