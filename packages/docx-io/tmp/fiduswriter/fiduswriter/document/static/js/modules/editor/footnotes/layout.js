import fastdom from "fastdom"
import {getFootnoteMarkers} from "../state_plugins"

/* A class to make footnotes appear correctly off the side of their referrer. */
export class ModFootnoteLayout {
    constructor(mod) {
        mod.layout = this
        this.mod = mod
    }

    init() {
        // Add two elements to hold dynamic CSS info about comments.
        const styleContainers = document.createElement("temp")
        styleContainers.innerHTML =
            '<style type="text/css" id="footnote-placement-style"></style>'
        while (styleContainers.firstElementChild) {
            document.body.appendChild(styleContainers.firstElementChild)
        }
    }

    updateDOM() {
        // Handle the CSS layout of the footnotes on the screen.
        // DOM write phase - nothing to do.
        fastdom.measure(() => {
            // DOM read phase
            const footnoteBoxes = document.querySelectorAll(
                    "#footnote-box-container .footnote-container"
                ),
                referrers = getFootnoteMarkers(this.mod.editor.view.state)
            if (
                (!referrers.length &&
                    this.mod.editor.mod.citations.citationType !== "note") ||
                referrers.length !== footnoteBoxes.length
            ) {
                // Apparently not all footnote boxes have been drawn or there are none. Abort for now.
                return
            }
            const footnoteBoxContainer = document.getElementById(
                "footnote-box-container"
            )
            let footnotePlacementStyle = ""

            if (getComputedStyle(footnoteBoxContainer).display === "block") {
                // We are in mobile/tablet mode. We don't need to place footnotes.
            } else if (this.mod.editor.mod.citations.citationType === "note") {
                const totalOffset =
                    footnoteBoxContainer.getBoundingClientRect().top
                /* Citations are also in footnotes, so both citation footnotes
                 * and editor footnotes have to be placed. They should be placed
                 * in the order the markers appear in the content, even though
                 * editor footnotes and citations footnotes are separated in the DOM.
                 */
                const citationFootnotes = document.querySelectorAll(
                    "#citation-footnote-box-container .footnote-citation"
                )
                let editorFootnoteIndex = 0,
                    citationFootnoteIndex = 0,
                    totalEditorOffset = totalOffset,
                    totalCitationOffset = totalOffset
                this.mod.editor.view.state.doc.descendants((node, pos) => {
                    if (
                        node.isInline &&
                        (node.type.name === "footnote" ||
                            node.type.name === "citation")
                    ) {
                        let topMargin = 10
                        if (node.type.name === "footnote") {
                            const footnoteBox =
                                    footnoteBoxes[editorFootnoteIndex],
                                selector = `.footnote-container:nth-of-type(${editorFootnoteIndex + 1})`,
                                footnoteBoxCoords =
                                    footnoteBox.getBoundingClientRect(),
                                footnoteBoxHeight = footnoteBoxCoords.height,
                                referrerTop =
                                    this.mod.editor.view.coordsAtPos(pos).top
                            editorFootnoteIndex++
                            if (!referrerTop) {
                                // footnote is not shown. Also hide the footnote from the editor.
                                footnotePlacementStyle += `${selector} {display: none;}\n`
                                return
                            }
                            if (
                                referrerTop > totalEditorOffset ||
                                totalEditorOffset <
                                    totalCitationOffset + topMargin
                            ) {
                                topMargin = Number.parseInt(
                                    Math.max(
                                        referrerTop - totalEditorOffset,
                                        totalCitationOffset -
                                            totalEditorOffset +
                                            topMargin
                                    )
                                )
                                footnotePlacementStyle += `${selector} {margin-top: ${topMargin}px;}\n`
                            }
                            totalEditorOffset += footnoteBoxHeight + topMargin
                        } else {
                            if (
                                citationFootnotes.length > citationFootnoteIndex
                            ) {
                                const footnoteBox =
                                        citationFootnotes[
                                            citationFootnoteIndex
                                        ],
                                    selector =
                                        ".footnote-citation:nth-of-type(" +
                                        (citationFootnoteIndex + 1) +
                                        ")",
                                    footnoteBoxCoords =
                                        footnoteBox.getBoundingClientRect(),
                                    footnoteBoxHeight =
                                        footnoteBoxCoords.height,
                                    referrerTop =
                                        this.mod.editor.view.coordsAtPos(
                                            pos
                                        ).top
                                citationFootnoteIndex++
                                if (!referrerTop) {
                                    // footnote is not shown. Also hide the footnote from the editor.
                                    footnotePlacementStyle += `${selector} {display: none;}\n`
                                    return
                                }
                                if (
                                    referrerTop > totalCitationOffset ||
                                    totalCitationOffset <
                                        totalEditorOffset + topMargin
                                ) {
                                    topMargin = Number.parseInt(
                                        Math.max(
                                            referrerTop - totalCitationOffset,
                                            topMargin +
                                                totalEditorOffset -
                                                totalCitationOffset
                                        )
                                    )
                                    footnotePlacementStyle += `${selector} {margin-top: ${topMargin}px;}\n`
                                }
                                totalCitationOffset +=
                                    footnoteBoxHeight + topMargin
                            }
                        }
                    }
                })
            } else {
                let totalOffset =
                    footnoteBoxContainer.getBoundingClientRect().top
                /* Only editor footnotes (no citation footnotes) need to be layouted.
                 * We use the existing footnote markers referrers to find the
                 * placement.
                 */
                referrers.forEach((referrer, index) => {
                    const footnoteBox = footnoteBoxes[index]

                    const footnoteBoxCoords =
                            footnoteBox.getBoundingClientRect(),
                        footnoteBoxHeight = footnoteBoxCoords.height,
                        referrerTop = this.mod.editor.view.coordsAtPos(
                            referrer.from
                        ).top,
                        selector = `.footnote-container:nth-of-type(${index + 1})`
                    if (!referrerTop) {
                        // footnote is not shown. Also hide the footnote from the editor.
                        footnotePlacementStyle += `${selector} {display: none;}\n`
                        return
                    }
                    let topMargin = 10

                    if (referrerTop > totalOffset) {
                        topMargin = Number.parseInt(referrerTop - totalOffset)
                        footnotePlacementStyle += `${selector} {margin-top: ${topMargin}px;}\n`
                    }
                    totalOffset += footnoteBoxHeight + topMargin
                })
            }

            fastdom.mutate(() => {
                //DOM write phase
                if (
                    document.getElementById("footnote-placement-style")
                        .innerHTML != footnotePlacementStyle
                ) {
                    document.getElementById(
                        "footnote-placement-style"
                    ).innerHTML = footnotePlacementStyle
                }
            })
        })
    }
}
