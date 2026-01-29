import {Plugin, PluginKey} from "prosemirror-state"

const key = new PluginKey("footnoteMarkers")

export const findFootnoteMarkers = (fromPos, toPos, doc) => {
    const footnoteMarkers = []
    doc.nodesBetween(fromPos, toPos, (node, pos) => {
        if (!node.isInline) {
            return
        }
        if (node.type.name === "footnote") {
            const from = pos
            const to = pos + node.nodeSize
            const footnoteMarker = {from, to}
            footnoteMarkers.push(footnoteMarker)
        }
    })
    return footnoteMarkers
}

const getAddedRanges = tr => {
    /* find ranges of the current document that have been added by means of
     * a transaction.
     */
    let ranges = []
    tr.steps.forEach((step, index) => {
        if (step.jsonID === "replace" || step.jsonID === "replaceWrap") {
            ranges.push({from: step.from, to: step.to})
        }
        const map = tr.mapping.maps[index]
        ranges = ranges.map(range => ({
            from: map.map(range.from, -1),
            to: map.map(range.to, 1)
        }))
    })

    const nonOverlappingRanges = []

    ranges.forEach(range => {
        let addedRange = false
        nonOverlappingRanges.forEach(noRange => {
            if (
                !addedRange &&
                range.from <= noRange.from &&
                range.to >= noRange.from
            ) {
                noRange.from = range.from
                noRange.to = noRange.to > range.to ? noRange.to : range.to
                addedRange = true
            } else if (
                !addedRange &&
                range.from <= noRange.to &&
                range.to >= noRange.to
            ) {
                noRange.from =
                    noRange.from < range.from ? noRange.from : range.from
                noRange.to = range.to
                addedRange = true
            }
        })
        if (!addedRange) {
            nonOverlappingRanges.push(range)
        }
    })

    return nonOverlappingRanges
}

export const getFootnoteMarkerContents = state => {
    const fnState = key.getState(state)
    if (!fnState || !fnState.fnMarkers) {
        return []
    }
    const fnMarkers = fnState.fnMarkers
    return fnMarkers.map(
        fnMarker => state.doc.nodeAt(fnMarker.from).attrs.footnote
    )
}

export const updateFootnoteMarker = (state, tr, index, content) => {
    const {fnMarkers} = key.getState(state)

    const footnote = fnMarkers[index]
    const node = state.doc.nodeAt(footnote.from)
    if (node.attrs.footnote === content) {
        return
    }
    tr.setNodeMarkup(footnote.from, node.type, {
        footnote: content
    })
    tr.setMeta("fromFootnote", true)
    return
}

export const getFootnoteMarkers = state => {
    const {fnMarkers} = key.getState(state)
    return fnMarkers
}

export const footnoteMarkersPlugin = options =>
    new Plugin({
        key,
        state: {
            init(_config, state) {
                const fnMarkers = []
                state.doc.descendants((node, pos) => {
                    if (node.type.name === "footnote") {
                        fnMarkers.push({
                            from: pos,
                            to: pos + node.nodeSize
                        })
                    }
                })

                return {
                    fnMarkers
                }
            },
            apply(tr, _prev, oldState, state) {
                const meta = tr.getMeta(key)
                if (meta) {
                    // There has been an update of a footnote marker,
                    // return values from meta instead of previous values
                    // to prevent deletion of decoration
                    return meta
                }

                let {fnMarkers} = this.getState(oldState)

                if (!tr.docChanged) {
                    return {
                        fnMarkers
                    }
                }

                const remote = tr.getMeta("remote"),
                    fromFootnote = tr.getMeta("fromFootnote"),
                    ranges = getAddedRanges(tr),
                    deletedFootnotesIndexes = []
                fnMarkers = fnMarkers
                    .map(marker => ({
                        from: tr.mapping.map(marker.from, 1),
                        to: tr.mapping.map(marker.to, -1)
                    }))
                    .filter((marker, index) => {
                        if (marker.from !== marker.to - 1) {
                            // Add in reverse order as highest numbers need to be deleted
                            // first so that index numbers of lower numbers continue
                            // to be valid when these are deleted. Only relevant when
                            // several footnotes are deleted simultaneously.
                            deletedFootnotesIndexes.unshift(index)
                            return false
                        }
                        return true
                    })
                if (fromFootnote) {
                    return {fnMarkers}
                }
                const footTr =
                    options.editor.mod.footnotes.fnEditor.view.state.tr

                footTr.setMeta("fromMain", true)

                deletedFootnotesIndexes.forEach(index =>
                    options.editor.mod.footnotes.fnEditor.removeFootnote(
                        index,
                        footTr
                    )
                )
                ranges.forEach(range => {
                    let newFootnotes = findFootnoteMarkers(
                        range.from,
                        range.to,
                        tr.doc
                    )
                    if (newFootnotes.length) {
                        const firstFn = newFootnotes[0]
                        let offset = fnMarkers.findIndex(
                            marker => marker.from > firstFn.from
                        )
                        if (offset < 0) {
                            offset = fnMarkers.length
                        }
                        if (remote) {
                            newFootnotes = newFootnotes.filter(
                                // In case of remote trasnactions, we cannot mark them as coming from footnote, so we
                                // will need to remove duplicates instead.
                                newMarker =>
                                    fnMarkers.find(
                                        oldMarker =>
                                            oldMarker.from === newMarker.from
                                    )
                                        ? false
                                        : true
                            )
                        } else {
                            newFootnotes.forEach((footnote, index) => {
                                const fnContent = state.doc.nodeAt(
                                    footnote.from
                                ).attrs.footnote
                                options.editor.mod.footnotes.fnEditor.renderFootnote(
                                    fnContent,
                                    offset + index,
                                    footTr
                                )
                            })
                        }
                        fnMarkers = fnMarkers
                            .concat(newFootnotes)
                            .sort((a, b) => (a.from > b.from ? 1 : -1))
                    }
                })

                const footMeta = tr.getMeta("toFoot")

                if (footMeta) {
                    Object.entries(footMeta).forEach(([key, value]) => {
                        footTr.setMeta(key, value)
                    })
                }

                if (footTr.docChanged || footMeta) {
                    tr.setMeta("footTr", footTr)
                }

                return {
                    fnMarkers
                }
            }
        },
        view(_editorView) {
            return {
                update: (_view, _prevState) => {
                    options.editor.mod.footnotes.layout.updateDOM()
                }
            }
        }
    })
