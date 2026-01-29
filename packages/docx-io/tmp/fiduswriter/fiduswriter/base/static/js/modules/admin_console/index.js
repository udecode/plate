import {addAlert, findTarget, getJson, postJson, whenReady} from "../common"

// To see how many users are currently online and send them maintenance messages

export class AdminConsole {
    constructor() {}

    init() {
        whenReady().then(() => {
            this.render()
            this.bind()
        })
    }

    bind() {
        document.body.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(
                    event,
                    "input#submit_user_message:not(.disabled)",
                    el
                ): {
                    const message = document.querySelector(
                        "textarea#user_message"
                    ).value
                    if (!message.length) {
                        return
                    }
                    document.querySelector("textarea#user_message").disabled =
                        true
                    document.querySelector(
                        "input#submit_user_message"
                    ).disabled = true
                    document.querySelector("input#submit_user_message").value =
                        gettext("Sending...")
                    this.sendSystemMessage(message)
                    break
                }
                default:
                    break
            }
        })
    }

    sendSystemMessage(message) {
        return postJson("/api/base/send_system_message/", {message}).then(
            () => {
                addAlert("info", gettext("Message delivered successfully!"))
                const button = document.querySelector(
                    "input#submit_user_message"
                )
                button.value = gettext("Message delivered")
            }
        )
    }

    render() {
        return getJson("/api/base/connection_info/").then(
            ({sessions, users}) => {
                const sessionCounterEl =
                    document.getElementById("session_count")
                if (sessionCounterEl) {
                    sessionCounterEl.innerHTML = String(sessions)
                }
                const userCounterEl = document.getElementById("user_count")
                if (userCounterEl) {
                    userCounterEl.innerHTML = String(users)
                }
            }
        )
    }
}
