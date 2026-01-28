import {avatarTemplate, escapeText, langName} from "../common"

/** A template to confirm the deletion of a user avatar. */
export const confirmDeleteAvatarTemplate = () =>
    `<p>${gettext("Delete the avatar?")}</p>`

/** A template to change the user avatar. */
export const changeAvatarDialogTemplate = () =>
    `<span id="upload-avatar-btn" class="fw-button fw-light fw-large">
        ${gettext("Select a file")}
    </span>
    <label id="uploaded-avatar-name" class="ajax-upload-label"></label>`

/** A template for the confirmation dialog to delete a user account. */
export const deleteUserDialogTemplate = () =>
    `<h3>
        ${gettext("NOTICE: ALL OF YOUR INFORMATION WILL DISAPPEAR FROM OUR SYSTEM!")}
    </h3>
    <p>
        ${gettext("Really delete your account? Type in your username and password below to confirm deletion.")}
    </p>
    <p>
        ${gettext("We cannot reverse an account deletion.")}
    </p>
    <p>
        ${gettext("Some copies of your files may temporarily be kept in our backup system, but also these will disappear automatically in due time.")}
    </p>
    <form>
        <input type="text" id="username-confirmation" placeholder="${gettext("Username")}">
        <input type="password" id="password" autocomplete="new-password" placeholder="${gettext("Password")}">
    </form>`

/** A template for the change email dialog of the user account. */
export const changeEmailDialogTemplate = () =>
    `<table class="ui-dialog-content-table"><tbody>
        <tr><td>
            <form id="fw-add-email-form" action="" method="post" onsubmit="return false;">
                <input type="text" name="email" id="new-profile-email"
                        class="fw-profile-dialog-input"
                        placeholder="${gettext("Enter the new E-mail address")}" />
            </form>
        </td></tr>
        <tr><td><span id="fw-add-email-error" class="warning"></span></td></tr>
    </tbody></table>`

/** A template for the delete email dialog of the user account. */
export const deleteEmailDialogTemplate = ({text}) =>
    `<p>${escapeText(text)}</p>`

/** A template for the change primary email dialog of the user account. */
export const changePrimaryEmailDialogTemplate = ({text}) =>
    `<p>${escapeText(text)}</p>`

/** A template for the change password dialog of the user account. */
export const changePwdDialogTemplate = ({username}) =>
    `<table class="ui-dialog-content-table"><tbody>
        <tr><td><form id="fw-password-change-form" action="" method="post"
                onsubmit="return false;">
            <input type="text" id="current-username" autocomplete="username" value="${escapeText(username)}" style="display: none;">
            <input type="password" id="old-password-input" name="old_password" autocomplete="current-password"
                    class="fw-profile-dialog-input" placeholder="${gettext("Old password")}" /><br />
            <input type="password" id="new-password-input1" name="new_password1" autocomplete="new-password"
                    class="fw-profile-dialog-input" placeholder="${gettext("New password")}" /><br />
            <input type="password" id="new-password-input2" name="new_password2" autocomplete="new-password"
                    class="fw-profile-dialog-input"
                    placeholder="${gettext("Confirm the new password")}" />
        </form></td></tr>
        <tr><td><span id="fw-password-change-error" class="warning"></span></td></tr>
    </tbody></table>`

