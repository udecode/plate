import {parseCSL} from "biblatex-csl-converter"

import {applyAnnotation, applyMarkToNodes, mergeTextNodes} from "./helpers"

export class PandocConvert {
    constructor(doc, importId, template, bibliography) {
        this.doc = doc
        this.importId = importId
        this.template = template
        this.bibliography = bibliography

        this.images = []

        this.language = this.doc.meta?.lang?.c?.[0]?.c || "en-US"

        this.SMALL_IMAGE_THRESHOLD = 1.0 // Smaller images will be discarded (in inches)
    }

    init() {
        try {
            this.validatePandocFormat()
        } catch (error) {
            console.error("Pandoc format validation failed:", error)
            throw new Error("Invalid Pandoc document format: " + error.message)
        }

        return {
            content: this.convert(),
            settings: {
                import_id: this.importId,
                tracked: false,
                language: this.language
            }
        }
    }

    validatePandocFormat() {
        // Check API version (Pandoc uses [major, minor, patch])
        if (
            !Array.isArray(this.doc["pandoc-api-version"]) ||
            this.doc["pandoc-api-version"].length !== 3 ||
            !this.doc["pandoc-api-version"].every(
                num => typeof num === "number"
            )
        ) {
            throw new Error("Invalid or missing Pandoc API version")
        }

        // Check for required top-level properties
        if (!this.doc.blocks || !Array.isArray(this.doc.blocks)) {
            throw new Error("Missing or invalid blocks property")
        }

        // Check meta property structure if it exists
        if (this.doc.meta && typeof this.doc.meta !== "object") {
            throw new Error("Invalid meta property")
        }

        // Basic validation of block structure
        if (
            !this.doc.blocks.every(
                block =>
                    block &&
                    typeof block === "object" &&
                    typeof block.t === "string" &&
                    ("c" in block || block.t === "Null")
            )
        ) {
            throw new Error("Invalid block structure")
        }

        return true
    }

    convert() {
        const templateParts = this.template.content.content.slice()
        templateParts.shift()
        // Create the outer document structure
        const document = {
            type: "doc",
            attrs: {
                import_id: this.importId
            },
            content: []
        }

        // Add title (required first element)
        document.content.push({
            type: "title",
            content: this.convertInlines(
                this.doc.meta?.title?.c || [{t: "Str", c: "Untitled"}]
            )
        })
        // Add subtitle if present
        if (this.doc.meta?.subtitle?.c) {
            const templatePart = templateParts.find(
                part => part.attrs.metadata === "subtitle"
            )
            document.content.push({
                type: "heading_part",
                attrs: {
                    title: templatePart ? templatePart.attrs.title : "Subtitle",
                    id: templatePart ? templatePart.attrs.id : "subtitle",
                    metadata: "subtitle"
                },
                content: [
                    {
                        type: "heading1",
                        attrs: {
                            id: "H" + Math.random().toString(36).substr(2, 7)
                        },
                        content: this.convertInlines(this.doc.meta.subtitle.c)
                    }
                ]
            })
        }

        // Add authors if present
        if (this.doc.meta?.author?.c) {
            const templatePart = templateParts.find(
                part => part.attrs.metadata === "authors"
            )
            document.content.push({
                type: "contributors_part",
                attrs: {
                    title: templatePart ? templatePart.attrs.title : "Authors",
                    id: templatePart ? templatePart.attrs.id : "authors",
                    metadata: "authors"
                },
                content: this.doc.meta.author.c.map(author => ({
                    type: "contributor",
                    attrs: this.convertContributor(author)
                }))
            })
        }

        // Add abstract if present
        if (this.doc.meta?.abstract?.c) {
            const templatePart = templateParts.find(
                part => part.attrs.metadata === "abstract"
            )
            document.content.push({
                type: "richtext_part",
                attrs: {
                    title: templatePart
                        ? templatePart.attrs.title
                        : gettext("Abstract"),
                    id: templatePart ? templatePart.attrs.id : "abstract",
                    metadata: "abstract"
                },
                content: this.convertBlocks(this.doc.meta.abstract.c)
            })
        }

        const templatePart = templateParts.find(
            part => !part.attrs.metadata && part.type === "richtext_part"
        )
        // Add main body content
        document.content.push({
            type: "richtext_part",
            attrs: {
                title: templatePart ? templatePart.attrs.title : "Body",
                id: templatePart ? templatePart.attrs.id : "body",
                marks: ["strong", "em", "link"]
            },
            content: this.convertBlocks(this.doc.blocks)
        })

        return document
    }

