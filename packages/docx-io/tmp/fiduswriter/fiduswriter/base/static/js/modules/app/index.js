import {CSL} from "citeproc-plus"
//import * as OfflinePluginRuntime from "@lcdp/offline-plugin/runtime"

import * as plugins from "../../plugins/app"
import {Page404} from "../404"
import {BibliographyDB} from "../bibliography/database"
import {
    WebSocketConnector,
    addAlert,
    ensureCSS,
    findTarget,
    postJson,
    showSystemMessage
} from "../common"
import {ContactsOverview} from "../contacts"
import {ContactInvite} from "../contacts/invite"
import {EmailConfirm} from "../email_confirm"
import {FlatPage} from "../flatpage"
import {ImageDB} from "../images/database"
import {ImageOverview} from "../images/overview"
import {IndexedDB} from "../indexed_db"
import {LoginPage} from "../login"
import {OfflinePage} from "../offline"
import {
    PasswordResetChangePassword,
    PasswordResetRequest
} from "../password_reset"
import {Profile} from "../profile"
import {SetupPage} from "../setup"
import {Signup} from "../signup"

export class App {
    constructor() {
        this.config = {}
        this.name = "Fidus Writer"
        this.config.app = this
        this.routes = {
            "": {
                app: "document",
                requireLogin: true,
                open: () =>
                    import(
                        /* webpackPrefetch: true */ "../documents/overview"
                    ).then(
                        ({DocumentOverview}) =>
                            new DocumentOverview(this.config)
                    )
            },
            account: {
                app: "user",
                requireLogin: false,
                open: pathnameParts => {
                    let returnValue
                    switch (pathnameParts[2]) {
                        case "confirm-email": {
                            const key = pathnameParts[3]
                            returnValue = new EmailConfirm(this.config, key)
                            break
                        }
                        case "password-reset":
                            returnValue = new PasswordResetRequest(this.config)
                            break
                        case "change-password": {
                            const key = pathnameParts[3]
                            returnValue = new PasswordResetChangePassword(
                                this.config,
                                key
                            )
                            break
                        }
                        case "sign-up":
                            returnValue = new Signup(this.config)
                            break
                        default:
                            returnValue = false
                    }
                    return returnValue
                }
            },
            bibliography: {
                app: "bibliography",
                requireLogin: true,
                open: () =>
                    import("../bibliography/overview").then(
                        ({BibliographyOverview}) =>
                            new BibliographyOverview(this.config)
                    )
            },
            document: {
                app: "document",
                requireLogin: true,
                open: pathnameParts => {
                    let id = pathnameParts.pop()
                    if (!id.length) {
                        id = pathnameParts.pop()
                    }
                    const path = (
                        "/" + pathnameParts.slice(2).join("/")
                    ).replace(/\/?$/, "/")
                    return import(
                        /* webpackPrefetch: true */ /* webpackChunkName: "editor" */ "../editor"
                    ).then(({Editor}) => new Editor(this.config, path, id))
                },
                dbTables: {
                    data: {
                        keyPath: "id"
                    }
                }
            },
            documents: {
                app: "document",
                requireLogin: true,
                open: pathnameParts => {
                    const path = (
                        "/" + pathnameParts.slice(2).join("/")
                    ).replace(/\/?$/, "/")
                    return import(
                        /* webpackPrefetch: true */ "../documents/overview"
                    ).then(
                        ({DocumentOverview}) =>
                            new DocumentOverview(this.config, path)
                    )
                }
            },
            pages: {
                app: "base",
                open: pathnameParts => {
                    const url = `/${pathnameParts[2]}/`
                    return new FlatPage(this.config, url)
                }
            },
            user: {
                app: "user",
                requireLogin: true,
                open: pathnameParts => {
                    let returnValue
                    switch (pathnameParts[2]) {
                        case "profile":
                            returnValue = new Profile(this.config)
                            break
                        case "contacts":
                            returnValue = new ContactsOverview(this.config)
                            break
                        default:
                            returnValue = false
                    }
                    return returnValue
                },
                dbTables: {
                    data: {
                        keyPath: "id"
                    }
                }
            },
            invite: {
                app: "user",
                open: pathnameParts => {
                    const id = pathnameParts[2]
                    return new ContactInvite(this.config, id)
                }
            },
            usermedia: {
                app: "usermedia",
                requireLogin: true,
                open: () => new ImageOverview(this.config)
            }
        }
        this.openLoginPage = () => new LoginPage(this.config)
        this.openOfflinePage = () => new OfflinePage(this.config)
        this.openSetupPage = () => new SetupPage(this.config)
        this.open404Page = () => new Page404(this.config)
        this.handleSWUpdate = () => window.location.reload()
    }

