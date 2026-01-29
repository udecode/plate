import {collab} from "prosemirror-collab"
import {baseKeymap} from "prosemirror-commands"
import {dropCursor} from "prosemirror-dropcursor"
import {buildKeymap} from "prosemirror-example-setup"
import {gapCursor} from "prosemirror-gapcursor"
import {keymap} from "prosemirror-keymap"
import {EditorState} from "prosemirror-state"
import {
    AddMarkStep,
    Mapping,
    RemoveMarkStep,
    ReplaceAroundStep,
    ReplaceStep
} from "prosemirror-transform"
import {EditorView} from "prosemirror-view"
import {RenderCitations} from "../../../citations/render"
import {
    Dialog,
    activateWait,
    deactivateWait,
    ensureCSS,
    faqDialog,
    showSystemMessage
} from "../../../common"
import {BIBLIOGRAPHY_HEADERS} from "../../../schema/i18n"
import {buildEditorKeymap} from "../../keymap"
import {jumpHiddenNodesPlugin, searchPlugin} from "../../state_plugins"
import {trackedTransaction} from "../../track"
import {changeSet} from "./changeset"
import {FootnoteView} from "./footnotes"
import {recreateTransform} from "./recreate_transform"
import {createDiffSchema} from "./schema"
import {clipboardPlugin, diffPlugin} from "./state_plugins"
import {
    checkPresenceOfdiffdata,
    dispatchRemoveDiffdata,
    removeDiffFromJson,
    simplifyTransform
} from "./tools"

export class MergeEditor {
    constructor(editor, cpDoc, offlineDoc, onlineDoc, offlineTr, onlineTr, db) {
        this.editor = editor
        this.schema = createDiffSchema(editor.schema)
        this.cpDoc = this.schema.nodeFromJSON(cpDoc.toJSON())
        this.offlineDoc = this.schema.nodeFromJSON(offlineDoc.toJSON())
        this.onlineDoc = this.schema.nodeFromJSON(onlineDoc.toJSON())
        this.offlineTr = simplifyTransform(offlineTr) // The offline transaction
        this.onlineTr = simplifyTransform(onlineTr) // The online Transaction
        this.mergeDialog = this.createMergeDialog(
            this.offlineTr,
            this.onlineDoc
        )
        this.warningDialog = false
        this.db = db
        this.mergedDocMap = this.onlineTr.mapping // the maps of the middle editor, used for applying steps automatically

        this.mergeView1 = false
        this.mergeView2 = false
        this.mergeView3 = false
        this.imageDataModified = {} // To hold data related to re-uploaded images.

        this.offlineTrackedSteps = []

        this.diffEditorPlugins = [
            [diffPlugin, () => ({merge: this})],
            [keymap, () => buildEditorKeymap(this.schema)],
            [keymap, () => buildKeymap(this.schema)],
            [keymap, () => baseKeymap],
            [collab, () => ({clientID: this.editor.client_id})],
            // [history],
            [dropCursor],
            [gapCursor],
            // [tableEditing],
            [jumpHiddenNodesPlugin],
            [searchPlugin],
            [clipboardPlugin, () => ({editor: this.editor})]
        ]

        // assign image DB & BibDB to be used in document schema.
        this.schema.cached.bibDB = this.editor.mod.db.bibDB
        this.schema.cached.imageDB = this.editor.mod.db.imageDB
    }