    convertContributor(author) {
        const attrs = {
            firstname: "",
            lastname: "",
            email: "",
            institution: ""
        }

        // Extract name components
        if (author.c) {
            const textParts = author.c
                .filter(part => part.t === "Str")
                .map(part => part.c)

            if (textParts.length > 1) {
                attrs.lastname = textParts.pop()
                attrs.firstname = textParts.join(" ")
            } else if (textParts.length === 1) {
                attrs.lastname = textParts[0]
            }

            // Extract email from notes if present
            const note = author.c.find(part => part.t === "Note")
            if (note) {
                attrs.email = this.convertInlines(note.c[0].c)
                    .map(node => node.text)
                    .join("")
            }
        }

        return attrs
    }

    convertBlocks(blocks) {
        if (!blocks) {
            return []
        }
        return blocks
            .map(block => this.convertBlock(block))
            .flat()
            .filter(block => block)
    }

    convertBlock(block) {
        switch (block.t) {
            case "CodeBlock": {
                const [attrs, code] = block.c
                return [
                    {
                        type: "code_block",
                        attrs: {
                            track: [],
                            language: attrs?.classes?.[0] || "" // Store first class as language
                        },
                        content: [{type: "text", text: code}]
                    }
                ]
            }
            case "Div":
                // Handle special figure containers
                if (block.attr?.classes?.includes("figure")) {
                    return this.convertFigure(block)
                }
                // Ignore otherwise. Could be bibliography
                // or other non-content block
                return []
            case "Para":
            case "Plain": {
                // Process each inline, splitting into paragraphs and figures
                const blocks = []
                let currentInlines = []
                for (const inline of block.c) {
                    if (inline.t === "Image") {
                        // Convert accumulated inlines to a paragraph
                        if (currentInlines.length > 0) {
                            blocks.push({
                                type: "paragraph",
                                content: this.convertInlines(currentInlines)
                            })
                            currentInlines = []
                        }
                        // Convert image to figure and add as block
                        const figure = this.convertInline(inline)
                        blocks.push(figure)
                    } else {
                        currentInlines.push(inline)
                    }
                }
                // Add remaining inlines as a paragraph
                if (currentInlines.length > 0) {
                    blocks.push({
                        type: "paragraph",
                        content: this.convertInlines(currentInlines)
                    })
                }
                return blocks
            }
            case "Header":
                return [
                    {
                        type: `heading${block.c[0]}`,
                        attrs: {
                            id: block.c[1][0]
                        },
                        content: this.convertInlines(block.c[2])
                    }
                ]
            case "BlockQuote":
                return [
                    {
                        type: "blockquote",
                        content: this.convertBlocks(block.c)
                    }
                ]
            case "BulletList":
                return [
                    {
                        type: "bullet_list",
                        content: block.c.map(item => ({
                            type: "list_item",
                            content: this.convertBlocks(item)
                        }))
                    }
                ]
            case "DefinitionList": {
                return block.c.flatMap(item => [
                    {
                        type: "paragraph",
                        content: applyMarkToNodes(
                            this.convertInlines(item.term),
                            "strong"
                        )
                    },
                    {
                        type: "bullet_list",
                        content: item.definitions.map(def => ({
                            type: "list_item",
                            content: this.convertBlocks(def)
                        }))
                    }
                ])
            }
            case "OrderedList":
                return [
                    {
                        type: "ordered_list",
                        attrs: {
                            order: block.c[0][0]
                        },
                        content: block.c[1].map(item => ({
                            type: "list_item",
                            content: this.convertBlocks(item)
                        }))
                    }
                ]
            case "Table":
                return [this.convertTable(block)]
            case "Figure":
                return [this.convertFigure(block)]
            default:
                console.warn(`Unhandled block type: ${block.t}`)
                return []
        }
    }

