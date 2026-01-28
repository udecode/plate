import {escapeText} from "../../common"
import {CATS} from "../../schema/i18n"

const TEXT_TYPES = {
    heading1: {tag: "text:h", attrs: _options => 'text:outline-level="1"'},
    heading2: {tag: "text:h", attrs: _options => 'text:outline-level="2"'},
    heading3: {tag: "text:h", attrs: _options => 'text:outline-level="3"'},
    heading4: {tag: "text:h", attrs: _options => 'text:outline-level="4"'},
    heading5: {tag: "text:h", attrs: _options => 'text:outline-level="5"'},
    heading6: {tag: "text:h", attrs: _options => 'text:outline-level="6"'},
    paragraph: {
        tag: "text:p",
        attrs: options => `text:style-name="${options.section}"`
    },
    code_block: {
        tag: "text:p",
        attrs: _options => 'text:style-name="Preformatted_20_Text"'
    }
}

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

export class ODTExporterRichtext {
    constructor(
        comments,
        settings,
        styles,
        tracks,
        footnotes,
        citations,
        math,
        images
    ) {
        this.comments = comments
        this.styles = styles
        this.tracks = tracks
        this.footnotes = footnotes
        this.citations = citations
        this.settings = settings
        this.math = math
        this.images = images

        this.imgCounter = 1
        this.fnCounter = 0 // real footnotes
        this.fnAlikeCounter = 0 // real footnotes and citations as footnotes
        this.categoryCounter = {} // counters for each type of table/figure category (figure/table/photo)
        this.fnCategoryCounter = {} // counters for each type of table/figure category (figure/table/photo)
        this.zIndex = 0
    }

    run(node, options = {}, parent = null, siblingIndex = 0) {
        options.comments = this.findComments(node) // Data related to comments. We need to mark the first and last occurence of comment
        return this.transformRichtext(node, options, parent, siblingIndex)
    }

