import {
    activateWait,
    addAlert,
    baseBodyTemplate,
    deactivateWait,
    dropdownSelect,
    ensureCSS,
    findTarget,
    post,
    setDocTitle,
    whenReady
} from "../common"
import {FeedbackTab} from "../feedback"
import {SiteMenu} from "../menu"
import {DeleteUserDialog} from "./delete_user"
import {
    addEmailDialog,
    changeAvatarDialog,
    changePrimaryEmailDialog,
    changePwdDialog,
    deleteAvatarDialog,
    deleteEmailDialog,
    deleteSocialaccountDialog
} from "./dialogs"
import {profileContents} from "./templates"

export class Profile {
    constructor({app, user, socialaccount_providers}) {
        this.app = app
        this.user = user
        this.socialaccount_providers = socialaccount_providers
    }

    init() {
        return whenReady().then(() => {
            this.render()
            const smenu = new SiteMenu(this.app, "") // Nothing highlighted
            smenu.init()
            dropdownSelect(this.dom.querySelector("#edit-avatar-pulldown"), {
                onChange: value => {
                    switch (value) {
                        case "change":
                            changeAvatarDialog(this.app)
                            break
                        case "delete":
                            deleteAvatarDialog(this.app)
                            break
                    }
                },
                button: this.dom.querySelector("#edit-avatar-btn")
            })
            this.dom.addEventListener("click", event => {
                const el = {}
                let dialog
                switch (true) {
                    case findTarget(event, "#add-profile-email", el):
                        addEmailDialog(this.app)
                        break
                    case findTarget(event, "#fw-edit-profile-pwd", el):
                        changePwdDialog({username: this.user.username})
                        break
                    case findTarget(event, "#delete-account", el):
                        dialog = new DeleteUserDialog(
                            this.dom.querySelector("#delete-account").dataset
                                .username
                        )
                        dialog.init()
                        break
                    case findTarget(event, "#submit-profile", el):
                        this.save()
                        break
                    case findTarget(event, ".delete-email", el):
                        deleteEmailDialog(el.target, this.app)
                        break
                    case findTarget(event, ".delete-socialaccount", el):
                        deleteSocialaccountDialog(el.target, this.app)
                        break
                    default:
                        break
                }
            })
            this.dom
                .querySelectorAll(".primary-email-radio")
                .forEach(el =>
                    el.addEventListener("change", () =>
                        changePrimaryEmailDialog(this.app)
                    )
                )
        })
    }

    render() {
        this.dom = document.createElement("body")
        this.dom.classList.add("scrollable")
        this.dom.innerHTML = baseBodyTemplate({
            contents: profileContents(this.user, this.socialaccount_providers),
            user: this.user,
            app: this.app
        })
        document.body = this.dom

        ensureCSS([staticUrl("css/show_profile.css")])

        setDocTitle(gettext("Configure profile"), this.app)
        const feedbackTab = new FeedbackTab()
        feedbackTab.init()
    }

    save() {
        activateWait()
        const newLang = this.dom.querySelector("#language").value
        return post("/api/user/save/", {
            form_data: JSON.stringify({
                user: {
                    username: this.dom.querySelector("#username").value,
                    first_name: this.dom.querySelector("#first_name").value,
                    last_name: this.dom.querySelector("#last_name").value,
                    language: newLang
                }
            })
        })
            .catch(() =>
                addAlert("error", gettext("Could not save profile data"))
            )
            .then(() => {
                deactivateWait()
                return this.app.getConfiguration()
            })
            .then(() => {
                const currentLang = document.documentElement.lang

                if (currentLang !== newLang) {
                    // Refresh the page to use the new language
                    window.location.reload()
                }
            })
    }
}