    init() {
        /* Create the diff editors */
        ensureCSS([staticUrl("css/merge.css")])
        // Activate wait overlay
        activateWait()

        this.mergeDialog.open()

        // Create multiple editor views
        this.mergeView1 = this.bindEditorView("editor-diff-common", this.cpDoc)
        this.mergeView2 = this.bindEditorView(
            "editor-diff-online",
            this.onlineDoc
        )
        this.mergeView3 = this.bindEditorView(
            "editor-diff-offline",
            this.offlineDoc
        )

        const offlineChangeset = new changeSet(this.offlineTr).getChangeSet()
        const onlineChangeset = new changeSet(this.onlineTr).getChangeSet()

        // Unhide All Sections in All the 3 views
        this.unHideSectionsinAllDoc()

        const offlineTrackedSteps = this.markChangesinDiffEditor(
            offlineChangeset,
            this.mergeView3,
            "offline-inserted",
            this.offlineTr
        )
        this.markChangesinDiffEditor(
            onlineChangeset,
            this.mergeView2,
            "online-inserted",
            this.onlineTr
        )
        this.offlineTrackedSteps =
            this.offlineTrackedSteps.concat(offlineTrackedSteps)

        if (
            this.mergeView2.state.doc.attrs.tracked ||
            this.mergeView3.state.doc.attrs.tracked
        ) {
            this.mergeView2.dispatch(
                this.mergeView2.state.tr
                    .setDocAttribute("tracked", true)
                    .setMeta("notrack", true)
                    .setMeta("mapAppended", true)
            )
        }

        this.renderCitation(this.mergeView1, "editor-diff-common")
        this.renderCitation(this.mergeView2, "editor-diff-online")
        this.renderCitation(this.mergeView3, "editor-diff-offline")

        this.offStepsNotTracked = this.findNotTrackedSteps(
            this.offlineTr,
            this.offlineTrackedSteps
        )

        deactivateWait()

        // Update the Bib and image DB before hand with the data from the offline document and the socket data.
        this.updateDB(this.offlineDoc, this.db) // Updating the editor DB is one-time operation.
    }

    createMergeDialog(offlineTr, onlineDoc) {
        const buttons = [
            {
                text: gettext("Merge Complete"),
                classes: "fw-dark",
                click: () => {
                    if (!this.checkResolution()) {
                        this.startMerge(offlineTr, onlineDoc)
                    } else {
                        this.warningDialog = new Dialog({
                            id: "merge-res-warning",
                            title: gettext("Merge Resolution warning"),
                            body: gettext(
                                "Not all changes have been resolved. Please make sure to review all the changes to before proceeding."
                            ),
                            buttons: [
                                {
                                    text: gettext("Proceed to Merge"),
                                    classes: "fw-dark",
                                    click: () => {
                                        this.startMerge(offlineTr, onlineDoc)
                                        this.warningDialog.close()
                                    }
                                }
                            ]
                        })
                        this.warningDialog.open()
                    }
                }
            }
        ]
        const dialog = new Dialog({
            id: "editor-merge-view",
            title: gettext("Merging Offline Document"),
            body: `<div style="display:flex"><div class="offline-heading">${gettext("Common Document")}</div><div class="merged-heading">${gettext("Online Document")}</div> <div class="online-heading">${gettext("Offline Document")}</div></div><div class= "user-contents" style="display:flex;"><div id="editor-diff-common" style="float:left;padding:15px;"></div><div id="editor-diff-online" class="merged-view" style="padding:15px;"></div><div id="editor-diff-offline" style="float:right;padding:15px;"></div></div>`,
            fullScreen: true,
            canClose: false,
            help: () => {
                const helpDialog = new faqDialog({
                    title: gettext("Merge Dialog Frequent Questions"),
                    questions: [
                        [
                            gettext("Why am I seeing this merge dialog?"),
                            gettext(
                                "You are seeing this merge dialog because you were offline for a long time, and the changes you made to the document while you were offline conflicted with the changes made by other users. So it was not possible to merge your edits in automatically."
                            )
                        ],
                        [
                            gettext("Am I the only one seeing this dialog?"),
                            gettext(
                                "Yes, you are the only one who can see this dialog. Therefore it would be great if you could ask your collaborators to stop editing the document, so that once you are finished with the merge, it will not lead to more conflicts."
                            )
                        ],
                        [
                            gettext(
                                "What if my collaborators continue working on the document while I am merging?"
                            ),
                            gettext(
                                "Do not worry, we can handle such a situation as we will simply show you another merge dialog."
                            )
                        ],
                        [
                            gettext("Why am I seeing three editors?"),
                            gettext(
                                "The editor on the left will show the last common version of the document. It is shown for reference only. The editor in the middle is the merge editor and it initially contains the document resulting from other users' edits. The editor on the right is the offline editor and it contains the document resulting from your changes while you were offline."
                            )
                        ],
                        [
                            gettext(
                                "What are the green and red highlights in the editors?"
                            ),
                            gettext(
                                "The editors in the middle and on the right will show content that is highlighted in green. They also contain text that is highlighted in red. The text marked in green corresponds to the text that was edited (added) by you or other users. The text marked in red corresponds to text that was deleted by either you or other users. The insertions and deletions made by other users will be marked in the merge editor. The insertions and deletions made by you will be marked in the offline editor on the right."
                            )
                        ],
                        [
                            gettext(
                                "How do I accept or reject a particular change?"
                            ),
                            // Add images in dictionary.They'd be interpolated later.
                            gettext(
                                "Accepting or rejecting a change in the merge editor in the middle or the offline editor on the right causes a change in the merge editor. You can accept a change by directly clicking on the highlighted text. A dropdown menu will appear and you can then either accept or reject the change. When you click on the highlighted text, it also highlights the changes that will get accepted. %(mergeImage)s As shown in the above image one can click on a highlighted change, and click on accept change. On accepting a change it will be reflected in the merged document editor in the middle. Rejecting a change works in the same way except on reject a change the highlight of the change will be lost, with it the ability to accept, reject or copy a change."
                            ),
                            {
                                mergeImage: `<img src="${staticUrl("img/accept_change.avif")}" class = "merge-img">`
                            },
                            {hasImage: true}
                        ],
                        [
                            gettext(
                                "I cannot accept a particular change. What do I do?"
                            ),
                            gettext(
                                "If you cannot automatically accept a change into the merge editor, do not worry. You can choose to copy the change either by clicking on the copy button or manually copy the change and then paste it in the merge editor in the middle. It is as simple as that!"
                            )
                        ],
                        [
                            gettext("Can I edit content in all three editors?"),
                            gettext(
                                "You can edit the content only in the merge editor in the middle. You cannot edit content in the other two editors."
                            )
                        ],
                        [
                            gettext(
                                "Does the order in which I work on merging the changes matter?"
                            ),
                            gettext(
                                "It is always better to try to accept the changes in a linear fashion."
                            )
                        ],
                        [
                            gettext("What do I do after completing the merge?"),
                            gettext(
                                "After the merge is completed, you can click on the button 'Merge Complete' which in turn will move your changes from the merge editor in the middle to the main editor. Do note if other users made significant changes to the document while you were merging the document, you might have to merge the documents together again."
                            )
                        ],
                        [
                            gettext(
                                "What happens if I try to complete merge without resolving all the changes?"
                            ),
                            gettext(
                                "You will receive a warning when you try to complete a merge without accepting or rejecting all the changes. You can still proceed to merge the document. If you do that, all the insertions and deletions in the merge editor in the middle will be accepted automatically, and all the insertions and deletions in the offline editor on the right will be ignored."
                            )
                        ]
                    ]
                })
                helpDialog.open()
            },
            buttons
        })
        return dialog
    }