    convertInlines(inlines) {
        if (!inlines) {
            return []
        }
        // Convert each inline element, flatten, and merge adjacent text nodes with same marks
        const convertedNodes = inlines
            .map(inline => this.convertInline(inline))
            .filter(inline => inline)
            .flat()

        // Remove hard breaks at start and end
        const filteredNodes = convertedNodes.filter((node, index, array) => {
            if (node.type === "hard_break") {
                // Remove if first or last node
                if (index === 0 || index === array.length - 1) {
                    return false
                }
            }
            return true
        })

        return mergeTextNodes(filteredNodes)
    }

    convertInline(inline) {
        if (!inline) {
            return null
        }

        switch (inline.t) {
            case "Cite":
                return this.convertCitation(inline)
            case "Image": {
                const imagePath = inline.c[2][0]

                const widthInfo = inline.c[0][2].find(
                    attr => attr[0] === "width"
                )

                if (widthInfo) {
                    const width = parseFloat(widthInfo[1]) // in inches
                    if (width < this.SMALL_IMAGE_THRESHOLD) {
                        console.warn(
                            `Skipping small decorative image: ${imagePath} (width: ${width}%)`
                        )
                        return null
                    }
                }

                const imageId = Math.floor(Math.random() * 1000000)
                const imageTitle = imagePath.split("/").pop()

                // Skip small decorative images

                // Store image reference
                this.images[imageId] = {
                    id: imageId,
                    title: imageTitle,
                    copyright: {
                        holder: false,
                        year: false,
                        freeToRead: true,
                        licenses: []
                    },
                    image: imagePath,
                    file_type: this.getImageFileType(imageTitle),
                    file: null,
                    checksum: 0
                }

                // Create a figure with optional caption
                const caption = inline.c[1] || []
                let category = "none"
                if (
                    caption.length &&
                    ["Figure", "Table", "Photo"].includes(caption[0].c)
                ) {
                    category = caption[0].c.toLowerCase()
                    caption.shift() // Category name, for example "Figure"
                    caption.shift() // Space
                    caption.shift() // Category number, for example "1:"
                    caption.shift() // Space
                }

                const percentageWidth = this.extractImageWidth(inline.c[0][2])
                return {
                    type: "figure",
                    attrs: {
                        aligned: "center",
                        width: percentageWidth,
                        category,
                        caption: Boolean(caption.length)
                    },
                    content: [
                        {
                            type: "image",
                            attrs: {
                                image: imageId
                            }
                        },
                        {
                            type: "figure_caption",
                            content: this.convertInlines(caption)
                        }
                    ]
                }
            }
            case "Str":
                return {
                    type: "text",
                    text: inline.c
                }
            case "Space":
                return {
                    type: "text",
                    text: " "
                }
            case "Strong": {
                const innerNodes = this.convertInlines(inline.c)
                return mergeTextNodes(applyMarkToNodes(innerNodes, "strong"))
            }
            case "Emph": {
                const innerNodes = this.convertInlines(inline.c)
                return mergeTextNodes(applyMarkToNodes(innerNodes, "em"))
            }
            case "Underline": {
                const innerNodes = this.convertInlines(inline.c)
                return mergeTextNodes(applyMarkToNodes(innerNodes, "underline"))
            }
            case "Strikeout": {
                const inner = this.convertInlines(inline.c)
                return applyAnnotation(inner, "strikeout")
            }
            case "SmallCaps": {
                const inner = this.convertInlines(inline.c)
                return applyAnnotation(inner, "smallcaps")
            }
            case "Superscript":
                return applyAnnotation(
                    this.convertInlines(inline.c),
                    "superscript"
                )
            case "Subscript":
                return applyAnnotation(
                    this.convertInlines(inline.c),
                    "subscript"
                )
            case "Link": {
                const innerNodes = this.convertInlines(inline.c[1])
                return mergeTextNodes(
                    applyMarkToNodes(innerNodes, "link", {href: inline.c[2][0]})
                )
            }
            case "Note": {
                if (
                    inline.c.length === 1 &&
                    inline.c[0].t === "Para" &&
                    inline.c[0].c.length === 2 &&
                    inline.c[0].c[0].t === "Cite" &&
                    inline.c[0].c[1].t === "Str" &&
                    inline.c[0].c[1].c === "."
                ) {
                    // This is a citation note rendered as a footnote.
                    return this.convertInline(inline.c[0].c[0])
                }

                return {
                    type: "footnote",
                    attrs: {
                        footnote: this.convertBlocks(inline.c)
                    }
                }
            }
            case "Math":
                return {
                    type: "equation",
                    attrs: {
                        equation: inline.c[1]
                    }
                }
            case "Quoted": {
                const type =
                    inline.c[0].t === "SingleQuote" ? "single" : "double"
                const quoteStart = type === "single" ? "‘" : "“" // U+2018, U+201C
                const quoteEnd = type === "single" ? "’" : "”" // U+2019, U+201D
                const innerNodes = this.convertInlines(inline.c[1])
                const quotedNodes = [
                    {type: "text", text: quoteStart},
                    ...innerNodes,
                    {type: "text", text: quoteEnd}
                ]
                return mergeTextNodes(quotedNodes)
            }
            case "RawBlock":
            case "RawInline": {
                return [
                    {
                        type: "text",
                        text: `[RAW CONTENT: ${inline.text}]`,
                        marks: [
                            {
                                type: "annotation_tag",
                                attrs: {
                                    type: "raw",
                                    key: inline.format,
                                    value: ""
                                }
                            }
                        ]
                    }
                ]
            }
            case "SoftBreak":
                return {type: "text", text: " "}
            case "LineBreak":
                return {type: "hard_break"}
            case "Span": {
                // Check if this is a Zotero CSL citation
                const attrs = inline.c[0][0]
                if (attrs && attrs.startsWith("ZOTERO_ITEM CSL_CITATION")) {
                    try {
                        // Extract just the JSON portion
                        const jsonStr = attrs.replace(
                            "ZOTERO_ITEM CSL_CITATION ",
                            ""
                        )
                        const lastBrace = jsonStr.lastIndexOf("}") + 1
                        const cslData = JSON.parse(
                            jsonStr.substring(0, lastBrace)
                        )

                        // Create citation references
                        const citations = cslData.citationItems.map(item => {
                            const id = String(item.itemData.id)

                            // find in bibliography
                            let [bibKey, _] =
                                Object.entries(this.bibliography).find(
                                    ([_key, entry]) => entry.entry_key === id
                                ) || []
                            if (!bibKey) {
                                // Not yet present in bibliography. We'll parse the CSL data and add it.
                                const parseData = parseCSL({
                                    [id]: item.itemData
                                })
                                const bibEntry = parseData["1"]
                                bibKey = `${Object.keys(this.bibliography).length + 1}`
                                this.bibliography[bibKey] = bibEntry
                            }
                            return {
                                id: bibKey,
                                prefix: item.prefix || "",
                                locator: item.locator || ""
                            }
                        })

                        return {
                            type: "citation",
                            attrs: {
                                format: "cite",
                                references: citations
                            }
                        }
                    } catch (error) {
                        console.warn("Failed to parse CSL citation:", error)
                    }
                }
                // If not a citation or parsing failed, fall through to regular text
                return this.convertInlines(inline.c[1])
            }
            default:
                console.warn(`Unhandled inline type: ${inline.t}`)
                return null
        }
    }

