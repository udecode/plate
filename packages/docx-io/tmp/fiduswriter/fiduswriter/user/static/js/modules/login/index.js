import * as pluginLoaders from "../../plugins/login"
import {escapeText, postJson} from "../common"
import {PreloginPage} from "../prelogin"

export class LoginPage extends PreloginPage {
    constructor({app, language, socialaccount_providers}) {
        super({app, language})
        this.socialaccount_providers = socialaccount_providers
        this.title = gettext("Login")
        this.pluginLoaders = pluginLoaders
        this.headerLinks =
            settings_REGISTRATION_OPEN && settings_PASSWORD_LOGIN
                ? [
                      {
                          type: "label",
                          text: gettext("New here?")
                      },
                      {
                          type: "button",
                          text: gettext("Sign up"),
                          link: "/account/sign-up/"
                      }
                  ]
                : []
    }

    render() {
        this.contents = `<div class="fw-login-left">
            <h1 class="fw-login-title">${gettext("Log in")}</h1>
            ${
                settings_SOCIALACCOUNT_OPEN
                    ? this.socialaccount_providers.length
                        ? `<div class="socialaccount_ballot">
                    <ul class="socialaccount_providers">
                        ${this.socialaccount_providers
                            .map(
                                provider => `<li>
                                <a title="${provider.name}" class="fw-button fw-socialaccount fw-${provider.id}"
                                    href="${provider.login_url}">
                                        <span class="fab fa-${provider.id}"></span>
                                            ${gettext("Login with")} ${provider.name}
                                </a>
                            </li>`
                            )
                            .join("")}
                    </ul>
                </div>`
                        : ""
                    : ""
            }
        </div>
            ${
                settings_PASSWORD_LOGIN
                    ? `<div class="fw-login-right">
            <form>
                    <ul id="non-field-errors" class="errorlist"></ul>
                    <div class="input-wrapper">
                        <label for="id-login">${gettext("Username")}</label>
                        <input type="text" name="login" placeholder="${gettext("Username or e-mail")}" autofocus="autofocus" required="" id="id-login" autocomplete="username">
                        <ul id="id-login-errors" class="errorlist"></ul>
                    </div>
                    <div class="input-wrapper">
                        <label for="id-password">${gettext("Password")}</label>
                        <input type="password" name="password" placeholder="${gettext("Password")}" required="" id="id-password" autocomplete="current-password">
                        <ul id="id-password-errors" class="errorlist"></ul>
                    </div>
                    <div class="submit-wrapper">
                        <button class="fw-button fw-dark fw-uppercase" type="submit" id="login-submit">${gettext("Log in")}</button>
                        <br>
                        <input type="checkbox" name="remember" id="id-remember">
                        <label for="id-remember">${gettext("Remember me")}</label>
                    </div>
                    <a id="lost-passwd" href="/account/password-reset/">${gettext("Forgot Password?")}</a>
                </form>
            </div>`
                    : ""
            }`
        super.render()
    }

    bind() {
        super.bind()
        const socialButtons = document.body.querySelectorAll(
            ".fw-button.fw-socialaccount"
        )
        let btnWidth = 1

        socialButtons.forEach(button => {
            const theWidth = button.clientWidth
            if (btnWidth < theWidth) {
                btnWidth = theWidth
            }
        })
        btnWidth += 15
        socialButtons.forEach(button => (button.style.width = `${btnWidth}px`))

        const loginSubmit = document.querySelector("#login-submit")
        if (!loginSubmit) {
            return
        }

        loginSubmit.addEventListener("click", event => {
            event.preventDefault()

            const nonFieldErrors = document.querySelector("#non-field-errors"),
                idLogin = document.querySelector("#id-login"),
                idLoginErrors = document.querySelector("#id-login-errors"),
                idPassword = document.querySelector("#id-password"),
                idPasswordErrors = document.querySelector(
                    "#id-password-errors"
                ),
                idRemember = document.querySelector("#id-remember"),
                fwContents = document.querySelector(".fw-contents")

            if (
                !idLogin ||
                !idLoginErrors ||
                !idPassword ||
                !idPasswordErrors ||
                !idRemember ||
                !fwContents
            ) {
                return
            }

            nonFieldErrors.innerHTML = ""
            idLoginErrors.innerHTML = ""
            idPasswordErrors.innerHTML = ""

            const login = idLogin.value,
                password = idPassword.value,
                remember = idRemember.checked
            let errors = false
            if (!login.length) {
                idLoginErrors.innerHTML = `<li>${gettext("This field is required.")}</li>`
                errors = true
            }
            if (!password.length) {
                idPasswordErrors.innerHTML = `<li>${gettext("This field is required.")}</li>`
                errors = true
            }
            if (errors) {
                return
            }
            return postJson("/api/user/login/", {login, password, remember})
                .then(({json}) => {
                    if (json.location === "/api/account/confirm-email/") {
                        // Email has not yet been confirmed.
                        fwContents.innerHTML = `<div class="fw-login-left">
                                <h1 class="fw-login-title">${gettext("Verify Your E-mail Address")}</h1>
                                <p>
                                    ${gettext(
                                        "We have sent an e-mail to your email address for verification. Follow the link provided to finalize the signup process."
                                    )}
                                    <br />
                                    ${gettext(
                                        "Please contact us if you do not receive it within a few minutes."
                                    )}
                                </p>
                            </div>`
                    } else {
                        // Check if user's language preference differs from current language
                        const currentLang = document.documentElement.lang
                        if (json.html && json.html.length > 0) {
                            const htmlValues = JSON.parse(json.html)
                            if (
                                htmlValues.user &&
                                htmlValues.user.language &&
                                htmlValues.user.language !== currentLang
                            ) {
                                // Language preference differs, reload the page to apply it
                                window.location.reload()
                            } else {
                                // No language change needed, proceed with normal init
                                this.app.init()
                            }
                        } else {
                            this.app.init()
                        }
                    }
                })
                .catch(response =>
                    response.json().then(json => {
                        json.form.errors.forEach(
                            error =>
                                (nonFieldErrors.innerHTML += `<li>${escapeText(error)}</li>`)
                        )
                        json.form.fields.login.errors.forEach(
                            error =>
                                (idLoginErrors.innerHTML += `<li>${escapeText(error)}</li>`)
                        )
                        json.form.fields.password.errors.forEach(
                            error =>
                                (idPasswordErrors.innerHTML += `<li>${escapeText(error)}</li>`)
                        )
                    })
                )
        })
    }
}