    checkResolution() {
        /* To Check if all the diffs are resolved */
        const offlineVersionDoc = this.mergeView3.state.doc,
            mergedVersionDoc = this.mergeView2.state.doc
        let diffAttrPresent = false
        if (
            offlineVersionDoc.rangeHasMark(
                0,
                offlineVersionDoc.content.size,
                this.schema.marks.diffdata
            ) ||
            mergedVersionDoc.rangeHasMark(
                0,
                mergedVersionDoc.content.size,
                this.schema.marks.diffdata
            )
        ) {
            return true
        }
        offlineVersionDoc.nodesBetween(
            0,
            offlineVersionDoc.content.size,
            (node, _pos) => {
                if (node.attrs.diffdata && node.attrs.diffdata.length > 0) {
                    diffAttrPresent = true
                }
            }
        )
        mergedVersionDoc.nodesBetween(
            0,
            mergedVersionDoc.content.size,
            (node, _pos) => {
                if (node.attrs.diffdata && node.attrs.diffdata.length > 0) {
                    diffAttrPresent = true
                }
            }
        )
        if (
            this.mergeView2.dom.querySelector(".deletion-decoration") ||
            this.mergeView3.dom.querySelector(".deletion-decoration")
        ) {
            diffAttrPresent = true
        }
        if (diffAttrPresent) {
            return true
        }
        return false
    }

