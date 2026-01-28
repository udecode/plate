import {TextSelection} from "prosemirror-state"

export function setSelection(selectFrom, selectTo) {
    const caretOneRes = window.theApp.page.view.state.doc.resolve(selectFrom)
    const caretTwoRes = window.theApp.page.view.state.doc.resolve(selectTo)
    const selection = new TextSelection(caretOneRes, caretTwoRes)

    window.theApp.page.view.dispatch(
        window.theApp.page.view.state.tr.setSelection(selection)
    )
    window.theApp.page.view.focus()

    return selection
}
