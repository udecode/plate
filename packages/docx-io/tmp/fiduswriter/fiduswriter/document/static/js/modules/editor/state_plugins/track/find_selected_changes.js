import {getFromToMark} from "./helpers"

export function findSelectedChanges(state) {
    const selection = state.selection,
        selectedChanges = {
            insertion: false,
            deletion: false,
            formatChange: false
        }
    let insertionPos = false,
        deletionPos = false,
        formatChangePos = false,
        insertionMark,
        deletionMark,
        formatChangeMark,
        insertionSize,
        deletionSize,
        formatChangeSize

    if (selection.empty) {
        const resolvedPos = state.doc.resolve(selection.from),
            marks = resolvedPos.marks()
        if (marks) {
            insertionMark = marks.find(
                mark => mark.type.name === "insertion" && !mark.attrs.approved
            )
            if (insertionMark) {
                insertionPos = selection.from
            }
            deletionMark = marks.find(mark => mark.type.name === "deletion")
            if (deletionMark) {
                deletionPos = selection.from
            }
            formatChangeMark = marks.find(
                mark => mark.type.name === "format_change"
            )
            if (formatChangeMark) {
                formatChangePos = selection.from
            }
        }
    } else {
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (pos < selection.from) {
                return true
            }
            if (!insertionMark) {
                insertionMark = node.attrs.track
                    ? node.attrs.track.find(
                          trackAttr => trackAttr.type === "insertion"
                      )
                    : node.marks.find(
                          mark =>
                              mark.type.name === "insertion" &&
                              !mark.attrs.approved
                      )
                if (insertionMark) {
                    insertionPos = pos
                    if (!node.isInline) {
                        insertionSize = node.nodeSize
                    }
                }
            }
            if (!deletionMark) {
                deletionMark = node.attrs.track
                    ? node.attrs.track.find(
                          trackAttr => trackAttr.type === "deletion"
                      )
                    : node.marks.find(mark => mark.type.name === "deletion")
                if (deletionMark) {
                    deletionPos = pos
                    if (!node.isInline) {
                        deletionSize = node.nodeSize
                    }
                }
            }
            if (!formatChangeMark) {
                formatChangeMark = node.marks.find(
                    mark => mark.type.name === "format_change"
                )
                if (formatChangeMark) {
                    formatChangePos = pos
                    if (!node.isInline) {
                        formatChangeSize = node.nodeSize
                    }
                }
            }
        })
    }
    if (insertionMark) {
        selectedChanges.insertion = insertionSize
            ? {from: insertionPos, to: insertionPos + insertionSize}
            : getFromToMark(state.doc, insertionPos, insertionMark)
    }

    if (deletionMark) {
        selectedChanges.deletion = deletionSize
            ? {from: deletionPos, to: deletionPos + deletionSize}
            : getFromToMark(state.doc, deletionPos, deletionMark)
    }

    if (formatChangeMark) {
        selectedChanges.formatChange = formatChangeSize
            ? {from: formatChangePos, to: formatChangePos + formatChangeSize}
            : getFromToMark(state.doc, formatChangePos, formatChangeMark)
    }
    return selectedChanges
}