    findComments(node, comments = {}) {
        if (node.marks) {
            node.marks
                .filter(mark => mark.type === "comment")
                .forEach(comment => {
                    if (!comments[comment.attrs.id]) {
                        comments[comment.attrs.id] = {
                            start: node,
                            end: node,
                            content: this.comments[comment.attrs.id]
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

    transformRichtext(node, options = {}, parent = null, siblingIndex = 0) {
        let start = "",
            content = "",
            end = ""
        const siblings = parent?.content || []
        const previousSibling = siblings[siblingIndex - 1]
        const nextSibling = siblings[siblingIndex + 1]

        const inlineNode = INLINE_TYPES.includes(node.type)

        let blockDelete, blockInsert

        if (!inlineNode && node.attrs?.track) {
            blockDelete = node.attrs.track.find(
                mark => mark.type === "deletion"
            )
            if (blockDelete) {
                options = Object.assign({}, options)
                options.blockDelete = blockDelete
            }
            blockInsert = node.attrs.track.find(
                mark => mark.type === "insertion"
            )
            if (blockInsert) {
                options = Object.assign({}, options)
                options.blockInsert = blockInsert
            }
        }

        if (node.marks) {
            node.marks
                .filter(mark => mark.type === "comment")
                .forEach(comment => {
                    const commentData = options.comments[comment.attrs.id]
                    if (!commentData || !commentData.content) {
                        return
                    }
                    if (commentData.start === node) {
                        start += `<office:annotation office:name="comment_${options.tag}_${comment.attrs.id}" loext:resolved="${commentData.content.resolved}">
                                     <dc:creator>${escapeText(commentData.content.username)}</dc:creator>
                                        <dc:date>${new Date(commentData.content.date).toISOString().slice(0, -1)}000000</dc:date>
                                        ${commentData.content.comment.map(node => this.transformRichtext(node, options)).join("")}
                                    </office:annotation>`
                    }
                    if (commentData.end === node) {
                        end =
                            `<office:annotation-end office:name="comment_${options.tag}_${comment.attrs.id}"/>` +
                            (commentData.content.answers || [])
                                .map(
                                    answer =>
                                        `<office:annotation loext:resolved="${commentData.content.resolved}">
                                    <dc:creator>${escapeText(answer.username)}</dc:creator>
                                    <dc:date>${new Date(answer.date).toISOString().slice(0, -1)}000000</dc:date>
                                    ${answer.answer.map(node => this.transformRichtext(node, options)).join("")}
                                </office:annotation>`
                                )
                                .join("") +
                            end
                    }
                })
        }

        switch (node.type) {
            case "bibliography_heading":
                this.styles.checkParStyle("Bibliography_20_Heading")
                start += '<text:p text:style-name="Bibliography_20_Heading">'
                end = "</text:p>" + end
                break
            case "code_block":
            case "heading1":
            case "heading2":
            case "heading3":
            case "heading4":
            case "heading5":
            case "heading6":
            case "paragraph": {
                // Handles all types of text blocks.
                if (node.type === "code_block") {
                    this.styles.checkParStyle("Preformatted_20_Text")
                } else if (node.type === "paragraph") {
                    if (!options.section) {
                        options.section = "Text_20_body"
                    }
                    this.styles.checkParStyle(options.section)
                }
                const nextBlockDelete = nextSibling?.attrs?.track?.find(
                    mark => mark.type === "deletion"
                )
                const nextBlockInsert = nextSibling?.attrs?.track?.find(
                    mark => mark.type === "insertion"
                )
                let lastNonMergedBlock
                if (blockDelete) {
                    // This block has been deleted, so we need to check which text block
                    // it is being merged in to. If it has, we need to merge the
                    // two blocks.
                    if (!previousSibling || !TEXT_TYPES[previousSibling.type]) {
                        // We cannot merge into previous block. Therefore, we don't consider
                        // this text block as merged.
                        blockDelete = false
                    } else {
                        let searchNode = previousSibling
                        while (searchNode && TEXT_TYPES[searchNode.type]) {
                            lastNonMergedBlock = searchNode
                            if (
                                searchNode?.attrs?.track?.find(
                                    mark => mark.type === "deletion"
                                )
                            ) {
                                searchNode =
                                    siblings[siblings.indexOf(searchNode) - 1]
                            } else {
                                searchNode = false
                            }
                        }
                    }
                }
                if (blockDelete) {
                    // This block has been deleted, so instead we just add a text
                    // change marker.
                    if (previousSibling.type === "paragraph") {
                        if (!options.section) {
                            options.section = "Text_20_body"
                        }
                        this.styles.checkParStyle(options.section)
                    }
                    const trackId = this.tracks.addChange(
                        blockDelete,
                        `
                        <${TEXT_TYPES[previousSibling.type].tag} ${TEXT_TYPES[previousSibling.type].attrs(options)}/>
                        <${TEXT_TYPES[node.type].tag} ${TEXT_TYPES[node.type].attrs(options)}/>`
                    )
                    start += `<text:change text:change-id="${trackId}"/>`
                } else {
                    start += `<${TEXT_TYPES[node.type].tag} ${TEXT_TYPES[node.type].attrs(options)}>`
                }
                if (blockInsert && blockInsert.trackId) {
                    // The previous block node is a text node , so the insertion is a textblock split.
                    // We need to put change track marks in both this and the previous text block.
                    start += `<text:change-end text:change-id="${blockInsert.trackId}"/>`
                }
                const nextBlockDeleteTextType =
                    nextBlockDelete && TEXT_TYPES[nextSibling.type]
                if (!nextBlockDeleteTextType) {
                    const lastNonMergedBlockTextType =
                        lastNonMergedBlock &&
                        TEXT_TYPES[lastNonMergedBlock.type]
                    if (lastNonMergedBlockTextType) {
                        // This block has been deleted and the next block is not.
                        // So we end it here as the last known non-deleted block type.
                        end = `</${lastNonMergedBlockTextType.tag}>` + end
                    } else {
                        // The next block is not deleted, so we close this block.
                        end = `</${TEXT_TYPES[node.type].tag}>` + end
                    }
                }
                if (nextBlockInsert && TEXT_TYPES[nextSibling.type]) {
                    // The following block node is a text node , so the insertion is a textblock split.
                    // We need to put change track marks in both this and the next text block.
                    const trackId = this.tracks.addChange(nextBlockInsert)
                    end =
                        `<text:change-start text:change-id="${trackId}"/>` + end
                    // Adding the track id here so that we can add find it at the beginning of the next text block.
                    nextBlockInsert.trackId = trackId
                }
                if (TEXT_TYPES[node.type].tag === "text:h") {
                    start += `<text:bookmark-start text:name="${node.attrs.id}"/>`
                    end =
                        `<text:bookmark-end text:name="${node.attrs.id}"/>` +
                        end
                }
                break
            }
            case "blockquote":
                // This is imperfect, but Word doesn't seem to provide section/quotation nesting
                options = Object.assign({}, options)
                options.section = "Quote"
                break
            case "ordered_list": {
                const olId = this.styles.getOrderedListStyleId(node.attrs.order)
                start += `<text:list text:style-name="L${olId[0]}">`
                end = "</text:list>" + end
                options = Object.assign({}, options)
                options.section = `P${olId[1]}`
                options.listStyles = (options.listStyles || []).concat([
                    `L${olId[0]}`
                ])
                break
            }
            case "bullet_list": {
                const ulId = this.styles.getBulletListStyleId()
                start += `<text:list text:style-name="L${ulId[0]}">`
                end = "</text:list>" + end
                options = Object.assign({}, options)
                options.section = `P${ulId[1]}`
                options.listStyles = (options.listStyles || []).concat([
                    `L${ulId[0]}`
                ])
                break
            }
            case "list_item":
                start += "<text:list-item>"
                end = "</text:list-item>" + end
                break
            case "footnotecontainer":
                break
            case "footnote": {
                const fnCounter = this.fnAlikeCounter++
                const fnOptions = Object.assign({}, options)
                fnOptions.section = "Footnote"
                fnOptions.tag = `footnote${fnCounter}`
                fnOptions.inFootnote = true
                const fnNode = {
                    type: "footnotecontainer",
                    content: node.attrs.footnote
                }
                fnOptions.comments = this.findComments(fnNode)
                content += this.transformRichtext(fnNode, fnOptions)
                start += `
                <text:note text:id="ftn${fnCounter}" text:note-class="footnote">
                    <text:note-citation>${fnCounter}</text:note-citation>
                    <text:note-body>`
                end =
                    `
                    </text:note-body>
                </text:note>` + end
                break
            }
            case "text": {
                let hyperlink,
                    strong,
                    em,
                    underline,
                    sup,
                    sub,
                    smallcaps,
                    anchor
                // Check for hyperlink, bold/strong and italic/em
                if (node.marks) {
                    hyperlink = node.marks.find(mark => mark.type === "link")
                    anchor = node.marks.find(mark => mark.type === "anchor")
                    strong = node.marks.find(mark => mark.type === "strong")
                    em = node.marks.find(mark => mark.type === "em")
                    underline = node.marks.find(
                        mark => mark.type === "underline"
                    )
                    smallcaps = node.marks.find(
                        mark => mark.type === "smallcaps"
                    )
                    sup = node.marks.find(mark => mark.type === "sup")
                    sub = node.marks.find(mark => mark.type === "sub")
                }

                if (hyperlink) {
                    start += `<text:a xlink:type="simple" xlink:href="${escapeText(hyperlink.attrs.href)}">`
                    end = "</text:a>" + end
                }
                if (anchor) {
                    start += `<text:reference-mark-start text:name="${anchor.attrs.id}"/>`
                    end =
                        `<text:reference-mark-end text:name="${anchor.attrs.id}"/>` +
                        end

                    start += `<text:bookmark-start text:name="${anchor.attrs.id}"/>`
                    end =
                        `<text:bookmark-end text:name="${anchor.attrs.id}"/>` +
                        end
                }

                let attributes = ""

                if (em) {
                    attributes += "e"
                }
                if (strong) {
                    attributes += "s"
                }
                if (underline) {
                    attributes += "u"
                }
                if (smallcaps) {
                    attributes += "c"
                }
                if (sup) {
                    attributes += "p"
                } else if (sub) {
                    attributes += "b"
                }

                if (attributes.length) {
                    const styleId = this.styles.getInlineStyleId(attributes)
                    start += `<text:span text:style-name="T${styleId}">`
                    end = "</text:span>" + end
                }

                content += escapeText(node.text).replace(/^\s+|\s+$/g, match =>
                    "<text:s/>".repeat(match.length)
                )
                break
            }
            case "citation": {
                let cit
                // We take the first citation from the stack and remove it.
                if (options.inFootnote) {
                    cit = this.footnotes.citations.pmCits.shift()
                } else {
                    cit = this.citations.pmCits.shift()
                }
                if (options.citationType === "note" && !options.inFootnote) {
                    // If the citations are in notes (footnotes), we need to
                    // put the contents of this citation in a footnote.
                    start += `
                    <text:note text:id="ftn${this.fnAlikeCounter++}" text:note-class="footnote">
                        <text:note-citation>${this.fnAlikeCounter}</text:note-citation>
                        <text:note-body>`
                    end =
                        `
                        </text:note-body>
                    </text:note>` + end
                    options = Object.assign({}, options)
                    options.section = "Footnote"
                    content += this.transformRichtext(
                        {type: "paragraph", content: cit.content},
                        options
                    )
                } else {
                    cit.content.forEach(citContent => {
                        content += this.transformRichtext(citContent, options)
                    })
                }

                break
            }
            case "figure": {
                // NOTE: The difficulty is to make several images with different
                // alignments/widths not overlap one-another. The below code
                // makes a reasonable attempt at that, but it seems there is no
                // way to guarantee it from happening.
                options = Object.assign({}, options)
                options.section = "Standard"
                this.styles.checkParStyle(options.section)
                start += `<text:p text:style-name="${options.section}">`
                end = "</text:p>" + end

                if (node.attrs.aligned === "center") {
                    // Needed to prevent subsequent image from overlapping
                    end = end + '<text:p text:style-name="Standard"></text:p>'
                }
                const figureCaption = node.content.find(
                    node => node.type === "figure_caption"
                )
                let caption = node.attrs.caption
                    ? figureCaption?.content
                          ?.map((node, index) =>
                              this.transformRichtext(
                                  node,
                                  options,
                                  figureCaption,
                                  index
                              )
                          )
                          .join("") || ""
                    : ""
                // The figure category should not be in the
                // user's language but rather the document language
                const category = node.attrs.category
                if (category !== "none") {
                    const categoryCounter = options.inFootnote
                        ? this.fnCategoryCounter
                        : this.categoryCounter
                    if (!categoryCounter[category]) {
                        categoryCounter[category] = 1
                    }
                    const catCount = categoryCounter[category]++
                    const catCountXml = `<text:sequence text:ref-name="ref${category}${catCount - 1}${options.inFootnote ? "A" : ""}" text:name="${category}" text:formula="ooow:${category}+1" style:num-format="1">${catCount}${options.inFootnote ? "A" : ""}</text:sequence>`
                    if (caption.length) {
                        caption = `<text:bookmark-start text:name="${node.attrs.id}"/>${CATS[category][this.settings.language]} ${catCountXml}<text:bookmark-end text:name="${node.attrs.id}"/>: ${caption}`
                    } else {
                        caption = `<text:bookmark-start text:name="${node.attrs.id}"/>${CATS[category][this.settings.language]} ${catCountXml}<text:bookmark-end text:name="${node.attrs.id}"/>`
                    }
                }
                let relWidth = node.attrs.width
                let aligned = node.attrs.aligned
                let frame
                const image =
                    node.content.find(node => node.type === "image")?.attrs
                        .image || false
                if (caption.length || image === false) {
                    frame = true
                    this.styles.checkParStyle("Caption")
                    this.styles.checkParStyle("Figure")
                    const graphicStyleId = this.styles.getGraphicStyleId(
                        "Frame",
                        aligned
                    )
                    start += `<draw:frame draw:style-name="fr${graphicStyleId}" draw:name="Frame${graphicStyleId}" text:anchor-type="paragraph" svg:width="0.0161in" style:rel-width="${relWidth}%" draw:z-index="${this.zIndex++}">
                        <draw:text-box fo:min-height="0in">
                            <text:p text:style-name="Figure">`
                    relWidth = "100" // percentage width of image inside of frame is always 100
                    aligned = "center" // Aligned inside of frame is always 'center'
                    end =
                        `
                            </text:p>
                        </draw:text-box>
                    </draw:frame>` + end
                    if (caption.length) {
                        end = `<text:line-break />${caption}` + end
                    }
                }
                if (image !== false) {
                    const imageEntry = this.images.images[image]

                    const height = (imageEntry.height * 3) / 4 // more or less px to point
                    const width = (imageEntry.width * 3) / 4 // more or less px to point
                    const graphicStyleId = this.styles.getGraphicStyleId(
                        "Graphics",
                        aligned
                    )
                    content += `
                        <draw:frame draw:style-name="${graphicStyleId}" draw:name="Image${this.imgCounter++}" text:anchor-type="${frame && !blockInsert ? "char" : "as-char"}" style:rel-width="${relWidth}%" style:rel-height="scale" svg:width="${width}pt" svg:height="${height}pt" draw:z-index="${this.zIndex++}">
                            ${
                                imageEntry.svg
                                    ? `<draw:image xlink:href="Pictures/${imageEntry.svg}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad" draw:mime-type="image/svg+xml"/>`
                                    : ""
                            }
                            <draw:image xlink:href="Pictures/${imageEntry.id}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad" draw:mime-type="${imageEntry.type}"/>
                        </draw:frame>`
                } else {
                    const latex = node.content.find(
                        node => node.type === "figure_equation"
                    )?.attrs.equation
                    const objectNumber = this.math.addMath(latex)
                    const graphicStyleId =
                        this.styles.getGraphicStyleId("Formula")
                    content += `
                        <draw:frame draw:style-name="${graphicStyleId}" draw:name="Object${objectNumber}" text:anchor-type="as-char" draw:z-index="${this.zIndex++}">
                            <draw:object xlink:href="./Object ${objectNumber}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/>
                            <svg:desc>formula</svg:desc>
                        </draw:frame>`
                }
                if (category === "none") {
                    content = `<text:bookmark-start text:name="${node.attrs.id}"/>${content}<text:bookmark-end text:name="${node.attrs.id}"/>`
                }
                if (blockDelete) {
                    const trackId = this.tracks.addChange(
                        blockDelete,
                        `<text:p text:style-name="Figure">${content}<text:span>‍‍</text:span></text:p>`
                    )
                    content = `<text:change text:change-id="${trackId}"/>`
                }
                if (blockInsert) {
                    const trackId = this.tracks.addChange(blockInsert)
                    start += `<text:change-start text:change-id="${trackId}"/>`
                    end = `<text:change-end text:change-id="${trackId}"/>` + end
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
                if (options.listStyles) {
                    options.listStyles.forEach(listStyle => {
                        end =
                            `<text:list text:continue-numbering="true" text:style-name="${listStyle}"><text:list-item>` +
                            end
                        start += "</text:list-item></text:list>"
                    })
                }
                const tableCaption = node.content[0]
                let caption = node.attrs.caption
                    ? tableCaption?.content
                          ?.map((node, index) =>
                              this.transformRichtext(
                                  node,
                                  options,
                                  tableCaption,
                                  index
                              )
                          )
                          .join("") || ""
                    : ""
                // The table category should not be in the
                // user's language but rather the document language
                const category = node.attrs.category
                if (category !== "none") {
                    const categoryCounter = options.inFootnote
                        ? this.fnCategoryCounter
                        : this.categoryCounter
                    if (!categoryCounter[category]) {
                        categoryCounter[category] = 1
                    }
                    const catCount = categoryCounter[category]++
                    const catCountXml = `<text:sequence text:ref-name="ref${category}${catCount - 1}${options.inFootnote ? "A" : ""}" text:name="${category}" text:formula="ooow:${category}+1" style:num-format="1">${catCount}${options.inFootnote ? "A" : ""}</text:sequence>`
                    if (caption.length) {
                        caption = `<text:bookmark-start text:name="${node.attrs.id}"/>${CATS[category][this.settings.language]} ${catCountXml}<text:bookmark-end text:name="${node.attrs.id}"/>: ${caption}`
                    } else {
                        caption = `<text:bookmark-start text:name="${node.attrs.id}"/>${CATS[category][this.settings.language]} ${catCountXml}<text:bookmark-end text:name="${node.attrs.id}"/>`
                    }
                }
                if (caption.length) {
                    if (!options.section) {
                        options.section = "Text_20_body"
                    }
                    this.styles.checkParStyle(options.section)
                    start += `<text:p text:style-name="${options.section}">${caption}</text:p>`
                }
                const columns = node.content[1].content[0].content.length
                const styleId = this.styles.getTableStyleId(
                    node.attrs.aligned,
                    node.attrs.width
                )
                start += `<table:table table:name="Table${styleId}" table:style-name="Table${styleId}">`
                start += `<table:table-column table:number-columns-repeated="${columns}" />`
                end = "</table:table>" + end
                break
            }
            case "table_body":
                // Pass through to table.
                break
            case "table_caption":
                // We already deal with this in 'table'.
                return ""
            case "table_row":
                start += "<table:table-row>"
                end = "</table:table-row>" + end
                break
            case "table_cell":
            case "table_header":
                if (node.attrs.rowspan && node.attrs.colspan) {
                    start += `<table:table-cell${
                        node.attrs.rowspan > 1
                            ? ` table:number-rows-spanned="${node.attrs.rowspan}"`
                            : ""
                    }${
                        node.attrs.colspan > 1
                            ? ` table:number-columns-spanned="${node.attrs.colspan}"`
                            : ""
                    } office:value-type="string">`
                    end = "</table:table-cell>" + end
                } else {
                    start += "<table:covered-table-cell/>"
                }
                break
            case "equation": {
                const latex = node.attrs.equation
                const objectNumber = this.math.addMath(latex)
                const styleId = this.styles.getGraphicStyleId("Formula")
                content += `<draw:frame draw:style-name="${styleId}" draw:name="Object${objectNumber}" text:anchor-type="as-char" draw:z-index="${this.zIndex++}">
                        <draw:object xlink:href="./Object ${objectNumber}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/>
                        <svg:desc>formula</svg:desc>
                    </draw:frame>`
                break
            }
            case "cross_reference": {
                const title = node.attrs.title
                const id = node.attrs.id
                if (title) {
                    start += `<text:bookmark-ref text:reference-format="text" text:ref-name="${id}">`
                    end = "</text:bookmark-ref>" + end
                }
                content += escapeText(title || "MISSING TARGET")
                break
            }
            case "hard_break":
                content += "<text:line-break/>"
                break
            // CSL bib entries
            case "cslbib":
                options = Object.assign({}, options)
                options.section = "Bibliography_20_1"
                break
            case "cslblock":
                end = "<text:line-break/>" + end
                break
            case "cslleftmargin":
                end = "<text:tab/>" + end
                break
            case "cslindent":
                start += "<text:tab/>"
                end = "<text:line-break/>" + end
                break
            case "cslentry":
                this.styles.checkParStyle(options.section)
                start += `<text:p text:style-name="${options.section}">`
                end = "</text:p>" + end
                break
            case "cslinline":
            case "cslrightinline":
                break
            default:
                break
        }

        if (node.content) {
            for (let i = 0; i < node.content.length; i++) {
                content += this.transformRichtext(
                    node.content[i],
                    options,
                    node,
                    i
                )
            }
        }

        if (inlineNode) {
            const inlineInsert =
                node.marks?.find(
                    mark =>
                        mark.type === "insertion" &&
                        mark.attrs.approved === false
                )?.attrs || blockInsert
            const inlineDelete =
                node.marks?.find(mark => mark.type === "deletion")?.attrs ||
                options.blockDelete
            if (inlineDelete) {
                if (parent) {
                    const trackId = this.tracks.addChange(
                        Object.assign({type: "deletion"}, inlineDelete),
                        `<${TEXT_TYPES[parent.type]?.tag || "text:p"} ${TEXT_TYPES[parent.type]?.attrs(options) || `text:style-name="${options.section}"`}>${
                            start + content + end
                        }</${TEXT_TYPES[parent.type]?.tag || "text:p"}>`
                    )
                    content = `<text:change text:change-id="${trackId}"/>`
                } else {
                    content = ""
                }
                start = ""
                end = ""
            }
            if (inlineInsert) {
                const trackId = this.tracks.addChange(
                    Object.assign({type: "insertion"}, inlineInsert)
                )
                start += `<text:change-start text:change-id="${trackId}"/>`
                end = `<text:change-end text:change-id="${trackId}"/>` + end
            }
        }
        return start + content + end
    }
}
