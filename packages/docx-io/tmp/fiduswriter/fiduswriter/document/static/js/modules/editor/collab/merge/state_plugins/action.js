import {TextSelection} from "prosemirror-state"
import {AddMarkStep, Mapping, RemoveMarkStep, Step} from "prosemirror-transform"
import {showSystemMessage} from "../../../../common"
import {dispatchRemoveDiffdata} from "../tools"

export const copyChange = (view, from, to) => {
    /* when a certain change cannot be applied automatically,
    we give users the ability to copy a change */
    const tr = view.state.tr
    const resolvedFrom = view.state.doc.resolve(from)
    const resolvedTo = view.state.doc.resolve(to)
    const sel = new TextSelection(resolvedFrom, resolvedTo)
    sel.visible = false
    tr.setSelection(sel)
    view.dispatch(tr)
    view.focus()

    const slice = view.state.selection.content()
    const {dom} = view.serializeForClipboard(slice)

    // Copy data to clipboard!!
    document.body.appendChild(dom)
    const range = document.createRange()
    range.selectNode(dom)
    window.getSelection().addRange(range)
    try {
        document.execCommand("copy") // Security exception may be thrown by some browsers.
        document.body.removeChild(dom)
        showSystemMessage(gettext("Change copied to clipboard."))
    } catch (_ex) {
        showSystemMessage(
            gettext("Copy to clipboard failed. Please copy manually.")
        )
    }
    window.getSelection().removeAllRanges()
}

export const acceptChanges = (merge, mark, mergeView, originalView, tr) => {
    /* This is used to accept a change either from the offline/online version or
    incase of deletion from the middle editor */
    const mergedDocMap = new Mapping()
    mergedDocMap.appendMapping(merge.mergedDocMap)
    const insertionTr = mergeView.state.tr
    const from = mark.attrs.from
    const to = mark.attrs.to
    const steps = JSON.parse(mark.attrs.steps)
    const stepMaps = tr.mapping.maps
        .slice()
        .reverse()
        .map(map => map.invert())
    const rebasedMapping = new Mapping(stepMaps)
    rebasedMapping.appendMapping(mergedDocMap)
    for (const stepIndex of steps) {
        const maps = rebasedMapping.slice(tr.steps.length - stepIndex)
        let mappedStep = tr.steps[stepIndex].map(maps)
        if (mappedStep) {
            mappedStep = Step.fromJSON(
                // Switch from main editor schema to merge editor schema
                insertionTr.doc.type.schema,
                mappedStep.toJSON()
            )
        }
        if (mappedStep && !insertionTr.maybeStep(mappedStep).failed) {
            mergedDocMap.appendMap(mappedStep.getMap())
            rebasedMapping.appendMap(mappedStep.getMap())
            rebasedMapping.setMirror(
                tr.steps.length - stepIndex - 1,
                tr.steps.length + mergedDocMap.maps.length - 1
            )
        }
    }
    // Make sure that all the content steps are present in the new transaction
    if (insertionTr.steps.length < steps.length) {
        showSystemMessage(
            gettext(
                "The change could not be applied automatically. Please consider using the copy option to copy the changes."
            )
        )
    } else {
        dispatchRemoveDiffdata(originalView, from, to)
        merge.mergedDocMap = mergedDocMap
        insertionTr.setMeta("mapAppended", true)
        insertionTr.setMeta("notrack", true)
        mergeView.dispatch(insertionTr)
    }
}

export const removeDecoration = (view, decorationId) => {
    const tr = view.state.tr
    tr.setMeta("decorationId", decorationId)
    view.dispatch(tr)
}

export const deleteContent = (merge, view, diffMark, mappingNeeded = true) => {
    // const originalOnlineMapping = merge.onlineTr.mapping
    const rebasedMapping = new Mapping()
    const tr = view.state.tr
    if (mappingNeeded) {
        rebasedMapping.appendMapping(merge.mergedDocMap)
    }
    const rebasedFrom = rebasedMapping.map(diffMark.attrs.from),
        rebasedTo = rebasedMapping.map(diffMark.attrs.to)
    if (rebasedFrom && rebasedTo) {
        tr.delete(rebasedFrom, rebasedTo)
        merge.mergedDocMap.appendMapping(tr.mapping)
        tr.setMeta("mapAppended", true)
        tr.setMeta("notrack", true)
        view.dispatch(tr)
        return true
    }
    showSystemMessage(
        gettext(
            "The change could not be applied automatically. Please consider using the copy option to copy the changes."
        )
    )
    return false
}

export const addDeletedContentBack = (merge, view, diffMark) => {
    const commonDoc = merge.cpDoc
    const tr = view.state.tr
    const slice = commonDoc.slice(diffMark.attrs.from, diffMark.attrs.to)
    const rebasedMapping = new Mapping()
    rebasedMapping.appendMapping(merge.mergedDocMap)
    const insertionPoint = rebasedMapping.map(diffMark.attrs.from)
    if (insertionPoint) {
        tr.insert(insertionPoint, slice.content)
        tr.setMeta("mapAppended", true)
        tr.setMeta("notrack", true)
        view.dispatch(tr)
        merge.mergedDocMap.appendMapping(tr.mapping)
        return true
    }
    showSystemMessage(
        gettext(
            "The change could not be applied automatically. Please consider using the copy option to copy the changes."
        )
    )
    return false
}

export const handleMarks = (view, mark, tr, schema) => {
    // This function is used to remove the marks that have been applied in the online editor
    const newTr = view.state.tr
    const steps = JSON.parse(mark.attrs.steps)
    const marksToBeRemoved = [],
        marksToBeAdded = []
    steps.forEach(index => {
        const JSONStep = tr.steps[index].toJSON()
        if (JSONStep.mark && JSONStep.mark.type) {
            if (tr.steps[index] instanceof AddMarkStep) {
                marksToBeRemoved.push(JSONStep.mark.type)
            } else if (tr.steps[index] instanceof RemoveMarkStep) {
                marksToBeAdded.push(tr.steps[index].mark)
            }
        }
    })
    marksToBeRemoved.forEach(removalMark =>
        newTr.removeMark(
            mark.attrs.from,
            mark.attrs.to,
            schema.marks[removalMark]
        )
    )
    marksToBeAdded.forEach(AddMark =>
        newTr.addMark(mark.attrs.from, mark.attrs.to, AddMark)
    )
    newTr.setMeta("notrack", true)
    newTr.setMeta("mapAppended", true)
    view.dispatch(newTr)
}
