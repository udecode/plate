import {Plugin, PluginKey} from "prosemirror-state"
import {Decoration, DecorationSet} from "prosemirror-view"

import {findSelectedChanges} from "./find_selected_changes"

export const key = new PluginKey("track")
export const selectedInsertionSpec = {}
export const selectedDeletionSpec = {}
export const selectedChangeFormatSpec = {}
export const selectedChangeBlockSpec = {}

export function trackPlugin(options) {
    return new Plugin({
        key,
        state: {
            init(_config, state) {
                // Make sure there are colors for all users who have left marks
                // in the document and that they are registered as past
                // participants for the marginbox filter.
                const users = {}
                users[options.editor.user.id] = options.editor.user.name
                state.doc.descendants(node => {
                    if (node.attrs.track) {
                        node.attrs.track.forEach(track => {
                            if (!users[track.user] && track.user !== 0) {
                                users[track.user] = track.username
                            }
                        })
                    } else {
                        node.marks.forEach(mark => {
                            if (
                                [
                                    "deletion",
                                    "insertion",
                                    "format_change"
                                ].includes(mark.type.name) &&
                                !users[mark.attrs.user] &&
                                mark.attrs.user !== 0
                            ) {
                                users[mark.attrs.user] = mark.attrs.username
                            }
                        })
                    }
                })

                if (options.editor.mod.collab) {
                    Object.entries(users).forEach(([id, userName]) => {
                        const userId = Number.parseInt(id)
                        options.editor.mod.collab.colors.ensureUserColor(userId)
                        if (
                            !options.editor.mod.collab.pastParticipants.find(
                                participant => participant.id === userId
                            )
                        ) {
                            options.editor.mod.collab.pastParticipants.push({
                                id: userId,
                                name: userName
                            })
                        }
                    })
                }

                return {
                    decos: DecorationSet.empty
                }
            },
            apply(tr, _prev, oldState, state) {
                const meta = tr.getMeta(key)
                if (meta) {
                    // There has been an update, return values from meta instead
                    // of previous values
                    return meta
                }

                let {decos} = this.getState(oldState)

                if (tr.selectionSet) {
                    const {insertion, deletion, formatChange} =
                        findSelectedChanges(state)
                    decos = DecorationSet.empty
                    const decoType = tr.selection.node
                        ? Decoration.node
                        : Decoration.inline
                    if (insertion) {
                        decos = decos.add(tr.doc, [
                            decoType(
                                insertion.from,
                                insertion.to,
                                {
                                    class: "selected-insertion"
                                },
                                selectedInsertionSpec
                            )
                        ])
                    }
                    if (deletion) {
                        decos = decos.add(tr.doc, [
                            decoType(
                                deletion.from,
                                deletion.to,
                                {
                                    class: "selected-deletion"
                                },
                                selectedDeletionSpec
                            )
                        ])
                    }
                    if (formatChange) {
                        decos = decos.add(tr.doc, [
                            decoType(
                                formatChange.from,
                                formatChange.to,
                                {
                                    class: "selected-format_change"
                                },
                                selectedChangeFormatSpec
                            )
                        ])
                    }
                } else {
                    decos = decos.map(tr.mapping, tr.doc)
                }
                return {
                    decos
                }
            }
        },
        props: {
            decorations(state) {
                const {decos} = this.getState(state)
                return decos
            },
            handleDOMEvents: {
                focus: (_view, _event) => {
                    options.editor.mod.comments.interactions.deactivateSelectedChanges()
                }
            }
        }
    })
}