    extractImageWidth(attrs) {
        const widthAttr = attrs.find(attr => attr[0] === "width")
        if (widthAttr) {
            // Convert inch measurement to percentage (assuming max width is 8.5 inches)
            const widthInInches = parseFloat(widthAttr[1])
            return Math.min(Math.round((widthInInches / 8.5) * 100), 100)
        }
        return 100 // default width
    }

    convertTable(table) {
        const attrs = {
            width: 100,
            aligned: "center",
            layout: "fixed"
        }

        //c[0]: Attr
        //c[0][0]: identifier
        //c[0][1]: classes
        //c[0][2]: key-value pairs
        //c[1]: Caption
        //c[1][0]: Caption
        //c[1][1]: (Maybe ShortCaption)
        //c[2]: [ColSpec] // per table column
        //c[3]: TableHead
        //c[3][0]: Attrs
        //c[3][1]: Row
        //c[4]: [TableBody]
        //c[4][X][0]: Attr
        //c[4][X][1]: RowHeadColumns
        //c[4][X][2]: [Row]
        //c[4][X][3]: [Row]
        //c[5]: TableFoot
        //c[5][0]: Attrs
        //c[5][1]: Row

        //Row
        //c[0]: Attrs
        //c[1]: [Cell]

        //Cell
        //c[0]: Attr
        //c[1]: Alignment
        //c[2]: RowSpan
        //c[3]: ColSpan
        //c[4]: [Block]

        // Extract table attributes
        const tableAttrs = table.c[0][2]
        tableAttrs.forEach(attr => {
            if (attr[0] === "width") {
                attrs.width = parseInt(attr[1])
            } else if (attr[0] === "aligned") {
                attrs.aligned = attr[1]
            } else if (attr[0] === "layout") {
                attrs.layout = attr[1]
            }
        })

        const rows = table.c[3][1]
            .concat(
                table.c[4]
                    .map(tableBody => tableBody[2].concat(tableBody[3]))
                    .flat()
            )
            .concat(table.c[5][1])

        const caption = table.c[1][0] || []
        return {
            type: "table",
            attrs,
            content: [
                {
                    type: "table_caption",
                    content: this.convertInlines(caption)
                },
                {
                    type: "table_body",
                    content: rows.map(row => ({
                        type: "table_row",
                        content: row[1].map(cell => {
                            const cellContent = this.convertBlocks(cell[4])
                            if (cellContent.length === 0) {
                                cellContent.push({type: "paragraph"})
                            }
                            return {
                                type: "table_cell",
                                attrs: {
                                    colspan: cell[3],
                                    rowspan: cell[2]
                                },
                                content: cellContent
                            }
                        })
                    }))
                }
            ]
        }
    }

