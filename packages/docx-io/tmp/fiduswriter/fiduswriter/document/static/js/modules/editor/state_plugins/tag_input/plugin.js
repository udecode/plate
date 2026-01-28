import {GapCursor} from "prosemirror-gapcursor"
import {
    NodeSelection,
    Plugin,
    PluginKey,
    TextSelection
} from "prosemirror-state"

import {nextSelection, submitTag} from "./helpers"
import {TagsPartView} from "./node_view"
import {tagInputReferences} from "./tag_editor"

const key = new PluginKey("tagInput")

// Track mouse click state across transactions using closure variable
let mouseClickActive = false
let mouseClickTimer = null
// Track when we've explicitly blurred the tag input to prevent refocus
let tagInputJustBlurred = false

// Export function to check if we should prevent tag input focus
export const shouldPreventTagInputFocus = () => tagInputJustBlurred

export const tagInputPlugin = options =>
    new Plugin({
        key,
        state: {
            init(_config, state) {
                if (options.editor.docInfo.access_rights === "write") {
                    this.spec.props.nodeViews["tags_part"] = (
                        node,
                        view,
                        getPos
                    ) => new TagsPartView(node, view, getPos)
                }

                // Find all tags_part nodes in the document
                const tagsPartPositions = []
                state.doc.descendants((node, pos) => {
                    if (node.type.name === "tags_part") {
                        tagsPartPositions.push({
                            start: pos,
                            end: pos + node.nodeSize
                        })
                    }
                })

                return {tagsPartPositions}
            },
            apply(tr, prev) {
                // If the document was modified, update all positions
                if (tr.docChanged) {
                    const newPositions = prev.tagsPartPositions.map(range => ({
                        start: tr.mapping.map(range.start),
                        end: tr.mapping.map(range.end)
                    }))

                    return {tagsPartPositions: newPositions}
                }
                return prev
            }
        },
        props: {
            nodeViews: {},
            handleDOMEvents: {
                mousedown(view, event) {
                    // Mark that this selection change came from a mouse click
                    // Set the closure variable to indicate a mouse click is happening
                    mouseClickActive = true

                    // Clear any existing timer
                    if (mouseClickTimer) {
                        clearTimeout(mouseClickTimer)
                    }

                    // Reset after a delay to allow all related transactions to process
                    // Including blur handlers and any delayed events
                    mouseClickTimer = setTimeout(() => {
                        mouseClickActive = false
                        mouseClickTimer = null
                    }, 100)

                    // Check if we're clicking outside a focused tag input
                    const activeElement = document.activeElement
                    // Check if active element is inside a tag-input container
                    const tagInputContainer =
                        activeElement?.closest(".tag-input")
                    const clickedInsideTagInput =
                        event.target.closest(".tag-input")
                    // Check if clicking on a tag within the tags_part (but not the tag input)
                    const clickedOnTag =
                        event.target.closest(".tag") ||
                        event.target.closest(".doc-tags_part")

                    // If a tag input has focus and we're clicking outside it (including on existing tags), submit and blur it
                    if (
                        tagInputContainer &&
                        (!clickedInsideTagInput || clickedOnTag)
                    ) {
                        // Get the stored references from WeakMap
                        const refs = tagInputReferences.get(tagInputContainer)
                        if (refs) {
                            const {tagInputView, mainView, getPos} = refs

                            // Submit the tag immediately with the valid position
                            submitTag(tagInputView, mainView, getPos)

                            // If we clicked outside the tags_part entirely, set selection to clicked position
                            // If we clicked on a tag, let the normal click handling select it
                            if (!clickedOnTag) {
                                // Now set the selection based on where the user clicked
                                // We need to do this synchronously before appendTransaction runs
                                const clickPos = view.posAtCoords({
                                    left: event.clientX,
                                    top: event.clientY
                                })
                                if (clickPos) {
                                    const tr = view.state.tr.setSelection(
                                        TextSelection.create(
                                            view.state.doc,
                                            clickPos.pos
                                        )
                                    )
                                    view.dispatch(tr)
                                    view.focus()
                                }
                            } else {
                                // Blur the tag input first, then focus the main view

                                // Set flag to prevent tag input from being refocused
                                tagInputJustBlurred = true

                                // Blur the tag input
                                tagInputView.dom.blur()

                                // Find the position of the clicked tag and select it
                                const clickPos = view.posAtCoords({
                                    left: event.clientX,
                                    top: event.clientY
                                })
                                if (clickPos) {
                                    // Try to create a NodeSelection on the tag
                                    try {
                                        const node = view.state.doc.nodeAt(
                                            clickPos.pos
                                        )
                                        if (node && node.type.name === "tag") {
                                            const tr =
                                                view.state.tr.setSelection(
                                                    NodeSelection.create(
                                                        view.state.doc,
                                                        clickPos.pos
                                                    )
                                                )
                                            view.dispatch(tr)
                                        } else {
                                            // If not directly on a tag, try the position before
                                            const nodeBefore =
                                                view.state.doc.nodeAt(
                                                    clickPos.pos - 1
                                                )
                                            if (
                                                nodeBefore &&
                                                nodeBefore.type.name === "tag"
                                            ) {
                                                const tr =
                                                    view.state.tr.setSelection(
                                                        NodeSelection.create(
                                                            view.state.doc,
                                                            clickPos.pos - 1
                                                        )
                                                    )
                                                view.dispatch(tr)
                                            }
                                        }
                                    } catch {
                                        // Silently ignore selection errors
                                    }
                                }

                                view.focus()

                                // Reset the flag after a short delay
                                setTimeout(() => {
                                    tagInputJustBlurred = false
                                }, 150)
                            }
                        }
                    }

                    return false
                }
            }
        },
        appendTransaction: (trs, oldState, newState) => {
            // If selection is not collapsed or not changed, don't do anything
            if (
                newState.selection.from !== newState.selection.to ||
                !trs.some(tr => tr.selectionSet)
            ) {
                return
            }

            const selectionPos = newState.selection.from
            const pluginState = key.getState(newState)

            // If this selection change came from a mouse click, don't interfere
            if (mouseClickActive) {
                return
            }

            // If selection is already a NodeSelection on a tag, don't interfere
            if (newState.selection instanceof NodeSelection) {
                const selectedNode = newState.selection.node
                if (selectedNode && selectedNode.type.name === "tag") {
                    return
                }
            }

            // Check if selection is within any tags_part node
            const tagsPartRange = pluginState.tagsPartPositions.find(
                range => selectionPos > range.start && selectionPos < range.end
            )

            if (tagsPartRange) {
                const oldSelectionPos = oldState.selection.from

                if (selectionPos + 1 === tagsPartRange.end) {
                    // Selection is at end of tags_part.
                    // Put caret into tag editor if write access is present.
                    // Otherwise, move caret beyond tags_part.
                    if (options.editor.docInfo.access_rights === "write") {
                        // tag editor will be activated by node view.
                        return
                    }
                    if (oldSelectionPos < selectionPos) {
                        const newSelection = nextSelection(
                            newState,
                            tagsPartRange.end,
                            1
                        )
                        if (!newSelection) {
                            // Cannot find a location. Give up.
                            return
                        }

                        return newState.tr.setSelection(newSelection)
                    }
                }

                const selectedNodePos =
                    oldSelectionPos < selectionPos
                        ? selectionPos
                        : selectionPos - 1

                if (selectedNodePos === tagsPartRange.start) {
                    // selection is at start of tags node. Find previous possible selection location.
                    const newSelection = nextSelection(
                        newState,
                        selectedNodePos,
                        -1
                    )
                    if (!newSelection) {
                        // Cannot find a location. Give up.
                        return
                    }
                    return newState.tr.setSelection(newSelection)
                } else {
                    // Select an entire tag node
                    return newState.tr.setSelection(
                        NodeSelection.create(newState.doc, selectedNodePos)
                    )
                }
            }

            return null
        }
    })
