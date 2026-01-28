/* Sets up communicating with server (retrieving document, saving, collaboration, etc.).
 */
export class WebSocketConnector {
    constructor({
        base = "", // needs to be specified
        path = "", // needs to be specified
        appLoaded = () => false, // required argument
        anythingToSend = () => false, // required argument
        messagesElement = () => false, // element in which to show connection messages
        initialMessage = () => ({type: "subscribe"}),
        resubScribed = () => {}, // Cleanup when the client connects a second or subsequent time
        restartMessage = () => ({type: "restart"}), // Too many messages have been lost and we need to restart
        warningNotAllSent = gettext("Warning! Some data is unsaved"), // Info to show while disconnected WITH unsaved data
        infoDisconnected = gettext("Disconnected. Attempting to reconnect..."), // Info to show while disconnected WITHOUT unsaved data
        receiveData = _data => {},
        failedAuth = () => {
            window.location.href = "/"
        }
    }) {
        this.base = base
        this.path = path
        this.appLoaded = appLoaded
        this.anythingToSend = anythingToSend
        this.messagesElement = messagesElement
        this.initialMessage = initialMessage
        this.resubScribed = resubScribed
        this.restartMessage = restartMessage
        this.warningNotAllSent = warningNotAllSent
        this.infoDisconnected = infoDisconnected
        this.receiveData = receiveData
        this.failedAuth = failedAuth
        /* A list of messages to be sent. Only used when temporarily offline.
            Messages will be sent when returning back online. */
        this.messagesToSend = []
        /* A list of messages from a previous connection */
        this.oldMessages = []

        this.online = true
        this.connected = false
        /* Increases when connection has to be reestablished */
        /* 0 = before first connection. */
        /* 1 = first connection established, etc. */
        this.connectionCount = 0
        this.recentlySent = false
        this.listeners = {}

        //heartbeat
        this.pingTimer = false
        this.pongTimer = false
    }

    init() {
        this.createWSConnection()

        // Close the socket manually for now when the connection is lost. Sometimes the socket isn't closed on disconnection.
        this.listeners.onOffline = _event => this.ws.close()
        window.addEventListener("offline", this.listeners.onOffline)
    }

    goOffline() {
        // Simulate offline mode due to lack of ways of doing this in Chrome/Firefox
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1421357
        // https://bugs.chromium.org/p/chromium/issues/detail?id=423246
        this.online = false
        this.ws.close()
    }

    goOnline() {
        // Reconnect from offline mode
        this.online = true
    }

    close() {
        if (this.ws) {
            this.ws.onclose = () => {}
            this.ws.close()
        }
        window.removeEventListener("offline", this.listeners.onOffline)
    }

    createWSConnection() {
        // Messages object used to ensure that data is received in right order.
        this.messages = {
            server: 0,
            client: 0,
            lastTen: []
        }
        let url
        if (this.online) {
            if (this.base.startsWith("/")) {
                url = this.base + this.path
            } else if (location.protocol === "https:") {
                url = `wss://${this.base}${this.path}`
            } else {
                url = `ws://${this.base}${this.path}`
            }
        } else {
            if (location.protocol === "https:") {
                url = "wss://offline"
            } else {
                url = "ws://offline"
            }
        }
        if (this.ws) {
            this.ws.onmessage = () => {}
            this.ws.onclose = () => {}
            this.ws.close()
        }
        this.ws = new window.WebSocket(url)
        this.ws.onmessage = event => this.onmessage(event)
        this.ws.onclose = () => this.onclose()
    }

    waitForWS() {
        return new Promise((resolve, reject) => {
            const checkState = () => {
                if (!this.ws) {
                    // WebSocket doesn't exist
                    return setTimeout(() => checkState(), 100)
                }

                if (this.ws.readyState === this.ws.OPEN) {
                    // WebSocket is open and ready
                    return resolve()
                } else if (this.ws.readyState === this.ws.CONNECTING) {
                    // WebSocket is still connecting, wait
                    return setTimeout(() => checkState(), 100)
                } else {
                    // WebSocket is in CLOSING or CLOSED state
                    // We should not try to send on this socket
                    return reject(new Error("WebSocket is not in OPEN state"))
                }
            }

            checkState()
        })
    }

