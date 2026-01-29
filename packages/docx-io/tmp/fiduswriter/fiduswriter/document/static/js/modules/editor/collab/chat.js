import {localizeDate, whenReady} from "../../common"
import {messageTemplate} from "./templates"

/*
 * Functions for chat between users who access a document simultaneously.
 */

export class ModCollabChat {
    constructor(mod) {
        mod.chat = this
        this.mod = mod
        this.currentlyFlashing = false
        this.focus = true
        this.init()
    }

    beep() {
        const notification = document.getElementById("chat-notification")
        notification.play().catch(
            () => {} // Don't worry about it if the browser prohibits playing the sound
        )
    }

    flashtab(messageTitle) {
        if (this.currentlyFlashing) {
            return false
        }
        const origTitle = document.title

        this.currentlyFlashing = true

        const changeDocumentTitle = window.setInterval(() => {
            if (this.focus) {
                window.clearInterval(changeDocumentTitle)
                document.title = origTitle
                this.currentlyFlashing = false
            } else {
                document.title =
                    document.title === origTitle ? messageTitle : origTitle
            }
        }, 500)
    }

    newMessage(message) {
        if (document.getElementById(`m${message.id}`)) {
            return
        }
        const theChatter = this.mod.participants.find(
            participant => participant.id === message.from
        )

        const chatContainer = document.getElementById("chat-container")
        chatContainer.insertAdjacentHTML(
            "beforeend",
            messageTemplate({message, theChatter, localizeDate})
        )
        if (!this.focus) {
            this.beep()
            this.flashtab(message.from + ": " + message.body)
        }
        if (chatContainer.style.display === "none") {
            document.getElementById("chat").classList.add("highlighted")
        }
    }

    showChat(participants) {
        // If only one machine is connected and nothing has been chatted, don't show chat
        if (
            participants.length === 1 &&
            !document.querySelector("#chat-container .message")
        ) {
            document.getElementById("chat").style.display = "none"
        } else {
            document.getElementById("chat").style.display = "block"
        }
    }

    sendMessage(messageText) {
        this.mod.editor.ws.send(() => ({
            type: "chat",
            body: messageText
        }))
    }

    init() {
        document.body.insertAdjacentHTML(
            "beforeend",
            `<style>\n#messageform.empty:before{content:"${gettext("Send a message...")}"}\n</style>`
        )
        whenReady().then(() => {
            document.getElementById("chat-container").style.maxHeight =
                `${window.innerHeight - 200}px`

            const resizeButton = document.querySelector("#chat .resize-button")
            resizeButton.addEventListener("click", () => {
                const chatEl = document.getElementById("chat")
                if (resizeButton.classList.contains("fa-angle-double-down")) {
                    resizeButton.classList.remove("fa-angle-double-down")
                    resizeButton.classList.add("fa-angle-double-up")
                    chatEl.style.top = `${chatEl.getBoundingClientRect().top}px` // Set current height to get the animation working.
                    setTimeout(
                        () =>
                            (chatEl.style.top = `${window.innerHeight - 29}px`),
                        0
                    )
                } else {
                    resizeButton.classList.remove("fa-angle-double-up")
                    resizeButton.classList.add("fa-angle-double-down")
                    // Add height teemporarily to make sliding animation.
                    chatEl.style.top = `${Math.max(window.innerHeight - chatEl.scrollHeight - 11, 0)}px` // 11px for padding
                    setTimeout(() => (chatEl.style.top = ""), 3000)
                }
            })

            const messageForm = document.getElementById("messageform")

            messageForm.addEventListener("focus", () =>
                messageForm.classList.remove("empty")
            )

            messageForm.addEventListener("blur", () => {
                if (messageForm.innerText.trim().length === 0) {
                    messageForm.classList.add("empty")
                }
            })

            messageForm.addEventListener("keypress", event => {
                if (event.keyCode === 13) {
                    this.sendMessage(messageForm.innerText)
                    messageForm.innerText = ""
                    return false
                }
            })
        })

        window.addEventListener("blur", () => (this.focus = false))
        window.addEventListener("focus", () => (this.focus = true))
    }
}
