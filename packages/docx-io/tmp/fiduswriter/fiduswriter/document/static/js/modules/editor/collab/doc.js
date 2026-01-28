import {receiveTransaction, sendableSteps} from "prosemirror-collab"
import {EditorState} from "prosemirror-state"
import {Step} from "prosemirror-transform"
import {activateWait, deactivateWait, makeWorker} from "../../common"
import {SchemaExport} from "../../schema/export"
import {
    getSelectionUpdate,
    removeCollaboratorSelection,
    updateCollaboratorSelection
} from "../state_plugins"
import {Merge} from "./merge"

export class ModCollabDoc {
    constructor(mod) {
        mod.doc = this
        this.mod = mod
        this.merge = new Merge(mod)
        this.unconfirmedDiffs = {}
        this.confirmStepsRequestCounter = 0
        this.awaitingDiffResponse = false
        this.receiving = false
        this.currentlyCheckingVersion = false
        this.footnoteRender = false // If the offline user edited a footnote , it needs to be rendered properly to connected users too!
    }

    cancelCurrentlyCheckingVersion() {
        this.currentlyCheckingVersion = false
        window.clearTimeout(this.enableCheckVersion)
    }

    checkVersion() {
        this.mod.editor.ws.send(() => {
            if (
                this.currentlyCheckingVersion | !this.mod.editor.docInfo.version
            ) {
                return
            }
            this.currentlyCheckingVersion = true
            this.enableCheckVersion = window.setTimeout(() => {
                this.currentlyCheckingVersion = false
            }, 1000)
            if (this.mod.editor.ws.connected) {
                this.disableDiffSending()
            }
            return {
                type: "check_version",
                v: this.mod.editor.docInfo.version
            }
        })
    }

    disableDiffSending() {
        this.awaitingDiffResponse = true
        // If no answer has been received from the server within 2 seconds,
        // check the version
        this.sendNextDiffTimer = window.setTimeout(() => {
            this.awaitingDiffResponse = false
            this.sendToCollaborators()
        }, 8000)
    }

    enableDiffSending() {
        window.clearTimeout(this.sendNextDiffTimer)
        this.awaitingDiffResponse = false
        this.sendToCollaborators()
    }

    receiveDocument(data) {
        this.cancelCurrentlyCheckingVersion()
        if (this.mod.editor.docInfo.confirmedDoc) {
            this.merge.adjustDocument(data)
        } else {
            this.loadDocument(data)
        }
    }

