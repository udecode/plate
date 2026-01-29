import {avatarTemplate, escapeText} from "../../common"

/** The access rights dialogue template */
export const accessRightOverviewTemplate = ({contacts, collaborators}) =>
    `<div id="my-contacts" class="fw-ar-container">
        <h3 class="fw-green-title">${gettext("My contacts")}</h3>
        <table class="fw-data-table">
            <thead class="fw-data-table-header"><tr><th width="337">${gettext("Contacts")}</th></tr></thead>
            <tbody class="fw-data-table-body fw-small">
                ${contactsTemplate({contacts})}
            </tbody>
        </table>
    </div>
    <span id="add-share-contact" class="fw-button fw-large fw-square fw-light fw-ar-button">
        <i class="fa fa-caret-right"></i>
    </span>
    <div id="share-contact" class="fw-ar-container">
        <h3 class="fw-green-title">${gettext("My collaborators")}</h3>
        <table class="fw-data-table tablesorter">
            <thead class="fw-data-table-header"><tr>
                    <th width="217">${gettext("Collaborators")}</th>
                    <th width="50" align="center">${gettext("Rights")}</th>
                    <th width="50" align="center">${gettext("Delete")}</th>
            </tr></thead>
            <tbody class="fw-data-table-body fw-small">
                ${collaboratorsTemplate({collaborators})}
            </tbody>
        </table>
    </div>`

/** The template for an individual row in the left hand side list of users (all contacts) of the access rights dialogue. */
export const contactsTemplate = ({contacts}) =>
    contacts
        .map(
            contact =>
                `<tr>
            <td width="337" data-id="${contact.id}" data-type="${contact.type}" class="fw-checkable fw-checkable-td">
                <span>${avatarTemplate({user: contact})}</span>
                <span class="fw-inline">
                ${
                    contact.type === "userinvite"
                        ? `${gettext("Invite")}:&nbsp;`
                        : ""
                }
                    ${escapeText(contact.name)}

                </span>
            </td>
        </tr>`
        )
        .join("")

/** The template for the right hand side list of users (the collaborators of the current document) of the access rights dialogue. */
export const collaboratorsTemplate = ({collaborators}) =>
    collaborators
        .map(
            collaborator =>
                `<tr id="collaborator-${collaborator.holder.type}-${collaborator.holder.id}"
    data-type="${collaborator.holder.type}" data-id="${collaborator.holder.id}"
    class="collaborator-tr" data-rights="${collaborator.rights}">
        <td width="215">
            <span>${avatarTemplate({user: collaborator.holder})}</span>
            <span class="fw-inline">${
                collaborator.holder.type === "userinvite"
                    ? `${gettext("Invite")}: `
                    : ""
            }${escapeText(collaborator.holder.name)}</span>
        </td>
        <td width="50" align="center">
            <div class="fw-inline edit-right-wrapper">
                <i class="icon-access-right icon-access-${collaborator.rights}"></i>
                <i class="fa fa-caret-down edit-right"></i>
            </div>
        </td>
        <td width="50" align="center">
            <span class="delete-collaborator fw-inline" data-rights="delete">
                <i class="fas fa-trash-alt fw-link-text"></i>
            </span>
        </td>
    </tr>`
        )
        .join("")
