import {PreloginPage} from "../prelogin"

export class Page404 extends PreloginPage {
    constructor({app, language}) {
        super({app, language})
        this.title = gettext("Page not found")
        this.contents = `<div class="fw-login-left">
            <h1 class="fw-login-title">${gettext("Error 404")}</h1>
            <p>${gettext("The page you are looking for cannot be found.")}</p>
        </div>`
    }
}