    loadDocument({doc, time, doc_info}) {
        // Reset collaboration
        this.unconfirmedDiffs = {}
        if (this.awaitingDiffResponse) {
            this.enableDiffSending()
        }
        // Remember location hash to scroll there subsequently.
        const locationHash = window.location.hash

        this.mod.editor.clientTimeAdjustment = Date.now() - time

        this.mod.editor.docInfo = doc_info
        this.mod.editor.docInfo.version = doc.v
        this.mod.editor.docInfo.updated = new Date()
        this.mod.editor.mod.db.bibDB.setDB(doc.bibliography)
        this.mod.editor.mod.db.imageDB.setDB(doc.images)
        const stateDoc = this.mod.editor.schema.nodeFromJSON(doc.content)
        const plugins = this.mod.editor.statePlugins.map(plugin => {
            if (plugin[1]) {
                return plugin[0](plugin[1](doc))
            } else {
                return plugin[0]()
            }
        })

        const stateConfig = {
            schema: this.mod.editor.schema,
            doc: stateDoc,
            plugins
        }

        // Set document in prosemirror
        this.mod.editor.view.setProps({state: EditorState.create(stateConfig)})
        this.mod.editor.view.setProps({nodeViews: {}}) // Needed to initialize nodeViews in plugins
        // Set initial confirmed doc
        this.mod.editor.docInfo.confirmedDoc = this.mod.editor.view.state.doc

        // Render footnotes based on main doc
        this.mod.editor.mod.footnotes.fnEditor.renderAllFootnotes()

        //  Setup comment handling
        this.mod.editor.mod.comments.store.reset()
        this.mod.editor.mod.comments.store.loadComments(doc.comments)
        this.mod.editor.mod.marginboxes.view(this.mod.editor.view)
        deactivateWait()
        if (locationHash.length) {
            this.mod.editor.scrollIdIntoView(locationHash.slice(1))
        }
        this.mod.editor.waitingForDocument = false
        if (doc.template) {
            // We received the template. That means we are the first user present with write access.
            // We will adjust the document to the template if necessary.
            activateWait(true, gettext("Updating document. Please wait..."))
            const activateWaitTimer = setTimeout(() => {
                activateWait(
                    true,
                    gettext(
                        "It's taking a bit longer than usual, but it should be ready soon. Please wait..."
                    )
                )
            }, 60000)
            const adjustWorker = makeWorker(
                staticUrl("js/adjust_doc_to_template_worker.js")
            )
            adjustWorker.onmessage = message => {
                if (message.data.type === "result") {
                    if (message.data.steps.length) {
                        const tr = this.mod.editor.view.state.tr
                        message.data.steps.forEach(step =>
                            tr.step(Step.fromJSON(this.mod.editor.schema, step))
                        )
                        tr.setMeta("remote", true)
                        this.mod.editor.view.dispatch(tr)
                    }
                    // clearing timer for updating message since operation is completed
                    clearTimeout(activateWaitTimer)
                    deactivateWait()
                    this.setDocSettings()
                }
            }
            const schemaExporter = new SchemaExport()
            adjustWorker.postMessage({
                schemaSpec: JSON.parse(schemaExporter.init()),
                doc: doc.content,
                template: doc.template.content,
                documentStyleSlugs:
                    this.mod.editor.mod.documentTemplate.documentStyles.map(
                        style => style.slug
                    )
            })
        } else {
            this.setDocSettings()
        }
    }

    setDocSettings() {
        // Set part specific settings
        this.mod.editor.mod.documentTemplate.addDocPartSettings()
        this.mod.editor.mod.documentTemplate.addCitationStylesMenuEntries()
    }

