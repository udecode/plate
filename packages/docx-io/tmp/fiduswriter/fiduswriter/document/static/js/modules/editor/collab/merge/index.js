import {receiveTransaction, sendableSteps} from "prosemirror-collab"
import {EditorState} from "prosemirror-state"
import {Mapping, Step, Transform} from "prosemirror-transform"
import {WRITE_ROLES} from "../../"
import {Dialog, addAlert, showSystemMessage} from "../../../common"
import {ExportFidusFile} from "../../../exporter/native"
import {getSettings} from "../../../schema/convert"
import {acceptAllNoInsertions, trackedTransaction} from "../../track"
import {changeSet} from "./changeset"
import {MergeEditor} from "./editor"
import {recreateTransform} from "./recreate_transform"
import {simplifyTransform} from "./tools"

export class Merge {
    constructor(mod) {
        this.mod = mod
        this.trackOfflineLimit = 50 // Limit of local changes while offline for tracking to kick in when multiple users edit
        this.remoteTrackOfflineLimit = 50 // Limit of remote changes while offline for tracking to kick in when multiple users edit
    }

    adjustDocument(data) {
        // Adjust the document when reconnecting after offline and many changes
        // happening on server.
        if (
            this.mod.editor.docInfo.version < data.doc.v &&
            sendableSteps(this.mod.editor.view.state)
        ) {
            this.mod.doc.receiving = true
            const confirmedState = EditorState.create({
                doc: this.mod.editor.docInfo.confirmedDoc
            })
            const unconfirmedTr = confirmedState.tr
            const sendable = sendableSteps(this.mod.editor.view.state)
            if (sendable) {
                sendable.steps.forEach(step => unconfirmedTr.step(step))
            }
            const rollbackTr = this.mod.editor.view.state.tr
            unconfirmedTr.steps
                .slice()
                .reverse()
                .forEach((step, index) =>
                    rollbackTr.step(
                        step.invert(
                            unconfirmedTr.docs[
                                unconfirmedTr.docs.length - index - 1
                            ]
                        )
                    )
                )
            // We reset to there being no local changes to send.
            this.mod.editor.view.dispatch(
                receiveTransaction(
                    this.mod.editor.view.state,
                    unconfirmedTr.steps,
                    unconfirmedTr.steps.map(_step => this.mod.editor.client_id)
                )
            )
            this.mod.editor.view.dispatch(
                receiveTransaction(
                    this.mod.editor.view.state,
                    rollbackTr.steps,
                    rollbackTr.steps.map(_step => "remote")
                ).setMeta("remote", true)
            )
            const toDoc = this.mod.editor.schema.nodeFromJSON(data.doc.content)
            // Apply the online Transaction
            let lostTr
            if (data.m) {
                lostTr = new Transform(this.mod.editor.view.state.doc)
                data.m.forEach(message => {
                    if (
                        message.ds &&
                        message.cid !== this.mod.editor.client_id
                    ) {
                        message.ds.forEach(j =>
                            lostTr.maybeStep(
                                Step.fromJSON(this.mod.editor.schema, j)
                            )
                        )
                    }
                })
                if (!lostTr.doc.eq(toDoc)) {
                    // We were not able to recreate the document using the steps in the diffs. So instead we recreate the steps artificially.
                    lostTr = recreateTransform(
                        this.mod.editor.view.state.doc,
                        toDoc
                    )
                }
            } else {
                lostTr = recreateTransform(
                    this.mod.editor.view.state.doc,
                    toDoc
                )
            }

            this.mod.editor.view.dispatch(
                receiveTransaction(
                    this.mod.editor.view.state,
                    lostTr.steps,
                    lostTr.steps.map(_step => "remote")
                ).setMeta("remote", true)
            )

            // We split the complex steps that delete and insert into simple steps so that finding conflicts is more pronounced.
            const modifiedLostTr = simplifyTransform(lostTr)
            const lostChangeSet = new changeSet(modifiedLostTr)
            const conflicts = lostChangeSet.findConflicts(
                unconfirmedTr,
                modifiedLostTr
            )
            // Set the version
            this.mod.editor.docInfo.version = data.doc.v

            // Before starting the merge process update the fn editor to be in sync
            // with main editor
            this.mod.editor.mod.footnotes.fnEditor.renderAllFootnotes()

            // Load all the newly added comments from online users.
            this.mod.editor.mod.comments.store.loadComments(data.doc.comments)

            // If no conflicts arises auto-merge the document
            let editor
            if (conflicts.length > 0) {
                try {
                    editor = new MergeEditor(
                        this.mod.editor,
                        confirmedState.doc,
                        unconfirmedTr.doc,
                        toDoc,
                        unconfirmedTr,
                        lostTr,
                        {
                            bibliography: data.doc.bibliography,
                            images: data.doc.images
                        }
                    )
                    editor.init()
                } catch (error) {
                    this.handleMergeFailure(
                        error,
                        unconfirmedTr.doc,
                        toDoc,
                        editor
                    )
                }
            } else {
                try {
                    this.autoMerge(
                        unconfirmedTr,
                        lostTr,
                        data,
                        this.mod.editor.view.state.selection
                    )
                } catch (error) {
                    this.handleMergeFailure(error, unconfirmedTr.doc, toDoc)
                }
            }

            this.mod.doc.receiving = false
            // this.mod.doc.sendToCollaborators()
        } else if (data.m) {
            // There are no local changes, so we can just receive all the remote messages directly
            data.m.forEach(message => this.mod.doc.receiveDiff(message, true))
        } else {
            // The server seems to have lost some data. We reset.
            this.mod.doc.loadDocument(data)
        }
    }