    markChangesinDiffEditor(changeset, view, insertionClass, tr) {
        /* This marks all the changes in the diff editor */
        // Mark the insertions in insertion View & deletions in deletionView
        const insertionMarksTr = view.state.tr
        let stepsTrackedByChangeset = []
        // Use the changeset to create the marks
        changeset.changes.forEach(change => {
            if (change.inserted.length > 0) {
                let stepsInvolved = []
                change.inserted.forEach(insertion =>
                    stepsInvolved.push(Number.parseInt(insertion.data.step))
                )
                const stepsSet = new Set(stepsInvolved)
                stepsInvolved = Array.from(stepsSet)

                // Add the footnote related steps because the changeset tracks change but misses some steps related to insertion of footnote node!
                tr.steps.forEach((step, index) => {
                    if (
                        step.from >= change.fromB &&
                        step.to <= change.toB &&
                        step instanceof ReplaceStep &&
                        !stepsInvolved.includes(index)
                    ) {
                        const stepOne = step.toJSON()
                        if (
                            stepOne.slice &&
                            stepOne.from !== stepOne.to &&
                            stepOne.slice.content.length == 1 &&
                            (stepOne.slice.content[0].type === "footnote" ||
                                stepOne.slice.content[0].type === "citation")
                        ) {
                            stepsInvolved.push(index)
                        }
                    } else if (
                        step.from >= change.fromB &&
                        step.to <= change.toB &&
                        step instanceof AddMarkStep &&
                        !stepsInvolved.includes(index)
                    ) {
                        const stepOne = step.toJSON()
                        if (
                            stepOne.mark &&
                            [
                                "strong",
                                "em",
                                "underline",
                                "link",
                                "deletion",
                                "insertion",
                                "comment"
                            ].includes(stepOne.mark.type)
                        ) {
                            stepsInvolved.push(index)
                        }
                    }
                })

                stepsInvolved.sort((a, b) => a - b)
                const insertionMark = this.schema.marks.diffdata.create({
                    diff: insertionClass,
                    steps: JSON.stringify(stepsInvolved),
                    from: change.fromB,
                    to: change.toB,
                    markOnly: false
                })
                insertionMarksTr.addMark(
                    change.fromB,
                    change.toB,
                    insertionMark
                )
                this.markBlockDiffs(
                    insertionMarksTr,
                    change.fromB,
                    change.toB,
                    insertionClass,
                    stepsInvolved
                )
                if (
                    checkPresenceOfdiffdata(
                        insertionMarksTr.doc,
                        change.fromB,
                        change.toB
                    )
                ) {
                    stepsTrackedByChangeset =
                        stepsTrackedByChangeset.concat(stepsInvolved)
                }
            }
        })

        // Add all the footnote/mark/citation related steps that are not tracked by changeset.
        tr.steps.forEach((step, index) => {
            const from = tr.mapping.slice(index).map(step.from)
            const to = tr.mapping.slice(index).map(step.to, -1)
            if (
                step instanceof ReplaceStep &&
                !stepsTrackedByChangeset.includes(index)
            ) {
                const stepOne = step.toJSON()
                if (
                    stepOne.slice &&
                    stepOne.slice.content.length == 1 &&
                    stepOne.slice.content[0].type === "footnote"
                ) {
                    const insertionMark = this.schema.marks.diffdata.create({
                        diff: insertionClass,
                        steps: JSON.stringify([index]),
                        from: from,
                        to: to,
                        markOnly: false
                    })
                    insertionMarksTr.addMark(from, to, insertionMark)
                    stepsTrackedByChangeset.push(index)
                } else if (
                    stepOne.slice &&
                    stepOne.slice.content.length == 1 &&
                    stepOne.slice.content[0].type === "citation"
                ) {
                    const insertionMark = this.schema.marks.diffdata.create({
                        diff: insertionClass,
                        steps: JSON.stringify([index]),
                        from: from,
                        to: to,
                        markOnly: false
                    })
                    insertionMarksTr.addMark(from, to, insertionMark)
                    stepsTrackedByChangeset.push(index)
                } else if (
                    stepOne.slice &&
                    stepOne.slice.content[0].type === "figure"
                ) {
                    if (stepOne.from == stepOne.to) {
                        this.markBlockDiffs(
                            insertionMarksTr,
                            stepOne.from,
                            stepOne.to + 1,
                            insertionClass,
                            [index]
                        )
                    } else {
                        this.markBlockDiffs(
                            insertionMarksTr,
                            stepOne.from,
                            stepOne.to,
                            insertionClass,
                            [index]
                        )
                    }
                    stepsTrackedByChangeset.push(index)
                }
            } else if (
                (step instanceof AddMarkStep ||
                    step instanceof RemoveMarkStep) &&
                !stepsTrackedByChangeset.includes(index)
            ) {
                const stepOne = step.toJSON(),
                    stepsInvolved = []
                stepsInvolved.push(index)
                if (
                    stepOne.mark &&
                    ["strong", "em", "underline", "link", "deletion"].includes(
                        stepOne.mark.type
                    )
                ) {
                    tr.steps.forEach((trStep, trIndex) => {
                        // Check for other format changes within this range.
                        if (
                            (trStep instanceof AddMarkStep ||
                                trStep instanceof RemoveMarkStep) &&
                            !stepsTrackedByChangeset.includes(trIndex)
                        ) {
                            const mapFrom = tr.mapping
                                .slice(trIndex)
                                .map(trStep.from)
                            const mapTo = tr.mapping
                                .slice(trIndex)
                                .map(trStep.to)
                            if (
                                mapFrom >= from &&
                                mapTo <= to &&
                                !stepsInvolved.includes(trIndex)
                            ) {
                                const stepTwo = trStep.toJSON()
                                if (
                                    stepTwo.mark &&
                                    [
                                        "strong",
                                        "em",
                                        "underline",
                                        "link",
                                        "deletion"
                                    ].includes(stepTwo.mark.type)
                                ) {
                                    stepsInvolved.push(trIndex)
                                }
                            }
                        }
                    })
                    const insertionMark = this.schema.marks.diffdata.create({
                        diff: insertionClass,
                        steps: JSON.stringify(stepsInvolved),
                        from: from,
                        to: to,
                        markOnly: true
                    })
                    stepsTrackedByChangeset =
                        stepsTrackedByChangeset.concat(stepsInvolved)
                    insertionMarksTr.addMark(from, to, insertionMark)
                }
            } else if (
                step instanceof ReplaceAroundStep &&
                !stepsTrackedByChangeset.includes(index)
            ) {
                const stepOne = step.toJSON()
                if (
                    stepOne.slice &&
                    stepOne.slice.content[0].type === "figure"
                ) {
                    this.markBlockDiffs(
                        insertionMarksTr,
                        stepOne.from,
                        stepOne.to,
                        insertionClass,
                        [index]
                    )
                    stepsTrackedByChangeset.push(index)
                }
            }
        })

        // Dispatch the transactions
        insertionMarksTr
            .setMeta("initialDiffMap", true)
            .setMeta("mapAppended", true)
            .setMeta("notrack", true)
        view.dispatch(insertionMarksTr)

        //Return steps that are tracked in the diff editor
        return stepsTrackedByChangeset
    }

