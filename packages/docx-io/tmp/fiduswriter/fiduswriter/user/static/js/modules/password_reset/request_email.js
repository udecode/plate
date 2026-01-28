import {escapeText, post} from "../common"
import {PreloginPage} from "../prelogin"

export class PasswordResetRequest extends PreloginPage {
    constructor({app, language}) {
        super({app, language})
        this.title = gettext("Reset Password")
        // Note: We do not currently support plugins targetting only the reset password page
    }

    render() {
        this.contents = `<div class="fw-login-left">
            <h1 class="fw-login-title">${gettext("Password reset")}</h1>
            <p>${gettext("Forgotten your password? Enter your e-mail address in the form, and we'll send you an e-mail allowing you to reset it.")}</p>
            <p>${interpolate(
                gettext(
                    'If you have any trouble resetting your password, please <a href="mailto:%(contactEmail)s">contact us</a>.'
                ),
                {contactEmail: settings_CONTACT_EMAIL},
                true
            )}</p>
        </div>
        <div class="fw-login-right">
            <form>
                <ul id="non-field-errors" class="errorlist"></ul>
                <div class="input-wrapper">
                    <label for="id-email">${gettext("E-mail address")}</label>
                    <input type="email" name="email" size="30" placeholder="${gettext("E-mail address")}" required="" id="id-email" autocomplete="email">
                    <ul id="id-email-errors" class="errorlist"></ul>
                </div>
                <div class="submit-wrapper">
                    <button class="fw-button fw-dark fw-uppercase" id="email-submit" type="submit">${gettext("Reset My Password")}</button>
                </div>
            </form>
        </div>`
        super.render()
    }

    bind() {
        super.bind()

        const emailInput = document.getElementById("id-email")
        if (emailInput) {
            emailInput.focus()
        }

        document
            .getElementById("email-submit")
            .addEventListener("click", event => {
                event.preventDefault()
                document.querySelector("#non-field-errors").innerHTML = ""
                document.querySelector("#id-email-errors").innerHTML = ""

                const emailEl = document.getElementById("id-email"),
                    email = emailEl.value
                let errors = false
                if (!emailEl.checkValidity()) {
                    document.querySelector("#id-email-errors").innerHTML =
                        `<li>${gettext("This is not a valid email.")}</li>`
                    errors = true
                } else if (!email.length) {
                    document.querySelector("#id-email-errors").innerHTML =
                        `<li>${gettext("This field is required.")}</li>`
                    errors = true
                }
                if (errors) {
                    return
                }

                post("/api/user/password/reset/", {email})
                    .then(() => {
                        if (document.body !== this.dom) {
                            return
                        }
                        document.querySelector(".fw-contents").innerHTML = `<div class="fw-login-left">
                        <h1 class="fw-login-title">${gettext("Instructions emailed")}</h1>
                        <p>
                            ${interpolate(
                                gettext(
                                    'We have sent an e-mail to <a href="mailto:%(email)s">%(email)s</a> with instructions on how to reset your password.'
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
                    })
                    .catch(response =>
                        response.json().then(json => {
                            json.form.errors.forEach(
                                error =>
                                    (document.querySelector(
                                        "#non-field-errors"
                                    ).innerHTML +=
                                        `<li>${escapeText(error)}</li>`)
                            )
                            json.form.fields.email.errors.forEach(
                                error =>
                                    (document.querySelector(
                                        "#id-email-errors"
                                    ).innerHTML +=
                                        `<li>${escapeText(error)}</li>`)
                            )
                        })
                    )
            })
    }
}