    sendToCollaborators() {
        // Handle either doc change and comment updates OR caret update. Priority
        // for doc change/comment update.
        this.mod.editor.ws.send(() => {
            if (
                this.awaitingDiffResponse ||
                this.mod.editor.waitingForDocument ||
                this.receiving
            ) {
                return false
            } else if (
                sendableSteps(this.mod.editor.view.state) ||
                this.mod.editor.mod.comments.store.unsentEvents().length ||
                this.mod.editor.mod.db.bibDB.unsentEvents().length ||
                this.mod.editor.mod.db.imageDB.unsentEvents().length
            ) {
                this.disableDiffSending()
                const stepsToSend = sendableSteps(this.mod.editor.view.state),
                    fnStepsToSend = sendableSteps(
                        this.mod.editor.mod.footnotes.fnEditor.view.state
                    ),
                    commentUpdates =
                        this.mod.editor.mod.comments.store.unsentEvents(),
                    bibliographyUpdates =
                        this.mod.editor.mod.db.bibDB.unsentEvents(),
                    imageUpdates = this.mod.editor.mod.db.imageDB.unsentEvents()

                if (
                    !stepsToSend &&
                    !fnStepsToSend &&
                    !commentUpdates.length &&
                    !bibliographyUpdates.length &&
                    !imageUpdates.length
                ) {
                    // no diff. abandon operation
                    return
                }
                const rid = this.confirmStepsRequestCounter++,
                    unconfirmedDiff = {
                        type: "diff",
                        v: this.mod.editor.docInfo.version,
                        rid
                    }

                unconfirmedDiff["cid"] = this.mod.editor.client_id

                if (stepsToSend) {
                    unconfirmedDiff["ds"] = stepsToSend.steps.map(s =>
                        s.toJSON()
                    )
                    // In case the title changed, we also add a title field to
                    // update the title field instantly - important for the
                    // document overview page.
                    let newTitle = ""
                    this.mod.editor.view.state.doc.firstChild.forEach(child => {
                        if (
                            !child.marks.find(
                                mark => mark.type.name === "deletion"
                            )
                        ) {
                            newTitle += child.textContent
                        }
                    })
                    newTitle = newTitle.slice(0, 255)
                    let oldTitle = ""
                    this.mod.editor.docInfo.confirmedDoc.firstChild.forEach(
                        child => {
                            if (
                                !child.marks.find(
                                    mark => mark.type.name === "deletion"
                                )
                            ) {
                                oldTitle += child.textContent
                            }
                        }
                    )
                    oldTitle = oldTitle.slice(0, 255)
                    if (newTitle !== oldTitle) {
                        unconfirmedDiff["ti"] = newTitle
                    }
                }

                if (fnStepsToSend) {
                    // We add the client ID to every single step
                    unconfirmedDiff["fs"] = fnStepsToSend.steps.map(s =>
                        s.toJSON()
                    )
                }
                if (this.footnoteRender) {
                    unconfirmedDiff["footnoterender"] = true
                    this.footnoteRender = false
                }
                if (commentUpdates.length) {
                    unconfirmedDiff["cu"] = commentUpdates
                }
                if (bibliographyUpdates.length) {
                    unconfirmedDiff["bu"] = bibliographyUpdates
                }
                if (imageUpdates.length) {
                    unconfirmedDiff["iu"] = imageUpdates
                }

                this.unconfirmedDiffs[rid] = Object.assign(
                    {doc: this.mod.editor.view.state.doc},
                    unconfirmedDiff
                )
                return unconfirmedDiff
            } else if (getSelectionUpdate(this.mod.editor.currentView.state)) {
                const currentView = this.mod.editor.currentView

                if (this.lastSelectionUpdateState === currentView.state) {
                    // Selection update has been sent for this state already. Skip
                    return false
                }
                this.lastSelectionUpdateState = currentView.state
                // Create a new caret as the current user
                const selectionUpdate = getSelectionUpdate(currentView.state)
                return {
                    type: "selection_change",
                    id: this.mod.editor.user.id,
                    v: this.mod.editor.docInfo.version,
                    session_id: this.mod.editor.docInfo.session_id,
                    anchor: selectionUpdate.anchor,
                    head: selectionUpdate.head,
                    // Whether the selection is in the footnote or the main editor
                    editor:
                        currentView === this.mod.editor.view
                            ? "main"
                            : "footnotes"
                }
            } else {
                return false
            }
        })
    }

    receiveSelectionChange(data) {
        const participant = this.mod.participants.find(
            par => par.id === data.id
        )
        let tr, fnTr
        if (!participant) {
            // participant is still unknown to us. Ignore
            return
        }
        if (data.editor === "footnotes") {
            fnTr = updateCollaboratorSelection(
                this.mod.editor.mod.footnotes.fnEditor.view.state,
                participant,
                data
            )
            tr = removeCollaboratorSelection(this.mod.editor.view.state, data)
        } else {
            tr = updateCollaboratorSelection(
                this.mod.editor.view.state,
                participant,
                data
            )
            fnTr = removeCollaboratorSelection(
                this.mod.editor.mod.footnotes.fnEditor.view.state,
                data
            )
        }
        if (tr) {
            this.mod.editor.view.dispatch(tr)
        }
        if (fnTr) {
            this.mod.editor.mod.footnotes.fnEditor.view.dispatch(fnTr)
        }
    }