    bindEditorView(elementId, doc) {
        /* Binds the editor view */
        const plugins = this.diffEditorPlugins.map(plugin => {
            if (plugin[1]) {
                return plugin[0](plugin[1](doc))
            } else {
                return plugin[0]()
            }
        })
        let editorView
        const mainEditor = this.editor
        if (elementId == "editor-diff-online") {
            editorView = new EditorView(document.getElementById(elementId), {
                state: EditorState.create({
                    schema: this.schema,
                    doc: doc,
                    plugins: plugins
                }),
                dispatchTransaction: tr => {
                    let mapTr = tr
                    if (tr.docChanged) {
                        const mapAppended = tr.getMeta("mapAppended")
                        const noTrack = tr.getMeta("notrack")
                        if (!mapAppended) {
                            this.mergedDocMap.appendMapping(tr.mapping)
                        }
                        if (!noTrack) {
                            // Track only manual insertions
                            mapTr = trackedTransaction(
                                mapTr,
                                this.mergeView2.state,
                                this.editor.user,
                                !this.mergeView2.state.doc.attrs.tracked &&
                                    ![
                                        "write-tracked",
                                        "review-tracked"
                                    ].includes(
                                        this.editor.docInfo.access_rights
                                    ),
                                Date.now() - this.editor.clientTimeAdjustment
                            )
                        }
                    }
                    const newState = editorView.state.apply(mapTr)
                    editorView.updateState(newState)
                    this.renderCitation(editorView, elementId)
                },
                nodeViews: {
                    footnote(node, view, getPos) {
                        return new FootnoteView(node, view, getPos, mainEditor)
                    }
                }
            })
        } else {
            editorView = new EditorView(document.getElementById(elementId), {
                state: EditorState.create({
                    schema: this.schema,
                    doc: doc,
                    plugins: plugins
                }),
                dispatchTransaction: tr => {
                    const newState = editorView.state.apply(tr)
                    editorView.updateState(newState)
                    this.renderCitation(editorView, elementId)
                },
                editable: () => false,
                nodeViews: {
                    footnote(node, view, getPos) {
                        return new FootnoteView(node, view, getPos, mainEditor)
                    }
                }
            })
        }
        return editorView
    }

