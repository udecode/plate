import * as plugins from "../../plugins/prelogin"
import {ensureCSS, setDocTitle, setLanguage, whenReady} from "../common"
import {FeedbackTab} from "../feedback"

import {basePreloginTemplate} from "./templates"

export class PreloginPage {
    constructor({app, language}) {
        this.app = app
        this.language = language
        this.pluginLoaders = {}
        this.title = ""
        this.contents = ""
        this.footerLinks = settings_FOOTER_LINKS.length
            ? settings_FOOTER_LINKS
            : [
                  {
                      text: gettext("Terms and Conditions"),
                      link: "/pages/terms/"
                  },
                  {
                      text: gettext("Privacy policy"),
                      link: "/pages/privacy/"
                  },
                  {
                      text: gettext("Equations and Math with MathLive"),
                      link: "https://github.com/arnog/mathlive#readme",
                      external: true
                  },
                  {
                      text: gettext("Citations with Citation Style Language"),
                      link: "https://citationstyles.org/",
                      external: true
                  },
                  {
                      text: gettext("Editing with ProseMirror"),
                      link: "https://prosemirror.net/",
                      external: true
                  }
              ]
        this.headerLinks = [
            {
                type: "button",
                text: gettext("Log in"),
                link:
                    this.app.routes[""].app === "document" ? "/" : "/documents/"
            }
        ]
    }

    activateFidusPlugins() {
        // Add plugins.
        this.plugins = {}

        // Plugins for the specific page
        Object.keys(this.pluginLoaders).forEach(plugin => {
            if (typeof this.pluginLoaders[plugin] === "function") {
                this.plugins[plugin] = new this.pluginLoaders[plugin]({
                    page: this
                })
                this.plugins[plugin].init()
            }
        })

        // General plugins for all prelogin pages
        Object.keys(plugins).forEach(plugin => {
            if (typeof plugins[plugin] === "function") {
                this.plugins[plugin] = new plugins[plugin]({page: this})
                this.plugins[plugin].init()
            }
        })
    }

    init() {
        return whenReady().then(() => {
            this.activateFidusPlugins()
            this.render()
            this.bind()
        })
    }

    bind() {
        this.dom
            .querySelector(".fw-login-logo")
            .addEventListener("click", () => this.app.goTo("/"))
        this.dom
            .querySelector("#lang-selection")
            .addEventListener("change", event => {
                this.language = event.target.value
                return setLanguage(this.app.config, this.language)
            })
    }

    render() {
        this.dom = document.createElement("body")
        this.dom.classList.add("prelogin")
        this.dom.classList.add("scrollable")
        this.dom.innerHTML = basePreloginTemplate({
            language: this.language,
            headerLinks: this.headerLinks,
            footerLinks: this.footerLinks,
            contents: this.contents
        })
        document.body = this.dom
        ensureCSS([staticUrl("css/prelogin.css")])
        setDocTitle(this.title, this.app)
        const feedbackTab = new FeedbackTab()
        feedbackTab.init()
    }
}