    receiveDiff(data, serverFix = false) {
        this.mod.editor.docInfo.version++
        if (data["bu"]) {
            // bibliography updates
            this.mod.editor.mod.db.bibDB.receive(data["bu"])
        }
        if (data["iu"]) {
            // images updates
            this.mod.editor.mod.db.imageDB.receive(data["iu"])
        }
        if (data["cu"]) {
            // comment updates
            this.mod.editor.mod.comments.store.receive(data["cu"])
        }
        if (data["ds"]) {
            // document steps
            this.applyDiffs(data["ds"], data["cid"])
        }
        if (data["fs"]) {
            // footnote steps
            this.mod.editor.mod.footnotes.fnEditor.applyDiffs(
                data["fs"],
                data["cid"]
            )
        }
        if (data["footnoterender"]) {
            // re-render footnotes properly
            this.mod.editor.mod.footnotes.fnEditor.renderAllFootnotes()
        }

        if (serverFix) {
            // Diff is a fix created by server due to missing diffs.
            if ("reject_request_id" in data) {
                delete this.unconfirmedDiffs[data.reject_request_id]
            }
            this.cancelCurrentlyCheckingVersion()

            // There may be unsent local changes. Send them now after .5 seconds,
            // in case collaborators want to send something first.
            this.enableDiffSending()
            window.setTimeout(() => this.sendToCollaborators(), 500)
        }
    }

    setConfirmedDoc(tr, stepsLength) {
        // Find the latest version of the doc without any unconfirmed local changes

        const rebased = tr.getMeta("rebased"),
            docNumber = rebased + stepsLength

        this.mod.editor.docInfo.confirmedDoc =
            docNumber === tr.docs.length ? tr.doc : tr.docs[docNumber]
    }

    confirmDiff(request_id) {
        const unconfirmedDiffs = this.unconfirmedDiffs[request_id]
        if (!unconfirmedDiffs) {
            return
        }
        this.mod.editor.docInfo.version++

        const sentSteps = unconfirmedDiffs["ds"] // document steps
        if (sentSteps) {
            const ourIds = sentSteps.map(_step => this.mod.editor.client_id)
            const tr = receiveTransaction(
                this.mod.editor.view.state,
                sentSteps,
                ourIds
            )
            this.mod.editor.view.dispatch(tr)
            this.mod.editor.docInfo.confirmedDoc = unconfirmedDiffs["doc"]
        }

        const sentFnSteps = unconfirmedDiffs["fs"] // footnote steps
        if (sentFnSteps) {
            const fnTr = receiveTransaction(
                this.mod.editor.mod.footnotes.fnEditor.view.state,
                sentFnSteps,
                sentFnSteps.map(_step => this.mod.editor.client_id)
            )
            this.mod.editor.mod.footnotes.fnEditor.view.dispatch(fnTr)
        }

        const sentComments = unconfirmedDiffs["cu"] // comment updates
        if (sentComments) {
            this.mod.editor.mod.comments.store.eventsSent(sentComments)
        }

        const sentBibliographyUpdates = unconfirmedDiffs["bu"] // bibliography updates
        if (sentBibliographyUpdates) {
            this.mod.editor.mod.db.bibDB.eventsSent(sentBibliographyUpdates)
        }

        const sentImageUpdates = unconfirmedDiffs["iu"] // image updates
        if (sentImageUpdates) {
            this.mod.editor.mod.db.imageDB.eventsSent(sentImageUpdates)
        }

        delete this.unconfirmedDiffs[request_id]
        this.enableDiffSending()
    }

    rejectDiff(request_id) {
        delete this.unconfirmedDiffs[request_id]
        this.enableDiffSending()
    }

    applyDiffs(diffs, cid) {
        this.receiving = true
        const steps = diffs.map(j => Step.fromJSON(this.mod.editor.schema, j))
        const clientIds = diffs.map(_ => cid)
        const tr = receiveTransaction(
            this.mod.editor.view.state,
            steps,
            clientIds
        )
        tr.setMeta("remote", true)
        this.mod.editor.view.dispatch(tr)
        this.setConfirmedDoc(tr, steps.length)
        this.receiving = false
        this.sendToCollaborators()
    }
}