    renderCitation(view, elementId) {
        const settings = view.state.doc.attrs,
            bibliographyHeader =
                settings.bibliography_header[settings.language] ||
                BIBLIOGRAPHY_HEADERS[settings.language]
        const citRenderer = new RenderCitations(
            document.getElementById(elementId),
            settings.citationstyle,
            bibliographyHeader,
            this.editor.mod.db.bibDB,
            this.editor.app.csl
        )
        citRenderer.init()
    }

    startMerge(offlineTr, onlineDoc) {
        try {
            /* start the merge process of moving changes to the editor */
            // Remove all diff related marks
            dispatchRemoveDiffdata(
                this.mergeView2,
                0,
                this.mergeView2.state.doc.content.size
            )

            // Apply all the marks that are not handled by recreate steps!
            const markTr = this.mergeView2.state.tr
            const offlineRebaseMapping = new Mapping()
            offlineRebaseMapping.appendMappingInverted(offlineTr.mapping)
            offlineRebaseMapping.appendMapping(this.mergedDocMap)
            this.offStepsNotTracked.forEach(markstep => {
                const stepIndex = offlineTr.steps.indexOf(markstep)
                const offlineRebaseMap = offlineRebaseMapping.slice(
                    offlineTr.steps.length - stepIndex
                )
                const mappedMarkStep = markstep.map(offlineRebaseMap)
                if (
                    mappedMarkStep &&
                    !markTr.maybeStep(mappedMarkStep).failed
                ) {
                    this.mergedDocMap.appendMap(mappedMarkStep.getMap())
                    offlineRebaseMapping.appendMap(mappedMarkStep.getMap())
                    offlineRebaseMapping.setMirror(
                        offlineTr.steps.length - stepIndex - 1,
                        offlineTr.steps.length +
                            this.mergedDocMap.maps.length -
                            1
                    )
                }
            })
            this.mergeView2.dispatch(markTr)
            this.mergeDialog.close()

            const mergedDoc = this.mergeView2.state.doc
            //CleanUp
            this.mergeView1.destroy()
            this.mergeView2.destroy()
            this.mergeView3.destroy()

            this.applyChangesToMainEditor(onlineDoc, mergedDoc)
        } catch (error) {
            // Convert the doc to main editor schema
            const onlineDoc = this.editor.schema.nodeFromJSON(
                removeDiffFromJson(this.onlineDoc.toJSON())
            )
            const offlineDoc = this.editor.schema.nodeFromJSON(
                removeDiffFromJson(this.offlineDoc.toJSON())
            )

            // Handle merge failure
            this.editor.mod.collab.doc.merge.handleMergeFailure(
                error,
                offlineDoc,
                onlineDoc,
                this
            )
        }
    }

    unHideSections(view) {
        const unHideSectionTr = view.state.tr
        view.state.doc.forEach((child, offset, _index) => {
            if (child.attrs.optional) {
                const attrs = Object.assign({}, child.attrs, {hidden: false})
                unHideSectionTr.setNodeMarkup(offset, false, attrs)
            }
        })
        unHideSectionTr.setMeta("notrack", true).setMeta("mapAppended", true)
        view.dispatch(unHideSectionTr)
    }

