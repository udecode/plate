import {escapeText} from "../../common"
import {CATS} from "../../schema/i18n"

import {xmlDOM} from "../tools/xml"

import {translateBlockType} from "./tools"

const TEXT_BLOCK_TYPES = [
    "heading1",
    "heading2",
    "heading3",
    "heading4",
    "heading5",
    "heading6",
    "paragraph",
    "code_block"
]

const INLINE_TYPES = [
    "citation",
    "cross_reference",
    "cslbib",
    "cslblock",
    "cslindent",
    "cslinline",
    "cslleftmargin",
    "cslrightinline",
    "equation",
    "footnote",
    "hard_break",
    "image",
    "text"
]

export class DOCXExporterRichtext {
    constructor(
        doc,
        settings,
        lists,
        footnotes,
        math,
        tables,
        rels,
        citations,
        images
    ) {
        this.doc = doc
        this.settings = settings
        this.lists = lists
        this.footnotes = footnotes
        this.math = math
        this.tables = tables
        this.rels = rels
        this.citations = citations
        this.images = images

        this.comments = {}
        this.commentRangeCounter = -1
        this.changeCounter = 0
        this.fnCounter = 1 // footnotes 0 and 1 are occupied by separators by default.
        this.bookmarkCounter = -1
        this.categoryCounter = {} // counters for each type of figure (figure/table/photo)
        this.fncategoryCounter = {}
        this.docPrCount = -1
    }

    run(node, options = {}, nextNode = null) {
        options.comments = this.findComments(node) // Data related to comments. We need to mark the first and last occurence of comment
        return this.transformRichtext(node, options, nextNode)
    }

    findComments(node, comments = {}) {
        if (node.marks) {
            node.marks
                .filter(mark => mark.type === "comment")
                .forEach(comment => {
                    if (!this.doc.comments[comment.attrs.id]) {
                        return
                    }
                    if (!comments[comment.attrs.id]) {
                        comments[comment.attrs.id] = {
                            start: node,
                            end: node,
                            content: this.doc.comments[comment.attrs.id]
                        }
                    } else {
                        comments[comment.attrs.id]["end"] = node
                    }
                })
        }
        if (node.content) {
            for (let i = 0; i < node.content.length; i++) {
                this.findComments(node.content[i], comments)
            }
        }
        return comments
    }