    autoMerge(unconfirmedTr, lostTr, data, selection) {
        /* This automerges documents incase of no conflicts */
        const toDoc = this.mod.editor.schema.nodeFromJSON(data.doc.content)
        const rebasedTr = EditorState.create({
            doc: toDoc,
            selection
        }).tr.setMeta("remote", true)
        const maps = new Mapping(
            []
                .concat(
                    unconfirmedTr.mapping.maps
                        .slice()
                        .reverse()
                        .map(map => map.invert())
                )
                .concat(lostTr.mapping.maps.slice())
        )

        unconfirmedTr.steps.forEach((step, index) => {
            const mapped = step.map(
                maps.slice(unconfirmedTr.steps.length - index)
            )
            if (mapped && !rebasedTr.maybeStep(mapped).failed) {
                maps.appendMap(mapped.getMap())
                maps.setMirror(
                    unconfirmedTr.steps.length - index - 1,
                    unconfirmedTr.steps.length +
                        lostTr.steps.length +
                        rebasedTr.steps.length -
                        1
                )
            }
        })

        let tracked
        let rebasedTrackedTr // offline steps to be tracked
        if (
            WRITE_ROLES.includes(this.mod.editor.docInfo.access_rights) &&
            (unconfirmedTr.steps.length > this.trackOfflineLimit ||
                lostTr.steps.length > this.remoteTrackOfflineLimit)
        ) {
            tracked = true
            // Either this user has made 50 changes since going offline,
            // or the document has 20 changes to it. Therefore we add tracking
            // to the changes of this user and ask user to clean up.
            rebasedTrackedTr = trackedTransaction(
                rebasedTr,
                this.mod.editor.view.state,
                this.mod.editor.user,
                false,
                Date.now() - this.mod.editor.clientTimeAdjustment
            )
        } else {
            tracked = false
            rebasedTrackedTr = rebasedTr
        }

        let usedImages = []
        const usedBibs = []
        const footnoteFind = (node, usedImages, usedBibs) => {
            if (node.name === "citation") {
                node.attrs.references.forEach(ref =>
                    usedBibs.push(Number.parseInt(ref.id))
                )
            } else if (node.name === "image" && node.attrs.image) {
                usedImages.push(node.attrs.image)
            } else if (node.content) {
                node.content.forEach(subNode =>
                    footnoteFind(subNode, usedImages, usedBibs)
                )
            }
        }
        rebasedTr.doc.descendants(node => {
            if (node.type.name === "citation") {
                node.attrs.references.forEach(ref =>
                    usedBibs.push(Number.parseInt(ref.id))
                )
            } else if (node.type.name === "image" && node.attrs.image) {
                usedImages.push(node.attrs.image)
            } else if (node.type.name === "footnote" && node.attrs.footnote) {
                node.attrs.footnote.forEach(subNode =>
                    footnoteFind(subNode, usedImages, usedBibs)
                )
            }
        })
        const oldBibDB = this.mod.editor.mod.db.bibDB.db
        this.mod.editor.mod.db.bibDB.setDB(data.doc.bibliography)
        usedBibs.forEach(id => {
            if (!this.mod.editor.mod.db.bibDB.db[id] && oldBibDB[id]) {
                this.mod.editor.mod.db.bibDB.updateReference(id, oldBibDB[id])
            }
        })
        const oldImageDB = this.mod.editor.mod.db.imageDB.db
        this.mod.editor.mod.db.imageDB.setDB(data.doc.images)
        // Remove the Duplicated image ID's
        usedImages = new Set(usedImages)
        usedImages = Array.from(usedImages)
        usedImages.forEach(id => {
            if (!this.mod.editor.mod.db.imageDB.db[id] && oldImageDB[id]) {
                // If the image was uploaded by the offline user we know that he may not have deleted it so we can resend it normally
                if (Object.keys(this.mod.editor.app.imageDB.db).includes(id)) {
                    this.mod.editor.mod.db.imageDB.setImage(id, oldImageDB[id])
                } else {
                    // If the image was uploaded by someone else , to set the image we have to reupload it again as there is backend check to associate who can add an image with the image owner.
                    this.mod.editor.mod.db.imageDB
                        .reUploadImage(
                            id,
                            oldImageDB[id].image,
                            oldImageDB[id].title,
                            oldImageDB[id].copyright
                        )
                        .then(
                            () => {},
                            id => {
                                const transaction =
                                    this.mod.editor.view.state.tr
                                this.mod.editor.view.state.doc.descendants(
                                    (node, pos) => {
                                        if (
                                            node.type.name === "image" &&
                                            node.attrs.image == id
                                        ) {
                                            const attrs = Object.assign(
                                                {},
                                                node.attrs
                                            )
                                            attrs["image"] = false
                                            const nodeType =
                                                this.mod.editor.currentView
                                                    .state.schema.nodes["image"]
                                            transaction.setNodeMarkup(
                                                pos,
                                                nodeType,
                                                attrs
                                            )
                                        }
                                    }
                                )
                                this.mod.editor.view.dispatch(transaction)
                                addAlert(
                                    "error",
                                    gettext(
                                        "One of the image(s) you copied could not be found on the server. Please try uploading it again."
                                    )
                                )
                            }
                        )
                }
            }
        })

        // this.mod.editor.docInfo.version = data.doc.v
        rebasedTrackedTr.setMeta("remote", true)
        this.mod.editor.view.dispatch(rebasedTrackedTr)

        if (tracked) {
            showSystemMessage(
                gettext(
                    "The document was modified substantially by other users while you were offline. We have merged your changes in as tracked changes. You should verify that your edits still make sense."
                )
            )
        }
        this.mod.editor.mod.footnotes.fnEditor.renderAllFootnotes()
    }

