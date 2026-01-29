import {Fragment, Slice} from "prosemirror-model"
import {EditorState} from "prosemirror-state"
import {ReplaceStep} from "prosemirror-transform"

export const checkPresenceOfdiffdata = (doc, from, to) => {
    /* This function checks whether diff mark is present inside the given range */
    let diffAttrPresent = false
    if (doc.rangeHasMark(from, to, doc.type.schema.marks.diffdata)) {
        return true
    }
    doc.nodesBetween(from, to, (node, _pos) => {
        if (node.attrs.diffdata && node.attrs.diffdata.length > 0) {
            diffAttrPresent = true
        }
    })
    return diffAttrPresent
}

export const simplifyTransform = tr => {
    /* This splits complex insertion & Deletion steps into simple insertion and deletion
    steps */
    if (tr.docChanged && tr.docs.length > 0) {
        const trState = EditorState.create({doc: tr.docs[0]})
        const newTr = trState.tr
        for (let index = 0; index < tr.steps.length; index++) {
            const step = tr.steps[index]
            if (step instanceof ReplaceStep && step.from !== step.to) {
                const modifiedStep = step.slice.size
                    ? new ReplaceStep(
                          step.to, // We insert all the same steps, but with "from"/"to" both set to "to" in order not to delete content. Mapped as needed.
                          step.to,
                          step.slice,
                          step.structure
                      )
                    : false
                if (modifiedStep) {
                    // If while breaking down any step the step fails , we return the original tr (we just split steps containing both insertions and deletions into simple steps which does just insertion/deletion. should not make a big difference.)
                    if (newTr.maybeStep(modifiedStep).failed) {
                        return tr
                    }
                    if (
                        newTr.maybeStep(
                            new ReplaceStep(
                                step.from,
                                step.to,
                                Slice.empty,
                                step.structure
                            )
                        ).failed
                    ) {
                        return tr
                    }
                } else {
                    if (newTr.maybeStep(step).failed) {
                        return tr
                    }
                }
            } else {
                if (newTr.maybeStep(step).failed) {
                    return tr
                }
            }
        }
        return newTr
    } else {
        return tr
    }
}

export const removeDiffdata = (tr, from, to) => {
    /* Adds steps to a tr to remove all the diff marks in the given range. */
    tr.doc.nodesBetween(from, to, (node, pos) => {
        if (
            pos < from ||
            ["bullet_list", "ordered_list"].includes(node.type.name)
        ) {
            return true
        } else if (node.isInline) {
            return false
        }
        if (node.attrs.diffdata && node.attrs.diffdata.length > 0) {
            tr.setNodeMarkup(
                pos,
                null,
                Object.assign({}, node.attrs, {diffdata: []}),
                node.marks
            )
        }
    })
    tr.removeMark(from, to, tr.doc.type.schema.marks.diffdata)
    return tr
}

export const dispatchRemoveDiffdata = (view, from, to) => {
    const tr = removeDiffdata(view.state.tr, from, to)
    tr.setMeta("initialDiffMap", true).setMeta("mapAppended", true)
    tr.setMeta("notrack", true)
    view.dispatch(tr)
}

export const updateMarkData = (tr, imageDataModified, newTr) => {
    /* Update the range inside the marks and also if we have a image that
    was reuploaded , then while accepting it into the middle editor,
    update its attrs */
    const initialdiffMap = tr.getMeta("initialDiffMap")
    if (!initialdiffMap && (tr.steps.length > 0 || tr.docChanged)) {
        tr.doc.nodesBetween(0, tr.doc.content.size, (node, pos) => {
            if (["bullet_list", "ordered_list"].includes(node.type.name)) {
                return true
            } else if (node.isInline) {
                let diffMark = node.marks.find(
                    mark => mark.type.name == "diffdata"
                )
                if (diffMark !== undefined) {
                    diffMark = diffMark.attrs
                    newTr.removeMark(
                        pos,
                        pos + node.nodeSize,
                        tr.doc.type.schema.marks.diffdata
                    )
                    const from = tr.mapping.map(diffMark.from)
                    const to = tr.mapping.map(diffMark.to, -1)
                    const mark = tr.doc.type.schema.marks.diffdata.create({
                        diff: diffMark.diff,
                        steps: diffMark.steps,
                        from: from,
                        to: to,
                        markOnly: diffMark.markOnly
                    })
                    newTr.addMark(pos, pos + node.nodeSize, mark)
                }
            }
            if (
                node.type.name === "image" &&
                Object.keys(imageDataModified).includes(
                    String(node.attrs.image)
                )
            ) {
                const attrs = Object.assign({}, node.attrs)
                attrs["image"] = imageDataModified[String(node.attrs.image)]
                const nodeType = tr.doc.type.schema.nodes["image"]
                newTr.setNodeMarkup(pos, nodeType, attrs)
            }
            if (node.attrs.diffdata && node.attrs.diffdata.length > 0) {
                const diffdata = node.attrs.diffdata
                diffdata[0].from = tr.mapping.map(diffdata[0].from)
                diffdata[0].to = tr.mapping.map(diffdata[0].to)
                newTr.setNodeMarkup(
                    pos,
                    null,
                    Object.assign({}, node.attrs, {diffdata}),
                    node.marks
                )
            }
        })
    }
    return newTr
}

export const removeDiffFromJson = object => {
    /* Used to convert a document from the merge editor to a doc that complies with the schema of the main editor */
    if (object.attrs && object.attrs.diffdata) {
        delete object.attrs.diffdata
    }
    if (object.marks) {
        object.marks = object.marks.filter(mark => mark.type !== "diffdata")
    }
    if (object.content) {
        object.content.forEach(child => removeDiffFromJson(child))
    }
    return object
}

function mapFragment(fragment, f, parent, mark) {
    const mapped = []
    for (let i = 0; i < fragment.childCount; i++) {
        let child = fragment.child(i)
        if (child.attrs.diffdata) {
            const diffdata = []
            diffdata.push({
                type: mark.attrs.diff,
                from: mark.attrs.from,
                to: mark.attrs.to,
                steps: mark.attrs.steps
            })
            const attrs = Object.assign({}, child.attrs, {diffdata})
            const dummyNode = child.type.create(attrs, null, child.marks)
            child = dummyNode.copy(child.content)
        }
        if (child.content.size) {
            child = child.copy(mapFragment(child.content, f, child, mark))
        }
        if (child.isInline) {
            child = f(child, parent, i)
        }
        mapped.push(child)
    }
    return Fragment.fromArray(mapped)
}

export const addDeletionMarks = (slice, mark) => {
    const content = mapFragment(
        slice.content,
        (node, parent) => {
            if (parent.type && !parent.type.allowsMarkType(mark.type)) {
                return node
            }
            if (node.isInline) {
                return node.mark(mark.addToSet(node.marks))
            }
            return node
        },
        parent,
        mark
    )
    return content
}
