/**
 * Contributor input plugin for ProseMirror editor
 *
 * Manages contributor selection, drop-up menu, and editing dialog
 * Features:
 * - Auto-select contributor nodes when navigating in contributors_part
 * - Show drop-up menu when contributor is selected
 * - Support keyboard navigation for contributors and drop-up menu
 * - Handle contributor addition/editing via dialog
 */
import {NodeSelection, Plugin, PluginKey} from "prosemirror-state"
import {Decoration, DecorationSet} from "prosemirror-view"

import {ContributorDialog} from "../../dialogs"
import {createDropUp} from "./dropup"
import {nextSelection} from "./helpers"
import {ContributorsPartView} from "./node_view"

const key = new PluginKey("contributorInput")

/**
 * Create the contributor input plugin
 * @param {Object} options - Plugin options with editor reference
 * @returns {Plugin} ProseMirror plugin instance
 */
export const contributorInputPlugin = options =>
    new Plugin({
        key,
        state: {
            /**
             * Initialize plugin state
             * @param {Object} _config - Plugin config (unused)
             * @param {Object} state - Initial ProseMirror state
             * @returns {Object} Initial plugin state
             */
            init(_config, state) {
                const decos = DecorationSet.empty
                if (options.editor.docInfo.access_rights === "write") {
                    this.spec.props.nodeViews["contributors_part"] = (
                        node,
                        view,
                        getPos
                    ) => new ContributorsPartView(node, view, getPos)
                }

                // Find all contributors_part nodes in document to track their positions
                const contributorsPartPositions = []
                state.doc.descendants((node, pos) => {
                    if (node.type.name === "contributors_part") {
                        contributorsPartPositions.push({
                            start: pos,
                            end: pos + node.nodeSize
                        })
                    }
                })

                return {contributorsPartPositions, decos}
            },
            /**
             * Apply a transaction to plugin state
             * @param {Transaction} tr - Transaction being applied
             * @param {Object} prev - Previous plugin state
             * @param {Object} oldState - ProseMirror state before transaction
             * @param {Object} state - ProseMirror state after transaction
             * @returns {Object} New plugin state
             */
            apply(tr, prev, _oldState, state) {
                let {decos, contributorsPartPositions} = prev
                // If document was modified, update all positions
                if (tr.docChanged) {
                    contributorsPartPositions = contributorsPartPositions.map(
                        range => ({
                            start: tr.mapping.map(range.start),
                            end: tr.mapping.map(range.end)
                        })
                    )
                    decos = decos.map(tr.mapping, tr.doc)
                }
                if (options.editor.docInfo.access_rights !== "write") {
                    return {
                        contributorsPartPositions,
                        decos
                    }
                }
                if (tr.selectionSet) {
                    // Always remove any existing contributor drop-up before adding a new one
                    // This ensures only one drop-up is ever shown at any time
                    const oldDropUpDeco = decos.find(
                        null,
                        null,
                        spec => spec.id === "contributorDropUp"
                    )
                    if (oldDropUpDeco && oldDropUpDeco.length) {
                        decos = decos.remove(oldDropUpDeco)
                    }

                    if (
                        state.selection.jsonID === "node" &&
                        state.selection.node.type.name === "contributor" &&
                        state.selection.$anchor.node(1).attrs.locking !==
                            "fixed"
                    ) {
                        const dropUpDeco = Decoration.widget(
                            state.selection.from,
                            createDropUp(state.selection, options.editor.view),
                            {
                                side: -1,
                                stopEvent: event => {
                                    // Get drop-up element to check if it exists in DOM
                                    const dropUpEl =
                                        document.querySelector(".drop-up-outer")

                                    if (!dropUpEl) {
                                        // Drop-up not in DOM, let events pass through
                                        return false
                                    }

                                    // Stop mouse events targeting the drop-up
                                    if (
                                        event.type === "mousedown" ||
                                        event.type === "click"
                                    ) {
                                        return event.target.closest(
                                            ".drop-up-outer"
                                        )
                                    }

                                    // Stop keyboard events that should be handled by the drop-up
                                    if (event.type === "keydown") {
                                        // Check if event target is within drop-up or if drop-up has focus
                                        const isTargetInDropUp =
                                            event.target.closest(
                                                ".drop-up-outer"
                                            )
                                        const dropUpHasFocus =
                                            dropUpEl.contains(
                                                document.activeElement
                                            )

                                        // Keys that should be handled by the drop-up
                                        const keysHandled = [
                                            "ArrowDown",
                                            "ArrowUp",
                                            "Enter",
                                            " ",
                                            "Escape",
                                            "Home",
                                            "End"
                                        ]

                                        // Arrow-Right and Arrow-Left should always pass through for contributor navigation
                                        if (
                                            event.key === "ArrowRight" ||
                                            event.key === "ArrowLeft"
                                        ) {
                                            return false
                                        }

                                        // Only stop the event if it's a handled key and either:
                                        // 1. The event target is within the drop-up, or
                                        // 2. The drop-up has focus
                                        if (
                                            keysHandled.includes(event.key) &&
                                            (isTargetInDropUp || dropUpHasFocus)
                                        ) {
                                            return true
                                        }
                                    }
                                    return false
                                },
                                id: "contributorDropUp"
                            }
                        )

                        decos = decos.add(state.doc, [dropUpDeco])
                    }
                }

                return {
                    contributorsPartPositions,
                    decos
                }
            }
        },
        props: {
            nodeViews: {},
            decorations(state) {
                const {decos} = this.getState(state)

                return decos
            },
            /**
             * Handle keyboard events
             * @param {EditorView} view - ProseMirror editor view
             * @param {KeyboardEvent} event - Keyboard event
             * @returns {boolean} True if event was handled
             */
            handleKeyDown(view, event) {
                const isContributorSelected =
                    view.state.selection.node?.type.name === "contributor"
                const dropUpEl = document.querySelector(".drop-up-options")
                const dropUpHasFocus =
                    dropUpEl && dropUpEl.contains(document.activeElement)

                // If drop-up is focused, let it handle all keyboard events
                if (dropUpHasFocus) {
                    return false
                }

                // Arrow-Up on a selected contributor should focus the drop-up menu
                if (event.key === "ArrowUp" && isContributorSelected) {
                    event.preventDefault()
                    if (dropUpEl) {
                        dropUpEl.focus()
                    }
                    return true
                }

                // Space key on a selected contributor opens the dialog (when drop-up not focused)
                if (event.key === " " && isContributorSelected) {
                    const dialog = new ContributorDialog(
                        view.state.selection.$anchor.parent,
                        view,
                        view.state.selection.node.attrs
                    )
                    dialog.init()
                    return true
                }

                // For all other cases, let ProseMirror handle the key
                return false
            }
        },
        /**
         * Append additional transactions based on selection changes
         * Handles auto-selection of contributor nodes when navigating in contributors_part
         * @param {Array<Transaction>} trs - Transactions being applied
         * @param {Object} oldState - State before transactions
         * @param {Object} newState - State after transactions
         * @returns {Transaction|null} Additional transaction to apply
         */
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

            // Check if selection is within any contributors_part node to handle contributor navigation
            const contributorsPartRange =
                pluginState.contributorsPartPositions.find(
                    range =>
                        selectionPos > range.start && selectionPos < range.end
                )

            if (contributorsPartRange) {
                const oldSelectionPos = oldState.selection.from

                if (selectionPos + 1 === contributorsPartRange.end) {
                    // Selection is at end of contributors_part.
                    // Put caret onto contributor add button if write access is present.
                    // Otherwise, move caret beyond contributors_part.
                    if (options.editor.docInfo.access_rights === "write") {
                        // contributor add button will be activated by node view.
                        return
                    }
                    if (oldSelectionPos < selectionPos) {
                        const newSelection = nextSelection(
                            newState,
                            contributorsPartRange.end,
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

                if (selectedNodePos === contributorsPartRange.start) {
                    // selection is at start of contributors node. Find previous possible selection location.
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
                    // Select an entire contributor node
                    return newState.tr.setSelection(
                        NodeSelection.create(newState.doc, selectedNodePos)
                    )
                }
            }

            return null
        }
    })
