import {collab, receiveTransaction} from "prosemirror-collab"
import {baseKeymap} from "prosemirror-commands"
import {dropCursor} from "prosemirror-dropcursor"
import {buildKeymap} from "prosemirror-example-setup"
import {gapCursor} from "prosemirror-gapcursor"
import {history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {EditorState} from "prosemirror-state"
import {Step} from "prosemirror-transform"
import {EditorView} from "prosemirror-view"

import {fnSchema} from "../../schema/footnotes"
import {fnNodeToPmNode} from "../../schema/footnotes_convert"
import {
    citationRenderPlugin,
    clipboardPlugin,
    collabCaretsPlugin,
    commentsPlugin,
    figurePlugin,
    getFootnoteMarkerContents,
    linksPlugin,
    marginboxesPlugin,
    searchPlugin,
    selectionMenuPlugin,
    toolbarPlugin,
    trackPlugin,
    updateFootnoteMarker
} from "../state_plugins"
import {amendTransaction} from "../track"
import {accessRightsPlugin} from "./state_plugins"

/* Functions related to the footnote editor instance */
export class ModFootnoteEditor {
    constructor(mod) {
        mod.fnEditor = this
        this.mod = mod
        this.schema = fnSchema
        this.fnStatePlugins = [
            [linksPlugin, () => ({editor: this.mod.editor})],
            [history],
            [keymap, () => baseKeymap],
            [keymap, () => buildKeymap(this.schema)],
            [collab, () => ({clientID: this.mod.editor.client_id})],
            [dropCursor],
            [gapCursor],
            [selectionMenuPlugin, () => ({editor: this.mod.editor})],
            [toolbarPlugin, () => ({editor: this.mod.editor})],
            [citationRenderPlugin, () => ({editor: this.mod.editor})],
            [collabCaretsPlugin, () => ({editor: this.mod.editor})],
            [
                clipboardPlugin,
                () => ({editor: this.mod.editor, viewType: "footnotes"})
            ],
            [accessRightsPlugin, () => ({editor: this.mod.editor})],
            [commentsPlugin, () => ({editor: this.mod.editor})],
            [trackPlugin, () => ({editor: this.mod.editor})],
            [marginboxesPlugin, () => ({editor: this.mod.editor})],
            [searchPlugin],
            [figurePlugin, () => ({editor: this.mod.editor})]
        ]
    }

    init() {
        const doc = this.schema.nodeFromJSON({type: "doc", content: []}),
            plugins = this.fnStatePlugins.map(plugin => {
                if (plugin[1]) {
                    return plugin[0](plugin[1](doc))
                } else {
                    return plugin[0](doc)
                }
            })

        this.view = new EditorView(
            document.getElementById("footnote-box-container"),
            {
                state: EditorState.create({
                    schema: this.schema,
                    doc,
                    plugins
                }),
                handleDOMEvents: {
                    focus: (_view, _event) => {
                        this.mod.editor.currentView = this.view
                    }
                },
                dispatchTransaction: tr => {
                    const remote = tr.getMeta("remote"),
                        fromMain = tr.getMeta("fromMain")
                    // Skip if creating new footnote by typing directly into empty footnote editor.
                    if (
                        tr.docChanged &&
                        tr.steps[0].jsonID === "replace" &&
                        tr.steps[0].from === 0 &&
                        tr.steps[0].to === 0 &&
                        !remote &&
                        !fromMain
                    ) {
                        return
                    }
                    const trackedTr = amendTransaction(
                        tr,
                        this.view.state,
                        this.mod.editor
                    )
                    const {state: newState, transactions} =
                        this.view.state.applyTransaction(trackedTr)
                    this.view.updateState(newState)
                    transactions.forEach(subTr => this.onTransaction(subTr))
                    this.mod.layout.updateDOM()
                }
            }
        )
    }

    // Find out if we need to recalculate the bibliography
    onTransaction(tr) {
        const mainMeta = tr.getMeta("toMain")
        if (tr.getMeta("remote") || (!mainMeta && !tr.docChanged)) {
            return
        }
        const mainTr = this.mod.editor.view.state.tr,
            mainState = this.mod.editor.view.state

        if (tr.docChanged) {
            const fns = [
                ...new Set(
                    tr.steps
                        .map((step, index) => {
                            if (!step.hasOwnProperty("from")) {
                                return -1
                            }
                            // Full insertion or deletion of footnotes mean that the from will be in-between footnotes
                            // and have a depth of zero. We ignore these changes as they will have originated from
                            // the main editor.
                            const $pos = tr.docs[index].resolve(step.from)
                            if ($pos.depth === 0) {
                                return -1
                            }
                            return $pos.index(0)
                        })
                        .filter(index => index > -1)
                )
            ]

            fns.forEach(fnIndex => {
                const fnContent = tr.doc.child(fnIndex).toJSON().content
                updateFootnoteMarker(mainState, mainTr, fnIndex, fnContent)
            })
        }

        if (mainMeta) {
            Object.entries(mainMeta).forEach(([key, value]) => {
                mainTr.setMeta(key, value)
            })
        }
        if (mainMeta || mainTr.docChanged) {
            this.mod.editor.view.dispatch(mainTr)
        }
    }

    applyDiffs(diffs, cid) {
        const steps = diffs.map(j => Step.fromJSON(this.view.state.schema, j))
        const clientIds = diffs.map(_ => cid)
        const tr = receiveTransaction(this.view.state, steps, clientIds)
        tr.setMeta("remote", true)
        this.view.dispatch(tr)
    }

    renderAllFootnotes() {
        const content = getFootnoteMarkerContents(
            this.mod.editor.view.state
        ).map(fnContent => ({
            type: "footnotecontainer",
            content: fnContent
        }))
        const doc = this.schema.nodeFromJSON({type: "doc", content}),
            plugins = this.fnStatePlugins.map(plugin => {
                if (plugin[1]) {
                    return plugin[0](plugin[1](doc))
                } else {
                    return plugin[0]()
                }
            }),
            newState = EditorState.create({
                schema: this.schema,
                doc,
                plugins
            })
        this.view.updateState(newState)
    }

    renderFootnote(content, index = 0, tr) {
        const node = fnNodeToPmNode(content)
        let pos = 0
        for (let i = 0; i < index; i++) {
            pos += tr.doc.child(i).nodeSize
        }
        tr.insert(pos, node)
    }

    removeFootnote(index, tr) {
        if (this.mod.editor.mod.collab.doc.receiving) {
            return
        }

        let startPos = 0
        for (let i = 0; i < index; i++) {
            startPos += this.view.state.doc.child(i).nodeSize
        }
        const endPos = startPos + this.view.state.doc.child(index).nodeSize
        tr.delete(startPos, endPos)
    }
}
