import {DiffDOM, stringToObj} from "diff-dom"
import fastdom from "fastdom"

import {cancelPromise, findTarget} from "../../common"
import {
    getCommentDuringCreationDecoration,
    getFootnoteMarkers,
    getSelectedChanges
} from "../state_plugins"
import {
    marginBoxOptions,
    marginBoxesTemplate,
    marginboxFilterTemplate
} from "./templates"

/* Functions related to layouting of comments */
export class ModMarginboxes {
    constructor(editor) {
        editor.mod.marginboxes = this
        this.editor = editor
        this.activeCommentStyle = ""
        this.filterOptions = {
            track: true,
            comments: true,
            info: true,
            help: true,
            warning: true,
            commentsResolved: false,
            author: 0,
            assigned: 0
        }
        this.commentColors = {
            isMajor: "#f4c9d9",
            marker: "#f9f9f9",
            active: "#fffacf"
        }
        this.dd = new DiffDOM({
            valueDiffing: false
        })
        this.marginBoxesContainerString =
            '<div id="margin-box-container"><div></div></div>'
        this.marginBoxesContainerObj = stringToObj(
            this.marginBoxesContainerString
        )
        this.marginBoxesPlacementStyle = ""
        this.marginBoxes = []
    }

    init() {
        // Add two elements to hold dynamic CSS info about comments.
        document.body.insertAdjacentHTML(
            "beforeend",
            '<style type="text/css" id="active-comment-style"></style><style type="text/css" id="track-options-style"></style><style type="text/css" id="margin-box-placement-style"></style>'
        )
        this.marginBoxesContainer = document.getElementById(
            "margin-box-container"
        )
        this.activeCommentStyleElement = document.getElementById(
            "active-comment-style"
        )
        this.trackOptionsStyleElement = document.getElementById(
            "track-options-style"
        )
        this.bindEvents()
    }