    getDocData(offlineDoc) {
        const pmArticle = acceptAllNoInsertions(offlineDoc).firstChild
        let title = ""
        pmArticle.firstChild.forEach(child => {
            if (!child.marks.find(mark => mark.type.name === "deletion")) {
                title += child.textContent
            }
        })

        return {
            content: pmArticle.toJSON(),
            settings: getSettings(pmArticle),
            title: title,
            version: this.mod.editor.docInfo.version,
            comments: this.mod.editor.mod.comments.store.comments,
            id: this.mod.editor.docInfo.id,
            updated: this.mod.editor.docInfo.updated
        }
    }

    handleMergeFailure(error, offlineDoc, _onlineDoc, mergeEditor = false) {
        // In case the auto-merge or manual merge failed due to JS Errors,
        // make a copy of the offline doc available for download.

        // Close the merge window if open
        if (mergeEditor && document.querySelector("#editor-merge-view")) {
            mergeEditor.mergeDialog.close()
            // Close merge resolution warning if open
            if (document.querySelector("#merge-res-warning")) {
                mergeEditor.warningDialog.close()
            }
        }

        // Prepare Export
        new ExportFidusFile(
            this.getDocData(offlineDoc),
            this.mod.editor.mod.db.bibDB,
            this.mod.editor.mod.db.imageDB
        )

        // Show up proper message
        const mergeFailedDialog = new Dialog({
            title: gettext("Merge failed"),
            id: "merge_failed",
            body: gettext(
                "An error occurred during the merge process, so we cannot save your work to the server any longer, and it is downloaded to your computer instead. Please consider importing it into a new document."
            ),
            buttons: [
                {
                    text: gettext("Leave editor"),
                    classes: "fw-dark",
                    click: () => {
                        window.location.href = "/"
                    }
                }
            ],
            canClose: false
        })
        mergeFailedDialog.open()

        // Close the editor operations.
        this.mod.editor.close()

        // Throw the error so it is logged.
        throw error
    }
}