    transformRichtext(node, options = {}, nextNode = null) {
        let start = "",
            content = "",
            end = ""

        if (node.marks && options.comments) {
            // Footnotes don't allow comments in DOCX
            node.marks
                .filter(mark => mark.type === "comment")
                .forEach(comment => {
                    const commentData = options.comments[comment.attrs.id]
                    if (!commentData) {
                        return
                    }
                    if (commentData.start === node) {
                        let commentId = this.comments[comment.attrs.id]
                        start += `<w:commentRangeStart w:id="${commentId}"/>`
                        commentData.content.answers?.forEach(
                            _answer =>
                                (start += `<w:commentRangeStart w:id="${++commentId}"/>`)
                        )
                    }

                    if (commentData.end === node) {
                        let commentId = this.comments[comment.attrs.id]
                        end =
                            `<w:commentRangeEnd w:id="${commentId}"/><w:r><w:commentReference w:id="${
                                commentId
                            }"/></w:r>${(commentData.content.answers || [])
                                .map(
                                    _answer =>
                                        `<w:commentRangeEnd w:id="${++commentId}"/><w:r><w:commentReference w:id="${commentId}"/></w:r>`
                                )
                                .join("")}` + end
                    }
                })
        }

        const inlineType = INLINE_TYPES.includes(node.type)

        let inlineDelete,
            nextBlockDelete,
            nextBlockInsert,
            blockChange,
            blockDelete,
            blockInsert
        if (inlineType) {
            const inlineInsert =
                inlineType &&
                (node.marks?.find(
                    mark =>
                        mark.type === "insertion" &&
                        mark.attrs.approved === false
                )?.attrs ||
                    options.blockInsert)
            inlineDelete =
                inlineType &&
                (node.marks?.find(mark => mark.type === "deletion")?.attrs ||
                    options.blockDelete)
            if (
                inlineInsert &&
                inlineDelete &&
                inlineInsert.username === inlineDelete.username
            ) {
                // In DOCX, the same user cannot both have a pending insertion and deletion of the same inline content. We remove it.
                return ""
            } else {
                if (inlineInsert) {
                    start += `<w:ins w:id="${++this.changeCounter}" w:author="${escapeText(inlineInsert.username)}" w:date="${new Date(inlineInsert.date * 60000).toISOString().split(".")[0]}Z">`
                    end = "</w:ins>" + end
                }
                if (inlineDelete) {
                    start += `<w:del w:id="${++this.changeCounter}" w:author="${escapeText(inlineDelete.username)}" w:date="${new Date(inlineDelete.date * 60000).toISOString().split(".")[0]}Z">`
                    end = "</w:del>" + end
                }
            }
        } else if (TEXT_BLOCK_TYPES.includes(node.type)) {
            blockChange = node.attrs?.track?.find(
                mark => mark.type === "block_change"
            )

            if (nextNode && TEXT_BLOCK_TYPES.includes(nextNode.type)) {
                nextBlockDelete = nextNode.attrs?.track?.find(
                    mark => mark.type === "deletion"
                )
                nextBlockInsert = nextNode.attrs?.track?.find(
                    mark => mark.type === "insertion"
                )
            }
        } else {
            blockDelete = node.attrs?.track?.find(
                mark => mark.type === "deletion"
            )
            if (blockDelete) {
                options = Object.assign({}, options)
                options.blockDelete = blockDelete
            }
            blockInsert = node.attrs?.track?.find(
                mark => mark.type === "insertion"
            )
            if (blockInsert) {
                options = Object.assign({}, options)
                options.blockInsert = blockInsert
            }
        }
        switch (node.type) {
            case "paragraph":
                if (!options.section) {
                    options.section = "Normal"
                }
                // This should really be something like
                // '<w:p w:rsidR="A437D321" w:rsidRDefault="2B935ADC">'
                // See: https://blogs.msdn.microsoft.com/brian_jones/2006/12/11/whats-up-with-all-those-rsids/
                // But tests with Word 2016/LibreOffice seem to indicate that it
                // doesn't care if the attributes are missing.
                // We may need to add them later, if it turns out this is a problem
                // for other versions of Word. In that case we should also add
                // it to settings.xml as described in above link.
                if (
                    options.section === "Normal" &&
                    !options.list_type &&
                    !node.content?.length
                ) {
                    start += "<w:p/>"
                } else {
                    start += `
                        <w:p${options.paragraphId ? ` w14:paraId="${options.paragraphId}"` : ""}>
                            <w:pPr><w:pStyle w:val="${options.section}"/>`
                    if (options.list_type) {
                        start += `<w:numPr><w:ilvl w:val="${options.list_depth}"/>`
                        start += `<w:numId w:val="${options.list_type}"/></w:numPr>`
                    } else {
                        start += `
                        <w:rPr>
                        ${
                            nextBlockInsert
                                ? `<w:ins w:id="${++this.changeCounter}" w:author="${escapeText(nextBlockInsert.username)}" w:date="${new Date(nextBlockInsert.date * 60000).toISOString().split(".")[0]}Z"/>`
                                : ""
                        }
                        ${
                            nextBlockDelete
                                ? `<w:del w:id="${++this.changeCounter}" w:author="${escapeText(nextBlockDelete.username)}" w:date="${new Date(nextBlockDelete.date * 60000).toISOString().split(".")[0]}Z"/>`
                                : ""
                        }
                        </w:rPr>`
                    }
                    if (blockChange) {
                        start += `
                        <w:pPrChange w:id="${++this.changeCounter}" w:author="${escapeText(blockChange.username)}" w:date="${new Date(blockChange.date * 60000).toISOString().split(".")[0]}Z">
                            <w:pPr>
                                <w:pStyle w:val="${translateBlockType(blockChange.before.type)}"/>
                            </w:pPr>
                        </w:pPrChange>`
                    }
                    start += "</w:pPr>"
                    end = "</w:p>" + end
                    if (!node.content?.length) {
                        start += "<w:r><w:rPr></w:rPr></w:r>"
                    }
                }
                if (options.commentReference) {
                    end =
                        '<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:annotationRef/></w:r>' +
                        end
                    options = Object.assign({}, options)
                    options.commentReference = false
                }
                break
            case "bibliography_heading":
                start += `
                    <w:p>
                        <w:pPr>
                            <w:pStyle w:val="BibliographyHeading"/>
                            <w:rPr></w:rPr>
                        </w:pPr>`
                end = "</w:p>" + end
                break
            case "heading1":
            case "heading2":
            case "heading3":
            case "heading4":
            case "heading5":
            case "heading6":
                start += `
                    <w:p>
                        <w:pPr>
                            <w:pStyle w:val="${translateBlockType(node.type)}"/>
                            <w:rPr>
                            ${
                                nextBlockInsert
                                    ? `<w:ins w:id="${++this.changeCounter}" w:author="${escapeText(nextBlockInsert.username)}" w:date="${new Date(nextBlockInsert.date * 60000).toISOString().split(".")[0]}Z"/>`
                                    : ""
                            }
                            ${
                                nextBlockDelete
                                    ? `<w:del w:id="${++this.changeCounter}" w:author="${escapeText(nextBlockDelete.username)}" w:date="${new Date(nextBlockDelete.date * 60000).toISOString().split(".")[0]}Z"/>`
                                    : ""
                            }
                            </w:rPr>
                            ${
                                blockChange
                                    ? blockChange.before.type === "paragraph"
                                        ? `<w:pPrChange w:id="${++this.changeCounter}" w:author="${escapeText(blockChange.username)}" w:date="${new Date(blockChange.date * 60000).toISOString().split(".")[0]}Z"/>`
                                        : `<w:pPrChange w:id="${++this.changeCounter}" w:author="${escapeText(blockChange.username)}" w:date="${new Date(blockChange.date * 60000).toISOString().split(".")[0]}Z">
                <w:pPr>
                    <w:pStyle w:val="${translateBlockType(blockChange.before.type)}"/>
                </w:pPr>
            </w:pPrChange>`
                                    : ""
                            }
                        </w:pPr>
                        <w:bookmarkStart w:name="${node.attrs.id}" w:id="${++this.bookmarkCounter}"/>
                        <w:bookmarkEnd w:id="${this.bookmarkCounter}"/>`
                end = "</w:p>" + end
                break
            case "blockquote":
                // This is imperfect, but Word doesn't seem to provide section/quotation nesting
                // Also, track information on wrapping into blockquote is not exported.
                options = Object.assign({}, options)
                options.section = "Quote"
                break
            case "code_block":
                if (!node.content?.length) {
                    start += "<w:p/>"
                } else {
                    options = Object.assign({}, options)
                    options.section = "Code"
                    start += `
                        <w:p${options.paragraphId ? ` w14:paraId="${options.paragraphId}"` : ""}>
                            <w:pPr><w:pStyle w:val="${options.section}"/>`
                    if (options.list_type) {
                        start += `<w:numPr><w:ilvl w:val="${options.list_depth}"/>`
                        start += `<w:numId w:val="${options.list_type}"/></w:numPr>`
                    } else {
                        start += `
                        <w:rPr>
                        ${
                            nextBlockInsert
                                ? `<w:ins w:id="${++this.changeCounter}" w:author="${escapeText(nextBlockInsert.username)}" w:date="${new Date(nextBlockInsert.date * 60000).toISOString().split(".")[0]}Z"/>`
                                : ""
                        }
                        ${
                            nextBlockDelete
                                ? `<w:del w:id="${++this.changeCounter}" w:author="${escapeText(nextBlockDelete.username)}" w:date="${new Date(nextBlockDelete.date * 60000).toISOString().split(".")[0]}Z"/>`
                                : ""
                        }
                        </w:rPr>`
                    }
                    if (blockChange) {
                        start += `
                        <w:pPrChange w:id="${++this.changeCounter}" w:author="${escapeText(blockChange.username)}" w:date="${new Date(blockChange.date * 60000).toISOString().split(".")[0]}Z">
                            <w:pPr>
                                <w:pStyle w:val="${translateBlockType(blockChange.before.type)}"/>
                            </w:pPr>
                        </w:pPrChange>`
                    }
                    start += "</w:pPr>"
                    end = "</w:p>" + end
                    if (!node.content?.length) {
                        start += "<w:r><w:rPr></w:rPr></w:r>"
                    }
                }
                if (options.commentReference) {
                    end =
                        '<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:annotationRef/></w:r>' +
                        end
                    options.commentReference = false
                }
                break
            case "ordered_list":
                options = Object.assign({}, options)
                options.section = "ListParagraph"
                if (options.list_depth === undefined) {
                    options.list_depth = 0
                } else {
                    options.list_depth += 1
                }
                options.list_type = this.lists.getNumberedType()
                break
            case "bullet_list":
                options = Object.assign({}, options)
                options.section = "ListParagraph"
                options.list_type = this.lists.getBulletType()
                if (options.list_depth === undefined) {
                    options.list_depth = 0
                } else {
                    options.list_depth += 1
                }
                break
            case "list_item":
                // Word seems to lack complex nesting options. The styling is applied
                // to child paragraphs. This will deliver correct results in most
                // cases.
                break
            case "footnotecontainer":
                options = Object.assign({}, options)
                options.section = "Footnote"
                options.inFootnote = true
                start += `<w:footnote w:id="${++this.fnCounter}">`
                end = "</w:footnote>" + end
                options.footnoteRefMissing = true
                break
            case "footnote":
                content += `
                    <w:r>
                        <w:rPr>
                            <w:rStyle w:val="FootnoteAnchor"/>
                        </w:rPr>
                        <w:footnoteReference w:id="${++this.fnCounter}"/>
                    </w:r>`
                break
            case "text": {
                let hyperlink,
                    anchor,
                    em,
                    strong,
                    underline,
                    smallcaps,
                    sup,
                    sub,
                    formatChange
                // Check for hyperlink, anchor, bold/strong and italic/em
                if (node.marks) {
                    hyperlink = node.marks.find(mark => mark.type === "link")
                    anchor = node.marks.find(mark => mark.type === "anchor")
                    em = node.marks.find(mark => mark.type === "em")
                    strong = node.marks.find(mark => mark.type === "strong")
                    underline = node.marks.find(
                        mark => mark.type === "underline"
                    )
                    smallcaps = node.marks.find(
                        mark => mark.type === "smallcaps"
                    )
                    sup = node.marks.find(mark => mark.type === "sup")
                    sub = node.marks.find(mark => mark.type === "sub")
                    formatChange = node.marks.find(
                        mark => mark.type === "format_change"
                    )
                }
                if (anchor) {
                    start += `<w:bookmarkStart w:name="${anchor.attrs.id}" w:id="${++this.bookmarkCounter}"/><w:bookmarkEnd w:id="${this.bookmarkCounter}"/>`
                    end =
                        `<w:bookmarkStart w:name="${anchor.attrs.id}" w:id="${++this.bookmarkCounter}"/><w:bookmarkEnd w:id="${this.bookmarkCounter}"/>` +
                        end
                }
                if (hyperlink) {
                    const href = hyperlink.attrs.href
                    if (href[0] === "#") {
                        // Internal link
                        start += `<w:hyperlink w:anchor="${href.slice(1)}">`
                    } else {
                        // External link
                        const refId = this.rels.addLinkRel(href)
                        start += `<w:hyperlink r:id="rId${refId}">`
                    }
                    start += "<w:r>"
                    end = "</w:r></w:hyperlink>" + end
                } else {
                    start += "<w:r>"
                    end = "</w:r>" + end
                }
                start += "<w:rPr>"
                if (
                    hyperlink ||
                    em ||
                    strong ||
                    underline ||
                    smallcaps ||
                    sup ||
                    sub
                ) {
                    if (hyperlink) {
                        this.rels.addLinkStyle()
                        start += `<w:rStyle w:val="${this.rels.hyperLinkStyle}"/>`
                    }
                    if (em) {
                        start += "<w:i/><w:iCs/>"
                    }
                    if (strong) {
                        start += "<w:b/><w:bCs/>"
                    }
                    if (underline) {
                        start += '<w:u w:val="single"/>'
                    }
                    if (smallcaps) {
                        start += "<w:smallCaps/>"
                    }
                    if (sup) {
                        start += '<w:vertAlign w:val="superscript"/>'
                    } else if (sub) {
                        start += '<w:vertAlign w:val="subscript"/>'
                    }
                }
                if (formatChange) {
                    const beforeStyle = formatChange.attrs.before
                    start += `<w:rPrChange w:id="${++this.changeCounter}" w:author="${escapeText(formatChange.attrs.username)}" w:date="${new Date(formatChange.attrs.date * 60000).toISOString().split(".")[0]}Z"><w:rPr>`
                    if (beforeStyle.includes("em")) {
                        start += "<w:i/><w:iCs/>"
                    }
                    if (beforeStyle.includes("strong")) {
                        start += "<w:b/><w:bCs/>"
                    }
                    if (beforeStyle.includes("underline")) {
                        start += '<w:u w:val="single"/>'
                    }
                    start += "</w:rPr></w:rPrChange>"
                }
                start += "</w:rPr>"
                if (options.footnoteRefMissing) {
                    start += "<w:footnoteRef /><w:tab />"
                    options.footnoteRefMissing = false
                }
                let textAttr = ""
                if (
                    node.text[0] === " " ||
                    node.text[node.text.length - 1] === " "
                ) {
                    textAttr += ' xml:space="preserve"'
                }
                if (inlineDelete) {
                    start += `<w:delText${textAttr}>`
                    end = "</w:delText>" + end
                } else {
                    start += `<w:t${textAttr}>`
                    end = "</w:t>" + end
                }
                content += escapeText(node.text)
                break
            }
            case "cross_reference": {
                const title = node.attrs.title
                const id = node.attrs.id
                let marks = node.marks.slice()
                if (title && id) {
                    const hyperlink = {
                        type: "link",
                        attrs: {href: `#${id}`, title}
                    }
                    marks = marks.filter(mark => mark.type !== "link")
                    marks.push(hyperlink)
                }
                content += this.transformRichtext(
                    {
                        type: "text",
                        text: title || "MISSING TARGET",
                        marks
                    },
                    options,
                    nextNode
                )
                break
            }
            case "citation": {
                // We take the first citation from the stack and remove it.
                const cit = this.citations.pmCits.shift()
                if (options.citationType === "note" && !options.inFootnote) {
                    // If the citations are in notes (footnotes), we need to
                    // put the content of this citation in a footnote.
                    // We then add the footnote to the footnote file and
                    // adjust the ids of all subsequent footnotes to be one higher
                    // than what they were until now.
                    content += `
                        <w:r>
                            <w:rPr>
                                <w:rStyle w:val="FootnoteAnchor"/>
                            </w:rPr>
                            <w:footnoteReference w:id="${this.fnCounter}"/>
                        </w:r>`
                    const fnContents = this.transformRichtext(cit, {
                        footnoteRefMissing: true,
                        section: "Footnote"
                    })
                    const fnXML = `<w:footnote w:id="${this.fnCounter}">${fnContents}</w:footnote>`
                    const xml = this.footnotes.xml
                    const lastId = this.fnCounter - 1
                    const footnotes = xml.queryAll("w:footnote")
                    footnotes.forEach(footnote => {
                        const id = Number.parseInt(
                            footnote.getAttribute("w:id")
                        )
                        if (id >= this.fnCounter) {
                            footnote.setAttribute("w:id", id + 1)
                        }
                        if (id === lastId) {
                            footnote.parentElement.insertBefore(
                                xmlDOM(fnXML),
                                footnote.nextSibling
                            )
                        }
                    })
                    this.fnCounter++
                } else {
                    for (let i = 0; i < cit.content.length; i++) {
                        content += this.transformRichtext(
                            cit.content[i],
                            options,
                            cit.content[i + 1]
                        )
                    }
                }
                break
            }
            case "figure": {
                const category = node.attrs.category
                let caption = node.attrs.caption
                    ? node.content.find(node => node.type === "figure_caption")
                          ?.content || []
                    : []
                let catCountXML = ""
                if (category !== "none") {
                    const categoryCounter = options.inFootnote
                        ? this.fncategoryCounter
                        : this.categoryCounter
                    if (!categoryCounter[category]) {
                        categoryCounter[category] = 1
                    }
                    catCountXML = `<w:r>
                        <w:t xml:space="preserve">${CATS[category][this.settings.language]} </w:t>
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:fldChar w:fldCharType="begin"></w:fldChar>
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:instrText> SEQ ${category} \\* ARABIC </w:instrText>
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:fldChar w:fldCharType="separate" />
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:t>${categoryCounter[category]++}${options.inFootnote ? "A" : ""}</w:t>
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:fldChar w:fldCharType="end" />
                    </w:r>`
                    if (caption.length) {
                        caption = [{type: "text", text: ": "}].concat(caption)
                    }
                }
                let cx, cy
                const image =
                    node.content.find(node => node.type === "image")?.attrs
                        .image || false
                if (image !== false) {
                    const imageEntry = this.images.images[image]
                    cx = imageEntry.width * 9525 // width in EMU
                    cy = imageEntry.height * 9525 // height in EMU
                    const imgTitle = imageEntry.title
                    // Shrink image if too large for paper.
                    if (options.dimensions) {
                        let width = options.dimensions.width
                        if (options.tableSideMargins) {
                            width = width - options.tableSideMargins
                        }
                        width =
                            (width * Number.parseInt(node.attrs.width)) / 100
                        if (cx > width) {
                            const rel = cy / cx
                            cx = width
                            cy = cx * rel
                        }
                        if (cy > options.dimensions.height) {
                            const rel = cx / cy
                            cy = options.dimensions.height
                            cx = cy * rel
                        }
                    }
                    cy = Math.round(cy)
                    cx = Math.round(cx)
                    const rId = imageEntry.id
                    content += `<w:r>
                      <w:rPr></w:rPr>
                      <w:drawing>
                        <wp:inline distT="0" distB="0" distL="0" distR="0">
                          <wp:extent cx="${cx}" cy="${cy}"/>
                          <wp:docPr id="${++this.docPrCount}" name="Picture${this.docPrCount}" descr=""/>
                          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                                <pic:nvPicPr>
                                  <pic:cNvPr id="0" name="${imgTitle}" descr=""/>
                                  <pic:cNvPicPr>
                                    <a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
                                  </pic:cNvPicPr>
                                </pic:nvPicPr>
                                <pic:blipFill>
                                  <a:blip r:embed="rId${rId}"/>
                                  <a:stretch>
                                    <a:fillRect/>
                                  </a:stretch>
                                </pic:blipFill>
                                <pic:spPr bwMode="auto">
                                  <a:xfrm>
                                    <a:off x="0" y="0"/>
                                    <a:ext cx="${cx}" cy="${cy}"/>
                                  </a:xfrm>
                                  <a:prstGeom prst="rect">
                                    <a:avLst/>
                                  </a:prstGeom>
                                  <a:noFill/>
                                  <a:ln w="9525">
                                    <a:noFill/>
                                    <a:miter lim="800000"/>
                                    <a:headEnd/>
                                    <a:tailEnd/>
                                  </a:ln>
                                </pic:spPr>
                              </pic:pic>
                            </a:graphicData>
                          </a:graphic>
                        </wp:inline>
                      </w:drawing>
                    </w:r>`
                } else {
                    cx = 9525 * 100 // We pick a random size of 100x100. We hope this will fit the formula
                    cy = 9525 * 100
                    const latex =
                        node.content.find(
                            node => node.type === "figure_equation"
                        )?.attrs.equation || ""
                    content += this.math.getOmml(latex)
                }
                const captionSpace = !!(catCountXML.length || caption.length)
                if (node.attrs.aligned === "center") {
                    start += `
                    <w:p>
                      <w:pPr>
                        <w:jc w:val="center"/>
                      </w:pPr>`
                    content =
                        `<w:bookmarkStart w:name="${node.attrs.id}" w:id="${++this.bookmarkCounter}"/><w:bookmarkEnd w:id="${this.bookmarkCounter}"/>` +
                        content
                    end =
                        `
                    </w:p>
                    ${
                        captionSpace
                            ? `<w:p>
                          <w:pPr><w:pStyle w:val="Caption"/><w:rPr></w:rPr></w:pPr>
                          ${catCountXML}
                          ${caption.map((node, i) => this.transformRichtext(node, options, caption[i + 1])).join("")}
                    </w:p>`
                            : ""
                    }` + end
                } else {
                    start += `
                    <w:p>
                      <w:pPr>
                        <w:jc w:val="center"/>
                      </w:pPr>
                      <w:r>
                        <w:rPr></w:rPr>
                          <w:drawing>
                            <wp:anchor behindDoc="0" distT="95250" distB="95250" distL="95250" distR="95250" simplePos="0" locked="0" layoutInCell="1" allowOverlap="0" relativeHeight="2">
                                <wp:simplePos x="0" y="0" />
                                <wp:positionH relativeFrom="column">
                                    <wp:align>${node.attrs.aligned}</wp:align>
                                </wp:positionH>
                                <wp:positionV relativeFrom="paragraph">
                                    <wp:posOffset>0</wp:posOffset>
                                </wp:positionV>
                                <wp:extent cx="${cx}" cy="${captionSpace ? cy + 350520 : cy}" />
                                <wp:effectExtent l="0" t="0" r="0" b="0" />
                                <wp:wrapSquare wrapText="largest" />
                                <wp:docPr id="${++this.docPrCount}" name="Frame${this.docPrCount}" />
                                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                                    <a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
                                        <wps:wsp>
                                            <wps:cNvSpPr txBox="1" />
                                            <wps:spPr>
                                                <a:xfrm>
                                                    <a:off x="0" y="0" />
                                                    <a:ext cx="${cx}" cy="${captionSpace ? cy + 350520 : cy}" />
                                                </a:xfrm>
                                                <a:prstGeom prst="rect" />
                                            </wps:spPr>
                                            <wps:txbx>
                                                <w:txbxContent>
                                                    <w:p>
                                                        <w:pPr>
                                                            <w:pStyle w:val="Caption" />
                                                            <w:spacing w:before="20" w:after="220" />
                                                            <w:rPr></w:rPr>
                                                        </w:pPr>`
                    content =
                        `<w:bookmarkStart w:name="${node.attrs.id}" w:id="${++this.bookmarkCounter}"/><w:bookmarkEnd w:id="${this.bookmarkCounter}"/>` +
                        content
                    end =
                        `
                                                        ${catCountXML}
                                                        ${caption.map((node, i) => this.transformRichtext(node, options, caption[i + 1])).join("")}
                                                    </w:p>
                                                </w:txbxContent>
                                            </wps:txbx>
                                            <wps:bodyPr anchor="t" lIns="0" tIns="0" rIns="0" bIns="0">
                                                <a:noAutofit />
                                            </wps:bodyPr>
                                        </wps:wsp>
                                    </a:graphicData>
                                </a:graphic>
                                  <wp14:sizeRelH relativeFrom="margin">
                                    <wp14:pctWidth>${node.attrs.width}000</wp14:pctWidth>
                                </wp14:sizeRelH>
                            </wp:anchor>
                        </w:drawing>
                      </w:r>
                    </w:p>` + end
                }
                if (blockInsert) {
                    start += `<w:ins w:id="${++this.changeCounter}" w:author="${escapeText(blockInsert.username)}" w:date="${new Date(blockInsert.date * 60000).toISOString().split(".")[0]}Z">`
                    end = "</w:ins>" + end
                }
                if (blockDelete) {
                    start += `<w:del w:id="${++this.changeCounter}" w:author="${escapeText(blockDelete.username)}" w:date="${new Date(blockDelete.date * 60000).toISOString().split(".")[0]}Z">`
                    end = "</w:del>" + end
                }
                break
            }
            case "figure_caption":
                // We are already dealing with this in the figure. Prevent content from being added a second time.
                return ""
            case "figure_equation":
                // We are already dealing with this in the figure.
                break
            case "image":
                // We are already dealing with this in the figure.
                break
            case "table": {
                const category = node.attrs.category
                let caption = node.attrs.caption
                    ? node.content[0].content || []
                    : []
                let catCountXML = ""
                if (category !== "none") {
                    const categoryCounter = options.inFootnote
                        ? this.fncategoryCounter
                        : this.categoryCounter
                    if (!categoryCounter[category]) {
                        categoryCounter[category] = 1
                    }
                    catCountXML = `<w:r>
                        <w:t xml:space="preserve">${CATS[category][this.settings.language]} </w:t>
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:fldChar w:fldCharType="begin"></w:fldChar>
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:instrText> SEQ ${category} \\* ARABIC </w:instrText>
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:fldChar w:fldCharType="separate" />
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:t>${categoryCounter[category]++}${options.inFootnote ? "A" : ""}</w:t>
                    </w:r>
                    <w:r>
                        <w:rPr></w:rPr>
                        <w:fldChar w:fldCharType="end" />
                    </w:r>`
                    if (caption.length) {
                        caption = [{type: "text", text: ": "}].concat(caption)
                    }
                }
                const captionSpace = !!(catCountXML.length || caption.length)
                if (captionSpace) {
                    start += `
                    <w:p>
                        <w:pPr>
                            <w:pStyle w:val="Caption"/>
                            <w:keepNext/>
                        </w:pPr>
                        <w:bookmarkStart w:name="${node.attrs.id}" w:id="${++this.bookmarkCounter}"/>
                        <w:bookmarkEnd w:id="${this.bookmarkCounter}"/>
                        ${catCountXML}
                        ${caption.map((node, i) => this.transformRichtext(node, options, caption[i + 1])).join("")}
                    </w:p>`
                }
                this.tables.addTableGridStyle()
                start += `
                    <w:tbl>
                        <w:tblPr>
                            <w:tblStyle w:val="${this.tables.tableGridStyle}" />
                            ${
                                node.attrs.width === "100"
                                    ? '<w:tblW w:w="0" w:type="auto" />'
                                    : `<w:tblW w:w="${50 * Number.parseInt(node.attrs.width)}" w:type="pct" />
                                    <w:jc w:val="${node.attrs.aligned}" />`
                            }
                            <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1" />
                        </w:tblPr>
                        <w:tblGrid>`
                const columns = node.content[1].content[0].content.length
                let cellWidth = 63500 // standard width
                options = Object.assign({}, options)
                if (options.dimensions?.width) {
                    cellWidth =
                        Number.parseInt(options.dimensions.width / columns) -
                        2540 // subtracting for border width
                } else if (!options.dimensions) {
                    options.dimensions = {}
                }
                options.section = "Normal"
                options.list_type = null
                options.dimensions = Object.assign({}, options.dimensions)
                options.dimensions.width = cellWidth
                options.tableSideMargins = this.tables.getSideMargins()
                for (let i = 0; i < columns; i++) {
                    start += `<w:gridCol w:w="${Number.parseInt(cellWidth / 635)}" />`
                }
                start += "</w:tblGrid>"
                end = "</w:tbl>" + end

                break
            }
            case "table_body":
                // Pass through to table.
                break
            case "table_caption":
                // We already deal with this in 'table'.
                return ""
            case "table_row":
                start += "<w:tr>"
                end = "</w:tr>" + end
                break
            case "table_cell":
            case "table_header":
                start += `
                    <w:tc>
                        <w:tcPr>
                            ${
                                node.attrs.rowspan && node.attrs.colspan
                                    ? `<w:tcW w:w="${Number.parseInt((options.dimensions?.width || 0) / 635)}" w:type="dxa" />`
                                    : '<w:tcW w:w="0" w:type="auto" />'
                            }
                            ${
                                node.attrs.rowspan
                                    ? node.attrs.rowspan > 1
                                        ? '<w:vMerge w:val="restart" />'
                                        : ""
                                    : "<w:vMerge/>"
                            }
                            ${
                                node.attrs.colspan
                                    ? node.attrs.colspan > 1
                                        ? '<w:hMerge w:val="restart" />'
                                        : ""
                                    : "<w:hMerge/>"
                            }
                        </w:tcPr>
                        ${node.content ? "" : "<w:p/>"}`
                end = "</w:tc>" + end

                break
            case "equation": {
                const latex = node.attrs.equation
                content += this.math.getOmml(latex)
                break
            }
            case "hard_break":
                content += "<w:r><w:br/></w:r>"
                break
            // CSL bib entries
            case "cslbib":
                options = Object.assign({}, options)
                options.section = "Bibliography1"
                break
            case "cslblock":
                end = "<w:r><w:br/></w:r>" + end
                break
            case "cslleftmargin":
                end = "<w:r><w:tab/></w:r>" + end
                break
            case "cslindent":
                start += "<w:r><w:tab/></w:r>"
                end = "<w:r><w:br/></w:r>" + end
                break
            case "cslentry":
                start += `
                    <w:p>
                        <w:pPr>
                            <w:pStyle w:val="${options.section || ""}"/>
                            <w:rPr></w:rPr>
                        </w:pPr>`
                end = "</w:p>" + end
                break
            case "cslinline":
            case "cslrightinline":
                break
            default:
                console.warn("Unknown node type:", node.type, node)
                break
        }

        if (node.content) {
            for (let i = 0; i < node.content.length; i++) {
                content += this.transformRichtext(
                    node.content[i],
                    options,
                    node.content[i + 1]
                )
            }
        }
        return start + content + end
    }
}