    isOffline() {
        return (
            !navigator.onLine ||
            (this.ws?.connectionCount > 0 && !this.ws?.connected)
        )
    }

    alertCached() {
        addAlert(
            "info",
            gettext("You are viewing a cached version of this page.")
        )
    }

    installServiceWorker() {
        /* This function is used for testing SW with Django tests */
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then(registration => {
                    console.log("SW registered: ", registration)
                })
                .catch(registrationError => {
                    console.log("SW registration failed: ", registrationError)
                })
        }
    }

    init() {
        if (
            !settings_DEBUG &&
            settings_USE_SERVICE_WORKER &&
            "serviceWorker" in navigator
        ) {
            navigator.serviceWorker
                .register("/sw.js")
                .then(registration => {
                    console.log("SW registered: ", registration)
                })
                .catch(registrationError => {
                    console.log("SW registration failed: ", registrationError)
                })
        }
        ensureCSS([staticUrl("css/fontawesome/css/all.css")])
        // Disable automatic scroll restoration to prevent Safari from
        // auto-scrolling to focused elements (like the document table)
        // which causes the header/menu to be hidden on page load
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual"
        }
        // Ensure we start at the top of the page
        window.scrollTo(0, 0)
        if (this.isOffline()) {
            this.page = this.openOfflinePage()
            return this.page.init()
        } else {
            return this.getConfiguration()
                .catch(error => {
                    if (error instanceof TypeError) {
                        // We could not fetch user info from server, so let's
                        // assume we are disconnected.
                        this.page = this.openOfflinePage()
                        this.page.init()
                    } else if (error.status === 405) {
                        // 405 indicates that the server is running but the
                        // method is not allowed. This must be the setup server.
                        // We show a setup message instead.
                        this.page = this.openSetupPage()
                        this.page.init()
                    } else if (settings_DEBUG) {
                        throw error
                    } else {
                        // We don't know what is going on, but we are in production
                        // mode. Hopefully the app will update soon.
                        this.page = this.openOfflinePage()
                        this.page.init()
                    }
                    return Promise.reject(false)
                })
                .then(() => this.setup())
                .catch(error => {
                    if (error === false) {
                        return
                    }
                    throw error
                })
        }
    }

    setup() {
        if (!this.config.user.is_authenticated) {
            this.activateFidusPlugins()
            return this.selectPage().then(() => this.bind())
        }
        this.bibDB = new BibliographyDB(this)
        this.imageDB = new ImageDB()
        this.csl = new CSL()
        this.connectWs()
        return Promise.all([this.bibDB.getDB(), this.imageDB.getDB()])
            .then(() => {
                this.activateFidusPlugins()
                // Initialize the indexedDB after the plugins have loaded.
                this.indexedDB = new IndexedDB(this)
                return this.indexedDB.init()
            })
            .then(() => this.selectPage())
            .then(() => this.bind())
            .then(() => this.showNews())
    }

    bind() {
        window.onpopstate = () => this.selectPage()
        document.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, "a", el):
                    if (
                        el.target.hostname === window.location.hostname &&
                        el.target.getAttribute("href")[0] === "/" &&
                        el.target.getAttribute("href").slice(0, 7) !==
                            "/media/" &&
                        el.target.getAttribute("href").slice(0, 5) !== "/api/"
                    ) {
                        event.preventDefault()
                        event.stopImmediatePropagation()
                        this.goTo(decodeURI(el.target.href))
                    }
                    break
            }
        })
        let resizeDone
        window.addEventListener("resize", () => {
            clearTimeout(resizeDone)
            resizeDone = setTimeout(() => {
                if (this.page && this.page.onResize) {
                    this.page.onResize()
                }
            }, 250)
        })
        window.addEventListener("beforeunload", event => {
            if (this.page && this.page.onBeforeUnload) {
                if (this.page.onBeforeUnload()) {
                    event.preventDefault()
                    // To stop the event for chrome and safari
                    event.returnValue = ""
                    return ""
                }
            }
        })
    }

    showNews() {
        if (
            window.location.pathname !== "/user/contacts/" &&
            this.config.user.waiting_invites
        ) {
            showSystemMessage(
                gettext(
                    "Other users have requested to connect with you. Go to the contacts page to accept their invites."
                ),
                [
                    {
                        text: gettext("Go to contacts"),
                        classes: "fw-dark",
                        click: _event => {
                            return this.goTo("/user/contacts/")
                        }
                    },
                    {type: "close"}
                ]
            )
        }
    }

    connectWs() {
        this.ws = new WebSocketConnector({
            base: this.config.ws_url_base,
            path: "/base/",
            appLoaded: () => true,
            receiveData: data => {
                switch (data.type) {
                    case "system_message":
                        showSystemMessage(data.message)
                        break
                    default:
                        break
                }
            }
        })
        this.ws.init()
    }

    activateFidusPlugins() {
        if (this.plugins) {
            // Plugins have been activated already
            return
        }
        // Add plugins.
        this.plugins = {}

        Object.keys(plugins).forEach(plugin => {
            if (typeof plugins[plugin] === "function") {
                this.plugins[plugin] = new plugins[plugin](this)
                this.plugins[plugin].init()
            }
        })
    }

    selectPage() {
        if (this.page && this.page.close) {
            this.page.close()
        }
        // Disable automatic scroll restoration to prevent Safari from
        // auto-scrolling to focused elements (like the document table)
        // which causes the header/menu to be hidden on page load
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual"
        }
        // Ensure we start at the top of the page
        window.scrollTo(0, 0)
        const pathnameParts = decodeURI(window.location.pathname).split("/")
        const route = this.routes[pathnameParts[1]]
        if (route) {
            if (
                route.requireLogin &&
                !(this.config.user || {}).is_authenticated
            ) {
                this.page = this.openLoginPage()
                return this.page.init()
            }
            const page = route.open(pathnameParts)
            if (page.then) {
                return page.then(thisPage => {
                    this.page = thisPage
                    return this.page.init().then(() => {
                        if (this.isOffline()) {
                            this.alertCached()
                        }
                    })
                })
            } else if (page) {
                this.page = page
                return this.page.init().then(() => {
                    if (this.isOffline()) {
                        this.alertCached()
                    }
                })
            }
        }
        this.page = this.open404Page()
        return this.page.init()
    }

    getConfiguration() {
        return postJson("/api/base/configuration/")
            .then(({json}) =>
                Object.entries(json).forEach(
                    ([key, value]) => (this.config[key] = value)
                )
            )
            .catch(error => {
                if (error instanceof Response && error.status === 403) {
                    // We could not fetch user info from server, so let's
                    // assume we are disconnected and delete all cookies.
                    // This will force the user to log in again.
                    //
                    // This is a bit of a hack, but it is the only way to make sure
                    // that the user is logged out when the server is not reachable.
                    document.cookie.split(";").forEach(cookie => {
                        const eqPos = cookie.indexOf("=")
                        const name =
                            eqPos > -1 ? cookie.substring(0, eqPos) : cookie
                        document.cookie =
                            name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"
                    })
                    return Promise.reject(error)
                }
                throw error
            })
    }

    goTo(url) {
        window.history.pushState({}, "", encodeURI(url))
        return this.selectPage()
    }
}
