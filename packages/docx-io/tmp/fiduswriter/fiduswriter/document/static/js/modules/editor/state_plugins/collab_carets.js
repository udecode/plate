import {sendableSteps} from "prosemirror-collab"
import {Plugin, PluginKey} from "prosemirror-state"
import {Decoration, DecorationSet} from "prosemirror-view"

const key = new PluginKey("collabCarets")

export const getSelectionUpdate = state => {
    const {caretUpdate} = key.getState(state)
    return caretUpdate
}

export const updateCollaboratorSelection = (state, collaborator, data) => {
    let {decos, caretPositions} = key.getState(state)

    const oldCarPos = caretPositions.find(
        carPos => carPos.sessionId === data.session_id
    )

    if (oldCarPos) {
        caretPositions = caretPositions.filter(carPos => carPos !== oldCarPos)
        const removeDecos = decos
            .find()
            .filter(deco => deco.spec === oldCarPos.decoSpec)
        decos = decos.remove(removeDecos)
    }

    const widgetDom = document.createElement("div")
    const className = `user-${collaborator.id}`
    widgetDom.classList.add("caret")
    widgetDom.classList.add(className)
    widgetDom.innerHTML = '<div class="caret-head"></div>'
    widgetDom.firstChild.classList.add(className)
    const tooltip = collaborator.name
    widgetDom.title = tooltip
    widgetDom.firstChild.title = tooltip
    const decoSpec = {id: data.session_id} // We will compare the decoSpec object. Id not really needed.
    const newCarPos = {
        sessionId: data.session_id,
        userId: collaborator.id,
        decoSpec,
        anchor: data.anchor,
        head: data.head
    }
    caretPositions.push(newCarPos)

    const widgetDeco = Decoration.widget(data.head, widgetDom, decoSpec),
        addDecos = [widgetDeco]

    if (data.anchor !== data.head) {
        const from = data.head > data.anchor ? data.anchor : data.head,
            to = data.anchor > data.head ? data.anchor : data.head,
            inlineDeco = Decoration.inline(
                from,
                to,
                {
                    class: `user-bg-${collaborator.id}`
                },
                decoSpec
            )
        addDecos.push(inlineDeco)
    }
    decos = decos.add(state.doc, addDecos)

    const tr = state.tr.setMeta(key, {
        decos,
        caretPositions,
        caretUpdate: false
    })
    return tr
}

export const removeCollaboratorSelection = (state, data) => {
    let {decos, caretPositions} = key.getState(state)

    const caretPosition = caretPositions.find(
        carPos => carPos.sessionId === data.session_id
    )

    if (caretPosition) {
        caretPositions = caretPositions.filter(
            carPos => carPos !== caretPosition
        )
        const removeDecos = decos
            .find()
            .filter(deco => deco.spec === caretPosition.decoSpec)
        decos = decos.remove(removeDecos)
        const tr = state.tr.setMeta(key, {
            decos,
            caretPositions,
            caretUpdate: false
        })
        return tr
    }
    return false
}

export const collabCaretsPlugin = options =>
    new Plugin({
        key,
        state: {
            init() {
                return {
                    caretPositions: [],
                    decos: DecorationSet.empty,
                    caretUpdate: false
                }
            },
            apply(tr, _prev, oldState, state) {
                const meta = tr.getMeta(key)
                if (meta) {
                    // There has been an update, return values from meta instead
                    // of previous values
                    return meta
                }
                let {decos, caretPositions} = this.getState(oldState),
                    caretUpdate = false

                decos = decos.map(tr.mapping, tr.doc, {
                    onRemove: decoSpec => {
                        caretPositions = caretPositions.filter(
                            carPos => carPos.decoSpec !== decoSpec
                        )
                    }
                })

                if (
                    tr.selectionSet &&
                    !sendableSteps(state) &&
                    !["review", "review-tracked"].includes(
                        options.editor.docInfo.access_rights
                    )
                ) {
                    caretUpdate = {
                        anchor: tr.selection.anchor,
                        head: tr.selection.head
                    }
                }

                return {
                    decos,
                    caretPositions,
                    caretUpdate
                }
            }
        },
        props: {
            decorations(state) {
                const {decos} = this.getState(state)
                return decos
            }
        }
    })
