import {ensureCSS, postJson, whenReady} from "../common"
import {PreloginPage} from "../prelogin"

export class FlatPage extends PreloginPage {
    constructor({app, language}, url) {
        super({app, language})
        this.url = url
    }

    init() {
        return Promise.all([
            whenReady(),
            this.getPageData(),
            ensureCSS([staticUrl("css/flatpage.css")])
        ]).then(() => {
            this.activateFidusPlugins()
            this.render()
            this.bind()
        })
    }

    getPageData() {
        return postJson("/api/base/flatpage/", {url: this.url})
            .then(({json}) => {
                this.title = json.title
                this.contents = `<div class="fw-flatpage">
                    <h1 class="fw-login-title">${json.title}</h1>
                    ${json.content}
                </div>`
            })
            .catch(() => {
                this.title = gettext("Page not found")
                this.contents = `<div>
                    <h1 class="fw-login-title">${gettext("Error 404")}</h1>
                    <p>${gettext("The page you are looking for cannot be found.")}</p>
                </div>`
            })
    }
}