    unHideSectionsinAllDoc() {
        /* Unhide all the optional sections */
        this.unHideSections(this.mergeView1)
        this.unHideSections(this.mergeView2)
        this.unHideSections(this.mergeView3)
    }

    applyChangesToMainEditor(onlineDoc, mergedDoc) {
        /* Applies the change from diff editor to main editor */
        onlineDoc = this.editor.schema.nodeFromJSON(
            removeDiffFromJson(onlineDoc.toJSON())
        )
        mergedDoc = this.editor.schema.nodeFromJSON(
            removeDiffFromJson(mergedDoc.toJSON())
        )
        const tr = simplifyTransform(recreateTransform(onlineDoc, mergedDoc))
        const OnlineStepsLost = recreateTransform(
            onlineDoc,
            this.editor.view.state.doc
        )
        const onlineStepsLostChangeset = new changeSet(OnlineStepsLost)
        const conflicts = onlineStepsLostChangeset.findConflicts(
            tr,
            OnlineStepsLost
        )
        if (conflicts.length > 0) {
            const editor = new MergeEditor(
                this.editor,
                onlineDoc,
                tr.doc,
                OnlineStepsLost.doc,
                tr,
                OnlineStepsLost,
                this.db
            )
            editor.init()
        } else {
            const newTr = this.editor.view.state.tr
            const maps = new Mapping(
                []
                    .concat(
                        tr.mapping.maps
                            .slice()
                            .reverse()
                            .map(map => map.invert())
                    )
                    .concat(OnlineStepsLost.mapping.maps)
            )
            tr.steps.forEach((step, index) => {
                const mapped = step.map(maps.slice(tr.steps.length - index))
                if (mapped && !newTr.maybeStep(mapped).failed) {
                    maps.appendMap(mapped.getMap())
                    maps.setMirror(
                        tr.steps.length - index - 1,
                        tr.steps.length +
                            OnlineStepsLost.steps.length +
                            newTr.steps.length -
                            1
                    )
                }
            })
            newTr.setMeta("remote", true)

            // Re-render the fn editor for all the users.
            this.editor.mod.collab.doc.footnoteRender = true

            this.editor.view.dispatch(newTr)
            this.editor.mod.footnotes.fnEditor.renderAllFootnotes()
        }
    }

    findNotTrackedSteps(tr, trackedSteps) {
        /* Find steps not tracked by PM, usually steps that cause change of attrs */
        const nonTrackedSteps = []
        tr.steps.forEach((step, index) => {
            // mark steps other than replace steps as not tracked if not tracked by changeset
            // these steps should effectively only be the node attrs change steps.
            if (
                !trackedSteps.includes(index) &&
                (step instanceof ReplaceAroundStep ||
                    step instanceof AddMarkStep ||
                    step instanceof RemoveMarkStep)
            ) {
                nonTrackedSteps.push(step)
            }
        })
        return nonTrackedSteps
    }

    markBlockDiffs(tr, from, to, difftype, stepsInvolved) {
        /* This Function is used to add diff data to Block Elements. */
        tr.doc.nodesBetween(from, to, (node, pos) => {
            if (
                pos < from ||
                ["bullet_list", "ordered_list"].includes(node.type.name)
            ) {
                return true
            } else if (node.isInline) {
                return false
            }
            if (node.attrs.diffdata) {
                const diffdata = []
                diffdata.push({
                    type: difftype,
                    from: from,
                    to: to,
                    steps: stepsInvolved
                })
                tr.setNodeMarkup(
                    pos,
                    null,
                    Object.assign({}, node.attrs, {diffdata}),
                    node.marks
                )
            }
        })
    }

