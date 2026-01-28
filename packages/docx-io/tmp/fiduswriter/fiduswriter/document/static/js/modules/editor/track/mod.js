import {findTarget} from "../../common"
import {
    deactivateAllSelectedChanges,
    setSelectedChanges
} from "../state_plugins"

import {accept} from "./accept"
import {acceptAll} from "./accept_all"
import {reject} from "./reject"
import {rejectAll} from "./reject_all"

// Helper functions related to tracked changes
export class ModTrack {
    constructor(editor) {
        editor.mod.track = this
        this.editor = editor
        this.bindEvents()
    }

    bindEvents() {
        // Bind all the click events related to track changes
        document.body.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, ".track-accept", el): {
                    let boxNumber = 0
                    let seekItem = el.target.closest(".margin-box")
                    while (seekItem.previousElementSibling) {
                        boxNumber += 1
                        seekItem = seekItem.previousElementSibling
                    }
                    const box =
                        this.editor.mod.marginboxes.marginBoxes[boxNumber]
                    accept(
                        el.target.dataset.type,
                        box.pos,
                        box.view === "main"
                            ? this.editor.view
                            : this.editor.mod.footnotes.fnEditor.view
                    )
                    // Activate the next margin box with the same number
                    const newBox =
                        this.editor.mod.marginboxes.marginBoxes[boxNumber]
                    if (newBox) {
                        this.editor.mod.track.activateTrack(
                            newBox.view,
                            newBox.type,
                            newBox.pos
                        )
                    }
                    break
                }
                case findTarget(event, ".track-reject", el): {
                    let boxNumber = 0
                    let seekItem = el.target.closest(".margin-box")
                    while (seekItem.previousElementSibling) {
                        boxNumber += 1
                        seekItem = seekItem.previousElementSibling
                    }
                    const box =
                        this.editor.mod.marginboxes.marginBoxes[boxNumber]
                    reject(
                        el.target.dataset.type,
                        box.pos,
                        box.view === "main"
                            ? this.editor.view
                            : this.editor.mod.footnotes.fnEditor.view
                    )
                    // Activate the next margin box with the same number
                    const newBox =
                        this.editor.mod.marginboxes.marginBoxes[boxNumber]
                    if (newBox) {
                        this.editor.mod.track.activateTrack(
                            newBox.view,
                            newBox.type,
                            newBox.pos
                        )
                    }
                    break
                }
                default:
                    break
            }
        })
    }

    activateTrack(viewName, type, pos) {
        this.editor.mod.comments.interactions.deactivateAll()
        const view =
            viewName === "main"
                ? this.editor.view
                : this.editor.mod.footnotes.fnEditor.view
        const otherView =
            viewName === "main"
                ? this.editor.mod.footnotes.fnEditor.view
                : this.editor.view
        // remove all selected changes in other view
        otherView.dispatch(deactivateAllSelectedChanges(otherView.state.tr))
        // activate selected change in relevant view
        const tr = setSelectedChanges(view.state, type, pos)
        if (tr) {
            this.editor.currentView = view
            view.dispatch(tr)
        }
    }

    rejectAll() {
        rejectAll(this.editor.mod.footnotes.fnEditor.view)
        rejectAll(this.editor.view)
    }

    acceptAll() {
        acceptAll(this.editor.mod.footnotes.fnEditor.view)
        acceptAll(this.editor.view)
    }
}