    onmessage(event) {
        const data = JSON.parse(event.data)
        const expectedServer = this.messages.server + 1
        if (data.type === "request_resend") {
            this.resend_messages(data.from)
        } else if (data.type === "pong") {
            this.heartbeat()
        } else if (data.s < expectedServer) {
            // Receive a message already received at least once. Ignore.
            return
        } else if (data.s > expectedServer) {
            // Messages from the server have been lost.
            // Request resend.
            this.waitForWS()
                .then(() =>
                    this.ws.send(
                        JSON.stringify({
                            type: "request_resend",
                            from: this.messages.server
                        })
                    )
                )
                .catch(() => {
                    // Connection not ready, we will handle this on reconnection
                })
        } else {
            this.messages.server = expectedServer
            if (data.c === this.messages.client) {
                this.receive(data)
            } else if (data.c < this.messages.client) {
                // We have received all server messages, but the server seems
                // to have missed some of the client's messages. They could
                // have been sent simultaneously.
                // The server wins over the client in this case.
                this.waitForWS().then(() => {
                    const clientDifference = this.messages.client - data.c
                    this.messages.client = data.c
                    if (clientDifference > this.messages.lastTen.length) {
                        // We cannot fix the situation
                        this.send(this.restartMessage)
                        return
                    }
                    this.messages["lastTen"]
                        .slice(0 - clientDifference)
                        .forEach(data => {
                            this.messages.client += 1
                            data.c = this.messages.client
                            data.s = this.messages.server

                            this.ws.send(JSON.stringify(data))
                        })
                    this.receive(data)
                })
            }
        }
    }

    onclose() {
        this.connected = false
        window.setTimeout(() => {
            this.createWSConnection()
        }, 2000)
        if (!this.appLoaded()) {
            // doc not initiated
            return
        }

        const messagesElement = this.messagesElement()
        if (messagesElement) {
            if (this.anythingToSend()) {
                messagesElement.innerHTML = `<span class="warn">${this.warningNotAllSent}</span>`
            } else {
                messagesElement.innerHTML = this.infoDisconnected
            }
        }
    }

    open() {
        const messagesElement = this.messagesElement()
        if (messagesElement) {
            messagesElement.innerHTML = ""
        }
        this.connected = true

        const message = this.initialMessage()
        this.connectionCount++
        this.oldMessages = this.messagesToSend
        this.messagesToSend = []

        this.send(() => message)
    }

    subscribed() {
        if (this.connectionCount > 1) {
            this.resubScribed()
            while (this.oldMessages.length > 0) {
                this.send(this.oldMessages.shift())
            }
        }
    }

    /** Sends data to server or keeps it in a list if currently offline. */
    send(getData, timer = 80) {
        if (this.connected && this.ws.readyState !== this.ws.OPEN) {
            this.ws.close()
            return
        }
        if (this.connected && !this.recentlySent) {
            const data = getData()
            if (!data) {
                // message is empty
                return
            }
            this.messages.client += 1
            data.c = this.messages.client
            data.s = this.messages.server
            this.messages.lastTen.push(data)
            this.messages.lastTen = this.messages["lastTen"].slice(-10)

            this.waitForWS()
                .then(() => {
                    this.ws.send(JSON.stringify(data))
                    this.setRecentlySentTimer(timer)
                })
                .catch(() => {
                    // Failed to send - likely WebSocket is not open
                    // Put the message back into the queue
                    this.messages.client -= 1
                    this.messagesToSend.unshift(getData)
                    // Remove from lastTen to avoid duplicates
                    this.messages.lastTen = this.messages.lastTen.slice(0, -1)
                })
        } else {
            this.messagesToSend.push(getData)
        }
    }

    setRecentlySentTimer(timer) {
        this.recentlySent = true
        window.setTimeout(() => {
            this.recentlySent = false
            const oldMessages = this.messagesToSend
            this.messagesToSend = []
            while (oldMessages.length > 0) {
                const getData = oldMessages.shift()
                this.send(getData, Math.min(timer * 1.2, 10000))
            }
        }, timer)
    }

    resend_messages(from) {
        return this.waitForWS()
            .then(() => {
                const toSend = this.messages.client - from
                this.messages.client = from
                if (toSend > this.messages.lastTen.length) {
                    // Too many messages requested. Abort.
                    this.send(this.restartMessage)
                    return
                }
                this.messages.lastTen.slice(0 - toSend).forEach(data => {
                    this.messages.client += 1
                    data.c = this.messages.client
                    data.s = this.messages.server
                    this.ws.send(JSON.stringify(data))
                })
            })
            .catch(() => {
                // Could not send messages - WebSocket not ready
                // Will try again when WebSocket is ready
            })
    }

    receive(data) {
        switch (data.type) {
            case "redirect":
                this.base = data.base
                break
            case "welcome":
                this.open()
                break
            case "subscribed":
                this.subscribed()
                this.heartbeat()
                break
            case "access_denied":
                this.failedAuth()
                break
            default:
                this.receiveData(data)
                break
        }
    }

    heartbeat() {
        clearTimeout(this.pingTimer)
        clearTimeout(this.pongTimer)
        this.pingTimer = setTimeout(() => {
            // Don't send ping if WebSocket is not open
            if (this.ws.readyState === this.ws.OPEN) {
                this.ws.send('{"type": "ping"}')
                this.pongTimer = setTimeout(() => {
                    this.listeners.onOffline()
                }, 10000)
            }
        }, 60000)
    }
}