    updateDB(offlineDoc, db) {
        /* Used to update the image,bib DB and update the doc in case if missing/lost images
        (update the image data with re-uploaded images) */
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

        // Looking at rebased doc so that it contains the merged document !!!
        offlineDoc.descendants(node => {
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

        const oldBibDB = this.editor.mod.db.bibDB.db
        this.editor.mod.db.bibDB.setDB(db.bibliography)
        usedBibs.forEach(id => {
            if (!this.editor.mod.db.bibDB.db[id] && oldBibDB[id]) {
                this.editor.mod.db.bibDB.updateReference(id, oldBibDB[id])
            }
        })
        const oldImageDB = this.editor.mod.db.imageDB.db
        let imageUploadFailDialogShown = false
        this.editor.mod.db.imageDB.setDB(db.images)
        usedImages = new Set(usedImages)
        usedImages = Array.from(usedImages)
        usedImages.forEach(id => {
            if (!this.editor.mod.db.imageDB.db[id] && oldImageDB[id]) {
                // If the image was uploaded by the offline user we know that he may not have deleted it so we can resend it normally
                if (
                    Object.keys(this.editor.app.imageDB.db).includes(String(id))
                ) {
                    this.editor.mod.db.imageDB.setImage(id, oldImageDB[id])
                } else {
                    // If the image was uploaded by someone else, to set the image we have to reupload it again as there is backend check to associate who can add an image with the image owner.
                    this.editor.mod.db.imageDB
                        .reUploadImage(
                            id,
                            oldImageDB[id].image,
                            oldImageDB[id].title,
                            oldImageDB[id].copyright
                        )
                        .then(
                            ({id, newId}) => {
                                this.imageDataModified[id] = newId
                                // Update the image node if there are any re uploaded images.
                                this.mergeView1.state.doc.descendants(
                                    (node, pos) => {
                                        if (
                                            node.type.name === "image" &&
                                            node.attrs.image == id
                                        ) {
                                            const attrs = Object.assign(
                                                {},
                                                node.attrs
                                            )
                                            attrs["image"] = newId
                                            const nodeType =
                                                this.mergeView1.state.schema
                                                    .nodes["image"]
                                            const transaction =
                                                this.mergeView1.state.tr.setNodeMarkup(
                                                    pos,
                                                    nodeType,
                                                    attrs
                                                )
                                            transaction.setMeta(
                                                "mapAppended",
                                                true
                                            )
                                            this.mergeView1.dispatch(
                                                transaction
                                            )
                                        }
                                    }
                                )
                                this.mergeView3.state.doc.descendants(
                                    (node, pos) => {
                                        if (
                                            node.type.name === "image" &&
                                            node.attrs.image == id
                                        ) {
                                            const attrs = Object.assign(
                                                {},
                                                node.attrs
                                            )
                                            attrs["image"] = newId
                                            const nodeType =
                                                this.mergeView3.state.schema
                                                    .nodes["image"]
                                            const transaction =
                                                this.mergeView3.state.tr.setNodeMarkup(
                                                    pos,
                                                    nodeType,
                                                    attrs
                                                )
                                            transaction.setMeta(
                                                "mapAppended",
                                                true
                                            )
                                            this.mergeView3.dispatch(
                                                transaction
                                            )
                                        }
                                    }
                                )
                            },
                            id => {
                                // In case of failure make the id as false so the failed upload image is empty for the offline user too!
                                this.mergeView1.state.doc.descendants(
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
                                                this.mergeView1.state.schema
                                                    .nodes["image"]
                                            const transaction =
                                                this.mergeView1.state.tr.setNodeMarkup(
                                                    pos,
                                                    nodeType,
                                                    attrs
                                                )
                                            transaction.setMeta(
                                                "mapAppended",
                                                true
                                            )
                                            this.mergeView1.dispatch(
                                                transaction
                                            )
                                        }
                                    }
                                )
                                this.mergeView3.state.doc.descendants(
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
                                                this.mergeView3.state.schema
                                                    .nodes["image"]
                                            const transaction =
                                                this.mergeView3.state.tr.setNodeMarkup(
                                                    pos,
                                                    nodeType,
                                                    attrs
                                                )
                                            transaction.setMeta(
                                                "mapAppended",
                                                true
                                            )
                                            this.mergeView3.dispatch(
                                                transaction
                                            )
                                        }
                                    }
                                )
                                if (!imageUploadFailDialogShown) {
                                    imageUploadFailDialogShown = true
                                    showSystemMessage(
                                        gettext(
                                            "One or more of the image(s) you copied could not be found on the server. Consider re-uploading them once the document is merged."
                                        )
                                    )
                                }
                            }
                        )
                }
            }
        })
    }
}
