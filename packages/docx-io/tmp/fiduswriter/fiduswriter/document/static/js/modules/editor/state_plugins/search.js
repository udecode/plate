import {Plugin, PluginKey} from "prosemirror-state"
import {Decoration, DecorationSet} from "prosemirror-view"

const key = new PluginKey("search")

function findMatches(doc, term) {
    let stringObj = false,
        matches = []

    if (!term.length) {
        return matches
    }

    doc.descendants((node, pos, parent) => {
        if (
            !node.isInline ||
            node.marks.find(mark => mark.type.name === "deletion")
        ) {
            return
        }
        if (stringObj && (parent !== stringObj.parent || !node.isText)) {
            matches = matches.concat(findTerm(term, stringObj))
            stringObj = false
        }

        if (node.isText) {
            if (!stringObj) {
                stringObj = {parent, pos: [], text: ""}
            }
            stringObj.text += node.text
            stringObj.pos.push([pos, pos + node.text.length])
        }
    })
    if (stringObj) {
        matches = matches.concat(findTerm(term, stringObj))
    }
    return matches
}

// Find search term within stringObjects (strings that consist of several text nodes that hang together)
function findTerm(term, stringObj) {
    const matches = []
    let index = 0,
        foundIndex
    while ((foundIndex = stringObj.text.indexOf(term, index)) !== -1) {
        index = foundIndex + term.length

        matches.push({
            from: transPos(foundIndex, stringObj.pos),
            to: transPos(foundIndex + term.length, stringObj.pos)
        })
    }
    return matches
}

// Translate the start and end position of the serach term within the strings to document positions
function transPos(index, pos) {
    let findIndex = index,
        posIndex = 0
    while (findIndex > pos[posIndex][1] - pos[posIndex][0]) {
        findIndex -= pos[posIndex][1] - pos[posIndex][0]
        posIndex++
    }
    return pos[posIndex][0] + findIndex
}

function matchesToDecos(doc, matches, selected) {
    if (!matches.length) {
        return DecorationSet.empty
    }
    const decorations = matches.map((match, index) => {
        return Decoration.inline(match.from, match.to, {
            class: `search${index === selected ? " selected" : ""}`
        })
    })
    return DecorationSet.create(doc, decorations)
}

export const setSearchTerm = (
    state,
    term,
    selected = false,
    listener = false
) => {
    const matches = findMatches(state.doc, term),
        decos = matchesToDecos(state.doc, matches, selected)

    selected =
        selected !== false && matches.length > selected
            ? selected
            : matches.length
              ? matches.length - 1
              : false

    const tr = state.tr.setMeta(key, {
        term,
        decos,
        matches,
        selected,
        listener
    })

    return {tr, matches, selected}
}

export const endSearch = state =>
    state.tr.setMeta(key, {
        term: "",
        decos: DecorationSet.empty,
        matches: [],
        selected: 0,
        listener: false
    })

export const selectNextSearchMatch = state => {
    const pluginState = key.getState(state),
        {term, matches, listener} = pluginState
    let {selected} = pluginState

    if (selected === false) {
        selected = matches.length
    }
    if (selected < matches.length - 1) {
        selected++
    } else {
        selected = 0
    }
    const decos = matchesToDecos(state.doc, matches, selected)
    return state.tr.setMeta(key, {
        term,
        decos,
        matches,
        selected,
        listener
    })
}

export const selectPreviousSearchMatch = state => {
    const pluginState = key.getState(state),
        {term, matches, listener} = pluginState
    let {selected} = pluginState

    if (selected === false) {
        selected = 0
    }
    if (selected > 0) {
        selected--
    } else {
        selected = matches.length - 1
    }
    const decos = matchesToDecos(state.doc, matches, selected)
    return state.tr.setMeta(key, {
        term,
        decos,
        matches,
        selected,
        listener
    })
}

export const deselectSearchMatch = state => {
    const {term, matches, listener} = key.getState(state),
        selected = false,
        decos = matchesToDecos(state.doc, matches, selected)
    return state.tr.setMeta(key, {
        term,
        decos,
        matches,
        selected,
        listener
    })
}

export const getSearchMatches = state => {
    const {matches, selected} = key.getState(state)
    return {matches, selected}
}

export const searchPlugin = _options =>
    new Plugin({
        key,
        state: {
            init() {
                return {
                    term: "",
                    decos: DecorationSet.empty,
                    matches: [],
                    selected: 0,
                    listener: false
                }
            },
            apply(tr, _prev, oldState, state) {
                const meta = tr.getMeta(key)
                if (meta) {
                    // There has been an update, return values from meta instead
                    // of previous values
                    return meta
                }

                const pluginState = this.getState(oldState),
                    {term, listener} = pluginState
                let {matches, decos, selected} = pluginState

                if (term === "" || !tr.docChanged) {
                    return {
                        term,
                        decos, // empty if term === ''
                        matches, // empty if term === ''
                        selected, // 0 if term === ''
                        listener // false is dialog not open
                    }
                }

                // The document is changing while the search window is open. We redo the search for the entire doc.
                // TODO: Optimize for speed by only recalculating the part of the doc that was changed.
                matches = findMatches(state.doc, term)
                if (selected !== false && selected >= matches.length) {
                    if (matches.length) {
                        selected = matches.length - 1
                    } else {
                        selected = false
                    }
                }
                decos = matchesToDecos(state.doc, matches, selected)

                return {
                    term,
                    decos,
                    matches,
                    selected,
                    listener
                }
            }
        },
        props: {
            decorations(state) {
                const {decos} = this.getState(state)
                return decos
            }
        },
        view(_editorState) {
            return {
                update: (view, _prevState) => {
                    const {listener} = key.getState(view.state)
                    if (listener) {
                        listener.onUpdate()
                    }
                }
            }
        }
    })
