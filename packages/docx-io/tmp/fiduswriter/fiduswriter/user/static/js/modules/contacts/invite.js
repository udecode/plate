import {postJson} from "../common"

export class ContactInvite {
    constructor({app}, key) {
        this.app = app
        this.key = key
    }

    init() {
        if (!this.app.config.user.is_authenticated) {
            // The user is not logged in and will possibly click around on the
            // outer pages for a while before signing up.
            // We store the invite id in the app so that it can be found there
            // and used if the user ends up signing up later during this
            // browsing session.
            this.app.inviteKey = this.key
            this.app.page = this.app.openLoginPage()
            return this.app.page.init()
        }

        return postJson("/api/user/invite/", {key: this.key}).then(({json}) => {
            window.history.replaceState({}, "", json.redirect)
            return this.app.selectPage()
        })
    }
}