    bindEvents() {
        // Bind all the click events related to the margin box filter
        document.body.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, ".margin-box-filter-check", el):
                    // do not react to clicks on checkboxes within sub menus
                    break
                case findTarget(
                    event,
                    ".margin-box-filter-comments-author",
                    el
                ):
                    this.filterOptions.commentsAuthor = Number.parseInt(
                        el.target.dataset.id
                    )
                    this.view(this.editor.currentView)
                    break
                case findTarget(
                    event,
                    ".margin-box-filter-comments-assigned",
                    el
                ):
                    this.filterOptions.assigned = Number.parseInt(
                        el.target.dataset.id
                    )
                    this.view(this.editor.currentView)
                    break
                case findTarget(event, ".show-marginbox-options-submenu", el):
                    this.closeAllMenus(".marginbox-options-submenu.fw-open")
                    Array.from(el.target.parentElement.children)
                        .find(node =>
                            node.matches(".marginbox-options-submenu")
                        )
                        .classList.add("fw-open")
                    break
                case findTarget(event, ".show-marginbox-options", el):
                    this.closeAllMenus()
                    if (
                        el.target.parentElement.classList.contains(
                            "margin-box-filter-button"
                        )
                    ) {
                        Array.from(el.target.parentElement.children)
                            .find(node => node.matches(".marginbox-options"))
                            .classList.add("fw-open")
                    } else {
                        let resolved = false
                        if (el.target.parentElement?.parentElement) {
                            resolved =
                                el.target.parentElement.parentElement.classList.contains(
                                    "resolved"
                                )
                        }
                        const user = this.editor.user
                        const docInfo = this.editor.docInfo
                        const elData = el.target.dataset
                        const comment = {
                            answer: elData.hasOwnProperty("answer"),
                            id: elData.id,
                            commentId: elData.commentid,
                            user: Number(elData.commentuser),
                            resolved: resolved
                        }
                        document.body.insertAdjacentHTML(
                            "beforeend",
                            marginBoxOptions(comment, user, docInfo)
                        )
                        const marginboxOptions = document.body.querySelector(
                            ".comment-answer-options.marginbox-options"
                        )
                        marginboxOptions.classList.add("fw-open")
                        this.positionMarginBoxOptions(
                            marginboxOptions,
                            el.target
                        )
                    }
                    break
                case findTarget(event, ".margin-box-filter-track-author", el):
                    this.filterOptions.trackAuthor = Number.parseInt(
                        el.target.dataset.id
                    )
                    this.setTrackStyle()
                    this.view(this.editor.currentView)
                    break
                case findTarget(event, "#margin-box-filter-track", el):
                    this.filterOptions.track = !this.filterOptions.track
                    this.setTrackStyle()
                    this.view(this.editor.currentView)
                    break
                case findTarget(event, "#margin-box-filter-comments", el):
                    this.filterOptions.comments = !this.filterOptions.comments
                    this.view(this.editor.currentView)
                    break
                case findTarget(event, "#margin-box-filter-info", el):
                    this.filterOptions.info = !this.filterOptions.info
                    this.view(this.editor.currentView)
                    break
                case findTarget(event, ".margin-box.comment.inactive", el):
                    this.editor.mod.comments.interactions.deactivateSelectedChanges()
                    this.editor.mod.comments.interactions.activateComment(
                        el.target.dataset.id
                    )
                    break
                case findTarget(event, ".margin-box.track.inactive", el): {
                    let boxNumber = 0
                    let seekItem = el.target
                    while (seekItem.previousElementSibling) {
                        boxNumber += 1
                        seekItem = seekItem.previousElementSibling
                    }
                    const box = this.marginBoxes[boxNumber]
                    this.editor.mod.track.activateTrack(
                        box.view,
                        box.type,
                        box.pos
                    )
                    break
                }
                case findTarget(
                    event,
                    ".margin-box.comment.active .show-more-less",
                    el
                ):
                    this.toggleShowMore(el)
                    break
                default:
                    this.closeAllMenus()
                    this.closeAllLongComments()
                    break
            }
        })

        document.body.addEventListener(
            "change",
            evt => {
                switch (evt.target.id) {
                    case "margin-box-filter-comments-resolved":
                        this.filterOptions.commentsResolved = evt.target.checked
                        this.view(this.editor.currentView)
                        break

                    case "margin-box-filter-comments-only-major":
                        this.filterOptions.commentsOnlyMajor =
                            evt.target.checked
                        this.view(this.editor.currentView)
                        break

                    case "margin-box-filter-info-help":
                        this.filterOptions.help = evt.target.checked
                        this.view(this.editor.currentView)
                        break

                    case "margin-box-filter-info-warning":
                        this.filterOptions.warning = evt.target.checked
                        this.view(this.editor.currentView)
                        break
                }
            },
            false
        )

        setTimeout(this.commentOptionsOnScroll, 100)
    }

    closeAllMenus(
        selector = ".marginbox-options-submenu.fw-open, .marginbox-options.fw-open"
    ) {
        document.querySelectorAll(selector).forEach(el => {
            if (el.classList.contains("comment-answer-options")) {
                el.parentElement.removeChild(el)
            } else {
                el.classList.remove("fw-open")
            }
        })
    }

    view(view) {
        // Give up if the user is currently editing a comment.
        if (this.editor.mod.comments.interactions.isCurrentlyEditing()) {
            return false
        }
        this.editor.mod.comments.interactions.activateSelectedComment(view)
    }

    updateDOM() {
        // Handle the layout of the comments on the screen.
        // DOM write phase

        const marginBoxes = [],
            referrers = [],
            selectedChanges = getSelectedChanges(this.editor.currentView.state)
        let fnIndex = 0,
            fnPosCount = 0,
            lastNodeTracks = [],
            lastNode = this.editor.view.state.doc

        this.activeCommentStyle = ""
        this.editor.view.state.doc.descendants((node, pos) => {
            if (node.attrs.hidden) {
                return false
            }
            lastNodeTracks = this.getMarginBoxes(
                node,
                pos,
                pos,
                lastNode,
                lastNodeTracks,
                "main",
                marginBoxes,
                referrers,
                selectedChanges,
                this.editor.view.state.selection
            )
            lastNode = node

            if (node.type.name === "footnote") {
                let lastFnNode =
                        this.editor.mod.footnotes.fnEditor.view.state.doc,
                    lastFnNodeTracks = []
                const footnote =
                    lastFnNode.childCount > fnIndex
                        ? lastFnNode.child(fnIndex)
                        : false
                if (!footnote) {
                    return
                }
                this.editor.mod.footnotes.fnEditor.view.state.doc.nodesBetween(
                    fnPosCount,
                    fnPosCount + footnote.nodeSize,
                    (fnNode, fnPos) => {
                        if (fnPos < fnPosCount) {
                            return false
                        }
                        lastFnNodeTracks = this.getMarginBoxes(
                            fnNode,
                            fnPos,
                            pos,
                            lastFnNode,
                            lastFnNodeTracks,
                            "footnote",
                            marginBoxes,
                            referrers,
                            selectedChanges,
                            this.editor.view.state.selection
                        )
                        lastFnNode = fnNode
                    }
                )
                fnIndex++
                fnPosCount += footnote.nodeSize
            }
        })

        // Add a comment that is currently under construction to the list.
        if (this.editor.mod.comments.store.commentDuringCreation) {
            const deco = getCommentDuringCreationDecoration(
                this.editor.view.state
            )
            let pos, view
            if (deco) {
                pos = deco.from
                view = "main"
            } else {
                const fnDeco = getCommentDuringCreationDecoration(
                    this.editor.mod.footnotes.fnEditor.view.state
                )
                if (fnDeco) {
                    pos = this.fnPosToPos(fnDeco.from)
                    view = "footnote"
                }
            }
            if (pos) {
                const comment =
                    this.editor.mod.comments.store.commentDuringCreation.comment
                let index = 0
                // // We need the position of the new comment in relation to the other
                // // comments in order to insert it in the right place
                while (referrers.length > index && referrers[index] < pos) {
                    index++
                }
                marginBoxes.splice(index, 0, {
                    type: "comment",
                    data: comment,
                    view,
                    pos,
                    active: true
                })
                referrers.splice(index, 0, pos)
                this.activeCommentStyle +=
                    ".active-comment, .active-comment .comment {background-color: #fffacf !important;}"
            }
        }

        const marginBoxesHTML = marginBoxesTemplate({
            marginBoxes,
            user: this.editor.user,
            docInfo: this.editor.docInfo,
            editComment: this.editor.mod.comments.interactions.editComment,
            activeCommentAnswerId:
                this.editor.mod.comments.interactions.activeCommentAnswerId,
            filterOptions: this.filterOptions
        })

        this.marginBoxes = marginBoxes

        if (this.marginBoxesContainerString !== marginBoxesHTML) {
            const newMarginBoxesContainerObj = stringToObj(marginBoxesHTML)
            const diff = this.dd.diff(
                this.marginBoxesContainerObj,
                newMarginBoxesContainerObj
            )
            this.dd.apply(this.marginBoxesContainer, diff)
            this.marginBoxesContainerString = marginBoxesHTML
            this.marginBoxesContainerObj = newMarginBoxesContainerObj
        }

        if (
            this.activeCommentStyleElement.innerHTML != this.activeCommentStyle
        ) {
            this.activeCommentStyleElement.innerHTML = this.activeCommentStyle
        }

        const marginBoxFilterHTML = marginboxFilterTemplate({
            marginBoxes,
            filterOptions: this.filterOptions,
            pastParticipants: this.editor.mod.collab.pastParticipants
        })

        const marginBoxFilterElement =
            document.getElementById("margin-box-filter")

        if (!marginBoxFilterElement) {
            // User has navigated away already.
            return cancelPromise()
        }

        if (marginBoxFilterElement.innerHTML != marginBoxFilterHTML) {
            marginBoxFilterElement.innerHTML = marginBoxFilterHTML
        }

        return new Promise(resolve => {
            fastdom.measure(() => {
                // DOM read phase
                let marginBoxesPlacementStyle = ""
                if (
                    getComputedStyle(marginBoxFilterElement).position ===
                    "fixed"
                ) {
                    // We are in mobile/tablet mode. We don't need to place margin boxes.
                } else {
                    const marginBoxesDOM = document.querySelectorAll(
                        "#margin-box-container .margin-box"
                    )
                    if (
                        marginBoxesDOM.length !== referrers.length ||
                        !marginBoxesDOM.length
                    ) {
                        // Number of comment boxes and referrers differ.
                        // This isn't right. Abort.
                        resolve()
                        return
                    }
                    const bodyTop = document.body.getBoundingClientRect().top,
                        marginBoxPlacements = Array.from(marginBoxesDOM).map(
                            (mboxDOM, index) => {
                                const mboxDOMRect =
                                    mboxDOM.getBoundingClientRect()
                                return {
                                    height: mboxDOMRect.height,
                                    refPos:
                                        this.editor.view.coordsAtPos(
                                            referrers[index]
                                        ).top - bodyTop
                                }
                            }
                        ),
                        firstActiveIndex = marginBoxes.findIndex(
                            mBox => mBox.active
                        ),
                        firstActiveMboxPlacement =
                            marginBoxPlacements[firstActiveIndex]

                    let activeIndex = firstActiveIndex,
                        currentPos = 0
                    while (activeIndex > -1) {
                        const mboxPlacement = marginBoxPlacements[activeIndex]
                        if (mboxPlacement.height === 0) {
                            mboxPlacement.pos = currentPos
                        } else if (mboxPlacement === firstActiveMboxPlacement) {
                            mboxPlacement.pos = mboxPlacement.refPos
                        } else {
                            mboxPlacement.pos = Math.min(
                                currentPos - 2 - mboxPlacement.height,
                                mboxPlacement.refPos
                            )
                        }
                        currentPos = mboxPlacement.pos
                        activeIndex--
                    }
                    if (firstActiveIndex > -1) {
                        currentPos =
                            firstActiveMboxPlacement.pos +
                            firstActiveMboxPlacement.height
                        activeIndex = firstActiveIndex + 1
                    } else {
                        activeIndex = 0
                    }

                    while (activeIndex < marginBoxPlacements.length) {
                        const mboxPlacement = marginBoxPlacements[activeIndex]
                        mboxPlacement.pos = Math.max(
                            currentPos + 2,
                            mboxPlacement.refPos
                        )
                        currentPos = mboxPlacement.pos + mboxPlacement.height
                        activeIndex++
                    }

                    const initialOffset = document.body.classList.contains(
                        "header-closed"
                    )
                        ? 72 + 90
                        : 225 + 90
                    let totalOffset = 0

                    marginBoxesPlacementStyle = marginBoxPlacements
                        .map((mboxPlacement, index) => {
                            if (mboxPlacement.height === 0) {
                                return ""
                            }
                            const pos = mboxPlacement.pos - initialOffset
                            let css = ""
                            if (pos !== totalOffset) {
                                const topMargin = Math.max(
                                    0,
                                    Number.parseInt(pos - totalOffset)
                                )
                                css += `#margin-box-container div.margin-box:nth-of-type(${index + 1}) {margin-top: ${topMargin}px;}\n`
                                totalOffset += topMargin
                            }
                            totalOffset += mboxPlacement.height
                            return css
                        })
                        .join("")
                    if (firstActiveIndex > -1) {
                        const topMenuHeight =
                            this.editor.dom.querySelector("header").offsetHeight
                        const refDistanceFromTop = this.editor.view.coordsAtPos(
                            referrers[firstActiveIndex]
                        ).top

                        if (
                            refDistanceFromTop - topMenuHeight < 0 ||
                            refDistanceFromTop > window.innerHeight - 30
                        ) {
                            const scrollTop =
                                refDistanceFromTop - (topMenuHeight + 90)
                            window.scrollBy({
                                left: 0,
                                top: scrollTop,
                                behavior: "smooth",
                                block: "center"
                            })
                        }
                    }
                }

                fastdom.mutate(() => {
                    //DOM write phase
                    if (
                        this.marginBoxesPlacementStyle !==
                        marginBoxesPlacementStyle
                    ) {
                        document.getElementById(
                            "margin-box-placement-style"
                        ).innerHTML = marginBoxesPlacementStyle
                        this.marginBoxesPlacementStyle =
                            marginBoxesPlacementStyle
                    }
                    if (this.editor.mod.comments.store.commentDuringCreation) {
                        this.editor.mod.comments.store.commentDuringCreation.inDOM = true
                    }
                    resolve()
                })
            })
        })
    }

    fnPosToPos(fnPos) {
        const fnIndex = this.editor.mod.footnotes.fnEditor.view.state.doc
                .resolve(fnPos)
                .index(0),
            fnMarker = getFootnoteMarkers(this.editor.view.state)[fnIndex]

        return fnMarker.from
    }

    getMarginBoxes(
        node,
        pos,
        refPos,
        lastNode,
        lastNodeTracks,
        view,
        marginBoxes,
        referrers,
        selectedChanges,
        selection // Selection in main editor
    ) {
        if (node.attrs.help) {
            // Help/instruction margin boxes
            const helpBox = {
                type: "help",
                data: {
                    active: selection.$anchor.node(1) === node ? true : false,
                    help: node.attrs.help
                }
            }
            marginBoxes.push(helpBox)
            referrers.push(refPos)
        }

        if (node.type.name === "cross_reference" && !node.attrs.title) {
            const warningBox = {
                type: "warning",
                data: {
                    active: selection.node && selection.node === node,
                    warning: gettext("A cross reference has lost its target.")
                }
            }
            marginBoxes.push(warningBox)
            referrers.push(refPos)
        }

        if (
            node.marks.find(
                mark =>
                    mark.type.name === "link" &&
                    mark.attrs.href.charAt(0) === "#" &&
                    !mark.attrs.title
            )
        ) {
            const linkMark = node.marks.find(mark => mark.type.name === "link")
            const warningBox = {
                type: "warning",
                data: {
                    active: linkMark.isInSet(selection.$anchor.marks()),
                    warning: gettext("An internal link has lost its target.")
                }
            }
            marginBoxes.push(warningBox)
            referrers.push(refPos)
        }

        const commentIds =
            node.isInline || node.isLeaf
                ? this.editor.mod.comments.interactions.findCommentIds(node)
                : []

        const nodeTracks = node.attrs.track
            ? node.attrs.track.map(track => {
                  const nodeTrack = {
                      type: track.type,
                      data: {
                          user: track.user,
                          username: track.username,
                          date: track.date
                      }
                  }
                  if (track.type === "block_change") {
                      nodeTrack.data.before = track.before
                  }
                  return nodeTrack
              })
            : node.marks
                  .filter(
                      mark =>
                          ["deletion", "format_change"].includes(
                              mark.type.name
                          ) ||
                          (mark.type.name === "insertion" &&
                              !mark.attrs.approved)
                  )
                  .map(mark => ({type: mark.type.name, data: mark.attrs}))

        // Filter out trackmarks already present in the last node (if it's an inline node).
        const tracks =
            node.isInline === lastNode.isInline
                ? nodeTracks.filter(
                      track =>
                          !lastNodeTracks.find(
                              lastTrack =>
                                  track.type === lastTrack.type &&
                                  track.data.user === lastTrack.data.user &&
                                  track.data.date === lastTrack.data.date &&
                                  (node.isInline || // block level changes almost always need new boxes
                                      (node.type.name === "paragraph" &&
                                          lastNode.type.name === "list_item" &&
                                          lastTrack.type === "insertion")) && // Don't show first paragraphs in list items.
                                  (["insertion", "deletion"].includes(
                                      track.type
                                  ) ||
                                      (track.type === "format_change" &&
                                          track.data.before.length ===
                                              lastTrack.data.before.length &&
                                          track.data.after.length ===
                                              lastTrack.data.after.length &&
                                          track.data.before.every(markName =>
                                              lastTrack.data.before.includes(
                                                  markName
                                              )
                                          ) &&
                                          track.data.after.every(markName =>
                                              lastTrack.data.after.includes(
                                                  markName
                                              )
                                          )) ||
                                      (track.type === "block_change" &&
                                          track.data.before.type ===
                                              lastTrack.data.before.type &&
                                          track.data.before.attrs.level ===
                                              lastTrack.data.before.attrs
                                                  .level))
                          )
                  )
                : nodeTracks
        tracks.forEach(track => {
            marginBoxes.push(
                Object.assign(
                    {
                        node,
                        pos,
                        view,
                        active:
                            selectedChanges[track.type] &&
                            selectedChanges[track.type].from === pos
                    },
                    track
                )
            )
            referrers.push(refPos)
        })

        if (!commentIds.length && !tracks.length) {
            return nodeTracks
        }
        commentIds.forEach(commentId => {
            const comment =
                this.editor.mod.comments.store.findComment(commentId)
            if (
                !comment ||
                (this.filterOptions.commentsOnlyMajor && !comment.isMajor) ||
                (!this.filterOptions.commentsResolved && comment.resolved)
            ) {
                // We have no comment with this ID. Ignore the referrer.
                return
            }
            if (marginBoxes.find(marginBox => marginBox.data === comment)) {
                // comment already placed
                return
            }
            const active =
                comment.id ===
                this.editor.mod.comments.interactions.activeCommentId

            if (this.filterOptions.comments) {
                if (active) {
                    this.activeCommentStyle += `.comment[data-id="${comment.id}"], .comment[data-id="${comment.id}"] .comment {background-color: ${this.commentColors.active} !important;}`
                } else if (comment.isMajor) {
                    this.activeCommentStyle += `#paper-editable .comment[data-id="${comment.id}"] {background-color: ${this.commentColors.isMajor};}`
                } else {
                    this.activeCommentStyle += `#paper-editable .comment[data-id="${comment.id}"] {background-color: ${this.commentColors.marker};}`
                }
            }
            marginBoxes.push({
                type: "comment",
                data: comment,
                pos,
                view,
                active
            })
            referrers.push(refPos)
        })

        return nodeTracks
    }

    closeAllLongComments(selector = ".comment-p.show-more") {
        document.body.querySelectorAll(selector).forEach(el => {
            el.classList.remove("show-more")
            const showMoreButton =
                el.parentElement.parentElement.querySelector(".show-more-less")
            if (showMoreButton) {
                showMoreButton.innerText = `${gettext("show more")}`
            }
        })
    }

    positionMarginBoxOptions(marginBoxDialog, showMarginboxOptionsBtn) {
        const btnTop = showMarginboxOptionsBtn.getBoundingClientRect().top,
            scrollTopOffset = window.pageYOffset,
            mBoxRight = showMarginboxOptionsBtn
                .closest(".comment-answer-container")
                .getBoundingClientRect().right

        marginBoxDialog.style.top = `${btnTop + scrollTopOffset + 30}px`
        marginBoxDialog.style.left = `${mBoxRight - marginBoxDialog.getBoundingClientRect().width - 10}px`
    }

    commentOptionsOnScroll() {
        document
            .querySelectorAll(".comment-answer-container")
            .forEach(element => {
                element.addEventListener("scroll", () => {
                    const scrollTop = element.scrollTop
                    const marginBoxOption = Array.from(element.children).find(
                        node => node.matches(".show-marginbox-options")
                    )
                    if (scrollTop > 50) {
                        marginBoxOption?.classList.add("hide")
                    } else {
                        marginBoxOption?.classList.remove("hide")
                    }
                })
            })
    }

    toggleShowMore(element) {
        const commentText =
            element.target.parentElement.parentElement.querySelector(
                ".comment-p"
            )
        commentText.classList.toggle("show-more")
        if (commentText.classList.contains("show-more")) {
            element.target.innerText = `${gettext("show less")}`
        } else {
            element.target.innerText = `${gettext("show more")}`
        }
    }

    setTrackStyle() {
        if (!this.filterOptions.track) {
            this.trackOptionsStyleElement.innerHTML = `span.insertion, .selected-insertion, .selected-format_change, .selected-block_change {
                color: inherit !important;
                background-color: inherit !important;
            }
            span.deletion {
                display: none;
            }`
        } else if (this.filterOptions.trackAuthor) {
            this.trackOptionsStyleElement.innerHTML = `span.insertion:not([data-user="${this.filterOptions.trackAuthor}"]),
            span.insertion:not([data-user="${this.filterOptions.trackAuthor}"]) .selected-insertion,
            .selected-format_change:not([data-user="${this.filterOptions.trackAuthor}"]),
            .selected-block_change:not([data-user="${this.filterOptions.trackAuthor}"]) {
                color: inherit !important;
                background-color: inherit !important;
            }
            span.deletion:not([data-user="${this.filterOptions.trackAuthor}"]) {
                display: none;
            }`
        } else {
            this.trackOptionsStyleElement.innerHTML = ""
        }
    }
}
