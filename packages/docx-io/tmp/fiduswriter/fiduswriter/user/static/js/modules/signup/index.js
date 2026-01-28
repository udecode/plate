import {escapeText, postJson} from "../common"
import {PreloginPage} from "../prelogin"

export class Signup extends PreloginPage {
    constructor({app, language}) {
        super({app, language})
        this.title = gettext("Signup")
        if (settings_REGISTRATION_OPEN) {
            this.contents = `<div class="fw-login-left">
                <h1 class="fw-login-title">${gettext("Sign up")}</h1>
                <p>
                    ${gettext(
                        'Already have an account? Then please <a href="/" title="Login">login</a>.'
                    )}
                </p>
            </div>
            <div class="fw-login-right">
                <form>
                    <ul id="non-field-errors" class="errorlist"></ul>
                    <div class="input-wrapper">
                        <label for="id-username">${gettext("Choose your username")}</label>
                        <input type="text" name="username" placeholder="${gettext("Username")}" autofocus="autofocus" minlength="1" maxlength="150" required="" id="id-username" autocomplete="username">
                        <ul id="id-username-errors" class="errorlist"></ul>
                    </div>
                    <div class="input-wrapper">
                        <label for="id-password1">${gettext("Create a password")}</label>
                        <input type="password" name="password1" placeholder="${gettext("Password")}" required="" id="id-password1" autocomplete="new-password">
                        <ul id="id-password1-errors" class="errorlist"></ul>
                    </div>
                    <div class="input-wrapper">
                        <label for="id-password2">${gettext("Confirm your password")}</label>
                        <input type="password" name="password2" placeholder="${gettext("Password (again)")}" required="" id="id-password2" autocomplete="new-password">
                        <ul id="id-password2-errors" class="errorlist"></ul>
                    </div>
                    <div class="input-wrapper">
                        <label for="id-email">${gettext("E-mail address")}</label>
                        <input type="email" name="email" placeholder="${gettext("E-mail address")}" required="" id="id-email" autocomplete="email">
                        <ul id="id-email-errors" class="errorlist"></ul>
                    </div>
                    <div class="submit-wrapper">
                        <button class="fw-button fw-dark fw-uppercase" id="signup-submit" type="submit">${gettext("Sign up")}</button>
                    </div>
                </form>
            </div>`
        } else {
            this.contents = `<div class="fw-login-left">
                <h1 class="fw-login-title">${gettext("Sign Up Closed")}</h1>
                <p>${gettext("We are sorry, but the sign up is currently closed.")}</p>
            </div>`
        }

        // Note: We do not currently support plugins targetting only the signup page
    }

    bind() {
        super.bind()

        const signupSubmit = document.querySelector("#signup-submit")

        if (!settings_REGISTRATION_OPEN || !signupSubmit) {
            return
        }

        signupSubmit.addEventListener("click", event => {
            event.preventDefault()

            const nonFieldErrors = document.querySelector("#non-field-errors"),
                idUsername = document.querySelector("#id-username"),
                idUsernameErrors = document.querySelector(
                    "#id-username-errors"
                ),
                idPassword1 = document.querySelector("#id-password1"),
                idPassword1Errors = document.querySelector(
                    "#id-password1-errors"
                ),
                idPassword2 = document.querySelector("#id-password2"),
                idPassword2Errors = document.querySelector(
                    "#id-password2-errors"
                ),
                idEmail = document.querySelector("#id-email"),
                idEmailErrors = document.querySelector("#id-email-errors"),
                fwContents = document.querySelector(".fw-contents")

            if (
                !nonFieldErrors ||
                !idUsername ||
                !idUsernameErrors ||
                !idPassword1 ||
                !idPassword1Errors ||
                !idPassword2 ||
                !idPassword2Errors ||
                !idEmail ||
                !idEmailErrors ||
                !fwContents
            ) {
                return
            }

            nonFieldErrors.innerHTML = ""
            idUsernameErrors.innerHTML = ""
            idPassword1Errors.innerHTML = ""
            idPassword2Errors.innerHTML = ""
            idEmailErrors.innerHTML = ""

            const username = idUsername.value,
                password1 = idPassword1.value,
                password2 = idPassword2.value,
                email = idEmail.value
            let errors = false
            if (!username.length) {
                idUsernameErrors.innerHTML = `<li>${gettext("This field is required.")}</li>`
                errors = true
            }
            if (!password1.length) {
                idPassword1Errors.innerHTML = `<li>${gettext("This field is required.")}</li>`
                errors = true
            }
            if (!password2.length) {
                idPassword2Errors.innerHTML = `<li>${gettext("This field is required.")}</li>`
                errors = true
            }
            if (password1 !== password2) {
                idPassword2Errors.innerHTML = `<li>${gettext("You must type the same password each time.")}</li>`
                errors = true
            }
            if (!idEmail.checkValidity()) {
                idEmailErrors.innerHTML = `<li>${gettext("This is not a valid email.")}</li>`
                errors = true
            } else if (!email.length) {
                idEmailErrors.innerHTML = `<li>${gettext("This field is required.")}</li>`
                errors = true
            }
            if (errors) {
                return
            }
            const sendData = {username, password1, password2, email}
            if (this.app.inviteKey) {
                sendData["invite_key"] = this.app.inviteKey
            }
            postJson("/api/user/signup/", sendData)
                .then(({json}) => {
                    if (json.location === "/api/account/confirm-email/") {
                        fwContents.innerHTML = `<div class="fw-login-left">
                            <h1 class="fw-login-title">${gettext("Verify Your E-mail Address")}</h1>
                            <p>
                                ${interpolate(
                                    gettext(
                                        'We have sent an e-mail to <a href="mailto:%(email)s">%(email)s</a> for verification. Follow the link provided to finalize the signup process.'
                                    ),
                                    {email},
                                    true
                                )}
                                <br />
                                ${gettext(
                                    "Please contact us if you do not receive it within a few minutes."
                                )}
                            </p>
                        </div>`
                    } else {
                        window.history.pushState({}, "", "/")
                        this.app.init()
                    }
                })
                .catch(response =>
                    response.json().then(json => {
                        json.form.errors.forEach(
                            error =>
                                (nonFieldErrors.innerHTML += `<li>${escapeText(error)}</li>`)
                        )
                        json.form.fields.username.errors.forEach(
                            error =>
                                (idUsernameErrors.innerHTML += `<li>${escapeText(error)}</li>`)
                        )
                        json.form.fields.password1.errors.forEach(
                            error =>
                                (idPassword1Errors.innerHTML += `<li>${escapeText(error)}</li>`)
                        )
                        json.form.fields.password2.errors.forEach(
                            error =>
                                (idPassword2Errors.innerHTML += `<li>${escapeText(error)}</li>`)
                        )
                        json.form.fields.email.errors.forEach(
                            error =>
                                (idEmailErrors.innerHTML += `<li>${escapeText(error)}</li>`)
                        )
                    })
                )
        })
    }
}