export const profileContents = (user, socialaccount_providers) =>
    `<div id="profile-wrapper" class="clearfix ui-dialog ui-dialog-fullpage">
        <div id="profile-avatar">
            ${avatarTemplate({user})}
            <div id="avatar-pulldown-wrapper">
                <span id="edit-avatar-btn" class="fw-link-text">
                    ${gettext("Edit profile picture")}
                </span>
                <select id="edit-avatar-pulldown">
                    <option value="change">${gettext("Change picture")}</option>
                    ${user.avatar ? `<option value="delete">${gettext("Delete picture")}</option>` : ""}
                </select>
            </div>
        </div>
        <div id="profile-data">
            <form>
                <div class="profile-data-row">
                    <label class="form-label">${gettext("Username")}</label>
                    <input type="text" name="username" id="username" autocomplete="username" value="${escapeText(user.username)}" />
                </div>
                <div class="profile-data-row">
                    <label class="form-label">${gettext("First name")}</label>
                    <input type="text" name="firstname" id="first_name" autocomplete="given-name" value="${escapeText(user.first_name)}" />
                </div>
                <div class="profile-data-row">
                    <label class="form-label">${gettext("Last name")}</label>
                    <input type="text" name="lastname" id="last_name" autocomplete="family-name" value="${escapeText(user.last_name)}" />
                </div>
                <div class="profile-data-row">
                    <label class="form-label">${gettext("Password")}</label>
                    <input type="password" value="******" autocomplete="new-password" readonly disabled />
                    <span id="fw-edit-profile-pwd" class="fw-link-text"><i class="fa fa-pencil-alt"></i></span>
                </div>
            </form>
            <div class="profile-data-row">
                <table class="fw-data-table profile-email-table">
                    <thead class="fw-data-table-header">
                        <tr>
                            <th>${gettext("Email")}</th>
                            <th>${gettext("Primary address")}</th>
                            <th>${gettext("Verified")}</th>
                            <th>&nbsp;&nbsp;&nbsp;&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${user.emails
                            .map(
                                email => `<tr${email.primary ? ' class="primary-email-tr"' : ""}>
                                    <td class="emailaddress">${email.address}</td>
                                    <td>
                                        ${
                                            email.verified
                                                ? `<input type="radio" class="primary-email-radio" value="${email.address}"
                                                    name="primaryemail"${email.primary ? " checked" : ""} />`
                                                : ""
                                        }
                                    </td>
                                    <td>
                                        ${email.verified ? '<i class="fa fa-check"></i>' : ""}
                                    </td>
                                    <td class="profile-email-action">
                                        ${
                                            email.primary
                                                ? "&nbsp;"
                                                : `<span class="delete-email fw-link-text" data-email="${email.address}">` +
                                                  '<i class="fa fa-trash-alt"></i>' +
                                                  "</span>"
                                        }
                                    </td>
                                </tr>`
                            )
                            .join("")}
                        <tr>
                            <td colspan="3"></td>
                            <td class="profile-email-action">
                                <span class="fw-link-text" id="add-profile-email">
                                    <i class="fa fa-plus-circle"></i>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="profile-data-row">
                <label class="form-label">${gettext("Language")}</label>
                <select name="language" id="language" class="entry-form dk fw-button fw-large">
                <option value="">${gettext("Default language")}</option>
                ${settings_LANGUAGES
                    .map(
                        ([code, _name]) =>
                            `<option value="${code}" ${user.language === code ? "selected" : ""}>${langName(code)}</option>`
                    )
                    .join("")}
                </select>
                <div class="fw-select-arrow fa fa-caret-down"></div>
            </div>
            ${
                socialaccount_providers.length
                    ? `<div class="profile-data-row">
                        <table class="fw-data-table profile-social-accounts-table">
                            <thead class="fw-data-table-header">
                                <tr>
                                    <th>${gettext("Social Account Provider")}</th>
                                    <th>${gettext("Username")}</th>
                                    <th>&nbsp;&nbsp;&nbsp;&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${socialaccount_providers
                                    .map(provider => {
                                        const account =
                                            user.socialaccounts.find(
                                                saccount =>
                                                    saccount.provider ===
                                                    provider.id
                                            )
                                        if (account) {
                                            return `<tr>
                                                    <td>${escapeText(provider.name)}</td>
                                                    <td>${escapeText(account.name)}</td>
                                                    <td>
                                                        <span class="delete-socialaccount fw-link-text" data-socialaccount="${account.id}" data-provider="${escapeText(provider.name)}">
                                                        <i class="fa fa-trash-alt"></i>
                                                        </span>
                                                    </td>
                                                </tr>`
                                        } else {
                                            return `<tr>
                                                    <td>${escapeText(provider.name)}</td>
                                                    <td>&nbsp;</td>
                                                    <td><a href="${provider.login_url}?process=connect">${gettext("Connect")}</a></td>
                                                </tr>`
                                        }
                                    })
                                    .join("")}
                            </tbody>
                        </table>
                    </div>`
                    : ""
            }
            <div id="profile-submit-wrapper">
                <span id="submit-profile" class="fw-button fw-dark">
                    ${gettext("Submit")}
                </span>
                <span id="delete-account" data-username="${user.username}" class="fw-button fw-orange">
                    ${gettext("Delete account")}
                </span>
            </div>
    </div>`