    getImageFileType(filename) {
        const ext = filename.split(".").pop().toLowerCase()
        switch (ext) {
            case "avif":
            case "avifs":
                return "image/avif"
            case "png":
                return "image/png"
            case "jpg":
            case "jpeg":
                return "image/jpeg"
            case "gif":
                return "image/gif"
            case "svg":
                return "image/svg+xml"
            case "webp":
                return "image/webp"
            default:
                return "image/png" // Default fallback
        }
    }

    convertFigure(figure) {
        const caption = figure.c[1][1]
        const attrs = {
            aligned: "center",
            width: 100,
            figureCategory: "none",
            caption: Boolean(caption.length)
        }

        // Extract figure attributes
        const figureAttrs = figure.c[0][2]
        figureAttrs.forEach(attr => {
            if (attr[0] === "width") {
                attrs.width = parseInt(attr[1])
            } else if (attr[0] === "aligned") {
                attrs.aligned = attr[1]
            } else if (attr[0] === "category") {
                attrs.figureCategory = attr[1]
            }
        })

        const imagePath = figure.c[2][0].c[0].c[2][0]
        const imageId = Math.floor(Math.random() * 1000000)
        const imageTitle = imagePath.split("/").pop()

        // Store image reference
        this.images[imageId] = {
            id: imageId,
            title: imageTitle,
            copyright: {
                holder: false,
                year: false,
                freeToRead: true,
                licenses: []
            },
            image: imagePath,
            file_type: this.getImageFileType(imageTitle),
            file: null,
            checksum: 0
        }

        return {
            type: "figure",
            attrs,
            content: [
                {
                    type: "image",
                    attrs: {
                        image: imageId
                    }
                },
                {
                    type: "figure_caption",
                    content: this.convertBlocks(caption)
                        .map(block => block.content || [])
                        .flat()
                }
            ]
        }
    }

    convertCitation(cite) {
        const references = cite.c[0]
            .map(ref => {
                // Handle empty bibliography case
                if (
                    !this.bibliography ||
                    Object.keys(this.bibliography).length === 0
                ) {
                    return
                }

                const foundEntry = Object.entries(this.bibliography).find(
                    ([_id, definition]) =>
                        definition.entry_key === ref.citationId
                )

                if (!foundEntry) {
                    return
                }

                const [bibId, _bibEntry] = foundEntry
                if (!bibId) {
                    return
                }
                return {
                    id: bibId,
                    prefix: ref.citationPrefix
                        .map(prefix => prefix.c)
                        .join(" "),
                    locator: ref.citationSuffix
                        .map(suffix => suffix.c)
                        .join(" ")
                }
            })
            .filter(ref => ref)

        if (!references.length) {
            return null
        }
        return {
            type: "citation",
            attrs: {
                format:
                    cite.c[0][0].citationMode.t === "AuthorInText"
                        ? "textcite"
                        : "cite",
                references
            }
        }
    }
}
