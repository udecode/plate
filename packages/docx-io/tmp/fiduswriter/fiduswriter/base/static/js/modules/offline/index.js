import {PreloginPage} from "../prelogin"

export class OfflinePage extends PreloginPage {
    constructor({app, language}) {
        super({app, language})
        this.title = gettext("Disconnected")
        this.contents = `<div class="fw-login-left">
            <h1 class="fw-login-title">${gettext("Disconnected")}</h1>
            <p>${interpolate(
                gettext(
                    "You are currently disconnected from the %(appName)s server."
                ),
                {appName: this.app.name},
                true
            )}</p>
        </div>`

        this.footerLinks = this.footerLinks.filter(link => link.external) // We only show external links as internal links will not work

        this.headerLinks = [
            {
                type: "button",
                text: gettext("Reload page"),
                link: window.location.pathname
            }
        ]
    }

    init() {
        return super
            .init()
            .then(() =>
                document
                    .querySelectorAll("#lang-selection,.feedback-tab")
                    .forEach(el => (el.style.visibility = "hidden"))
            )
    }
}
