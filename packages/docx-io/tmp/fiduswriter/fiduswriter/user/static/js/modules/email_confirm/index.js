import * as pluginLoaders from "../../plugins/confirm_account"
import {
    activateWait,
    addAlert,
    deactivateWait,
    post,
    postJson,
    whenReady
} from "../common"
import {PreloginPage} from "../prelogin"
import {
    checkTermsTemplate,
    confirmAccountTemplate,
    testServerQuestionTemplate,
    verifiedAccountTemplate
} from "./templates"

export class EmailConfirm extends PreloginPage {
    constructor({app, language}, key) {
        super({app, language})

        this.title = gettext("Confirm Email")
        this.pluginLoaders = pluginLoaders

        this.key = key

        this.validKey = false
        this.loggedIn = false
        this.verified = false
        this.username = ""
        this.email = ""

        this.submissionReady = false
        this.formChecks = []
        this.confirmQuestionsTemplates = []
        this.confirmMethods = [
            () => post(`/api/user/confirm-email/${this.key}/`)
        ]
    }

    init() {
        return Promise.all([whenReady(), this.getConfirmData()]).then(() => {
            this.activateFidusPlugins()
            this.render()
            this.bind()
        })
    }

    getConfirmData() {
        return postJson("/api/user/get_confirmkey_data/", {key: this.key})
            .then(({json}) => {
                this.username = json.username
                this.email = json.email
                this.validKey = true
                this.verified = json.verified
                this.firstVerification = !json.verified
                if (json.logout) {
                    this.app.config.user = {is_authenticated: false}
                }
            })
            .catch(() => {})
    }

    render() {
        if (!this.verified) {
            if (settings_TEST_SERVER) {
                this.formChecks.push(() =>
                    document.getElementById("test-check").matches(":checked")
                )
                this.confirmQuestionsTemplates.unshift(
                    testServerQuestionTemplate
                )
            }
            this.formChecks.push(() =>
                document.getElementById("terms-check").matches(":checked")
            )
            this.confirmQuestionsTemplates.unshift(checkTermsTemplate)
        }
        this.contents = confirmAccountTemplate({
            validKey: this.validKey,
            username: this.username,
            verified: this.verified,
            email: this.email,
            confirmQuestionsTemplates: this.confirmQuestionsTemplates
        })
        super.render()
    }

    bind() {
        super.bind()
        if (!this.formChecks.length) {
            document.getElementById("submit").removeAttribute("disabled")
            this.submissionReady = true
        }
        document.querySelectorAll(".checker").forEach(el =>
            el.addEventListener("click", () => {
                if (this.formChecks.every(check => check())) {
                    document
                        .getElementById("submit")
                        .removeAttribute("disabled")
                    this.submissionReady = true
                } else {
                    document
                        .getElementById("submit")
                        .setAttribute("disabled", "disabled")
                    this.submissionReady = false
                }
            })
        )
        const submissionButton = document.getElementById("submit")
        if (submissionButton) {
            submissionButton.addEventListener("click", () => {
                if (!this.submissionReady) {
                    return
                }
                activateWait()
                Promise.all(this.confirmMethods.map(method => method())).then(
                    () => {
                        deactivateWait()
                        if (this.app.config.user.is_authenticated) {
                            const emailObject =
                                this.app.config.user.emails.find(
                                    email => email.address === this.email
                                )
                            if (emailObject) {
                                emailObject.verified = true
                            }
                            return this.app
                                .goTo("/user/profile/")
                                .then(() =>
                                    addAlert("info", gettext("Email verified!"))
                                )
                        } else {
                            const contentsDOM =
                                document.querySelector(".fw-contents")
                            contentsDOM.innerHTML = verifiedAccountTemplate()
                        }
                    }
                )
            })
        }
    }
}
