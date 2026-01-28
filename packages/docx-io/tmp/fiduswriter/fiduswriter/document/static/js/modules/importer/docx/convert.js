import {MathMLToLaTeX} from "mathml-to-latex"
import {xmlDOM} from "../../exporter/tools/xml"
import {randomFigureId, randomHeadingId} from "../../schema/common"
import {normalizeText} from "./helpers"
import {omml2mathml} from "./omml2mathml"
import {DocxParser} from "./parse"

export class DocxConvert {
    constructor(zip, importId, template, bibliography) {
        this.zip = zip
        this.importId = importId
        this.template = template
        this.bibliography = bibliography
        this.images = {}
        this.parser = new DocxParser(zip)
        this.tracks = {}
        this.currentTracks = []
    }

    async init() {
        await this.parser.init()
        const body = this.parser.document.query("w:body")
        if (!body) {
            return {
                content: {
                    type: "doc",
                    content: []
                },
                settings: {
                    import_id: this.importId,
                    tracked: false,
                    language: "en-US"
                },
                comments: {}
            }
        }
        // Find all reference targets in the document for cross-references
        this.referenceTargets = this.findReferenceTargets(this.parser.document)

        const convertedContent = this.convertDocument(body)
        // Convert document
        return {
            content: convertedContent,
            settings: {
                import_id: this.importId,
                tracked: this.hasTrackedChanges(this.parser.document),
                language: this.detectLanguage(this.parser.document)
            },
            comments: this.parser.comments
        }
    }

    convertDocument(body) {
        const templateParts = this.template.content.content.slice()
        templateParts.shift() // Remove first element

        const document = {
            type: "doc",
            attrs: {
                import_id: this.importId
            },
            content: []
        }
        // Add title (required first element)
        const title = this.extractTitle(body)
        document.content.push({
            type: "title",
            content: title.content || [
                {type: "text", text: gettext("Untitled")}
            ]
        })
        title.containerNodes.forEach(node => {
            node.parentElement.removeChild(node)
        })
        document.attrs.title =
            title.content.map(node => node.textContent).join("") ||
            gettext("Untitled")
        // Extract metadata sections
        const metadata = this.extractMetadata(body)
        metadata.forEach(({type, content}) => {
            const templatePart = templateParts.find(
                part => part.attrs.metadata === type
            )
            const attrs = {}
            if (templatePart.attrs.hidden) {
                attrs.hidden = false
            }
            if (templatePart) {
                document.content.push({
                    type: templatePart.type,
                    attrs: {
                        ...templatePart.attrs,
                        ...attrs
                    },
                    content: content.content
                })
                // Remove paragraphs from content so they are not added to body
                content.containerNodes.forEach(node => {
                    node.parentElement?.removeChild(node)
                })
            }
        })
        // Extract main content sections
        const sections = this.groupContentIntoSections(body)
        // Map sections to template parts
        sections.forEach(section => {
            const templatePart = this.findMatchingTemplatePart(
                section.title,
                templateParts
            )
            if (templatePart) {
                document.content.push({
                    type: "richtext_part",
                    attrs: {
                        title: templatePart.attrs.title,
                        id: templatePart.attrs.id,
                        metadata: templatePart.attrs.metadata || undefined,
                        marks: templatePart.attrs.marks || [
                            "strong",
                            "em",
                            "link"
                        ]
                    },
                    content: section.content
                })
            }
        })

        // Add remaining content to body section
        const unassignedContent = sections
            .filter(
                section =>
                    !this.findMatchingTemplatePart(section.title, templateParts)
            )
            .flatMap(section => section.content)

        if (unassignedContent.length) {
            const bodyTemplatePart = templateParts.find(
                part => !part.attrs.metadata && part.type === "richtext_part"
            )

            document.content.push({
                type: "richtext_part",
                attrs: {
                    title: bodyTemplatePart
                        ? bodyTemplatePart.attrs.title
                        : "Body",
                    id: bodyTemplatePart ? bodyTemplatePart.attrs.id : "body",
                    marks: ["strong", "em", "link"]
                },
                content: unassignedContent
            })
        }

        return document
    }

    extractMetadata(body) {
        const metadata = []
        // Extract authors if present
        const authors = this.extractAuthors(body)
        if (authors.content.length) {
            metadata.push({
                type: "authors",
                content: authors
            })
        }
        // Extract abstract if present
        const abstract = this.extractAbstract(body)
        if (abstract.content.length) {
            metadata.push({
                type: "abstract",
                content: abstract
            })
        }

        // Extract keywords if present
        const keywords = this.extractKeywords(body)
        if (keywords.content.length) {
            metadata.push({
                type: "keywords",
                content: keywords
            })
        }
        return metadata
    }

    extractAuthors(body) {
        const authors = []

        // Try to find author information in metadata
        const authorNodes = body
            .queryAll("w:pStyle", {"w:val": "Author"})
            .map(pStyle => pStyle.closest("w:p"))
            .filter(p => p)
        authorNodes.forEach(authorNode => {
            const authorText = this.getTextContent(authorNode)
            const [firstname = "", lastname = ""] = authorText.split(" ", 2)
            authors.push({
                type: "contributor",
                attrs: {
                    firstname,
                    lastname,
                    email: "",
                    institution: ""
                }
            })
        })
        if (authors.length) {
            return {
                content: authors,
                containerNodes: authorNodes
            }
        }
        // Also check Creator in document properties
        const creator = this.parser.coreDoc.query("dc:creator")?.textContent

        if (creator) {
            const [firstname = "", lastname = ""] = creator.split(" ", 2)

            return {
                content: [
                    {
                        type: "contributor",
                        attrs: {
                            firstname,
                            lastname,
                            email: "",
                            institution: ""
                        }
                    }
                ],
                containerNodes: []
            }
        }
        return {content: [], containerNodes: []}
    }

    extractAbstract(body) {
        // Look for section with Abstract style or heading
        const abstractNodes = body
            .queryAll("w:pStyle", {"w:val": "Abstract"})
            .map(pStyle => pStyle.closest("w:p"))
            .filter(p => p)
        if (abstractNodes.length) {
            return {
                content: abstractNodes.map(abstractNode =>
                    this.convertBlock(abstractNode)
                ),
                containerNodes: abstractNodes
            }
        }
        const extractedPart = this.extractPartOnTitle(body, ["Abstract"])
        if (extractedPart.content.length) {
            return {
                content: extractedPart.content.map(abstractNode =>
                    this.convertBlock(abstractNode)
                ),
                containerNodes: extractedPart.content.concat([
                    extractedPart.header
                ])
            }
        }
        return {content: [], containerNodes: []}
    }

    extractKeywords(body) {
        let extraNodes = []
        // Look for keywords section or metadata
        let keywordNodes = body
            .queryAll("w:pStyle", {"w:val": "Keywords"})
            .map(pStyle => pStyle.closest("w:p"))
            .filter(p => p)

        if (!keywordNodes.length) {
            // If no keywords section is found, look for a title called "Keywords"
            const extractedPart = this.extractPartOnTitle(
                body,
                ["Keywords", "Keywords:", "Keyword"],
                1
            )

            if (extractedPart.content.length) {
                keywordNodes = extractedPart.content
                extraNodes = extractedPart.header ? [extractedPart.header] : []
            }
        }

        if (keywordNodes) {
            return {
                content: keywordNodes
                    .map(keywordsNode => this.getTextContent(keywordsNode))
                    .flatMap(str => str.split(/[,;|:]+/)) // Split on multiple separators
                    .map(keyword => keyword.trim()) // Trim whitespace
                    .filter(keyword => keyword.length > 0)
                    .map(keyword => ({
                        type: "tag",
                        attrs: {
                            tag: keyword
                        }
                    })),
                containerNodes: keywordNodes.concat(extraNodes)
            }
        }

        return {content: [], containerNodes: []}
    }

    extractPartOnTitle(body, titleWords, maxPars = false) {
        // Fall back to heading starting with TITLEWORD in text
        if (typeof titleWords === "string") {
            titleWords = [titleWords]
        }
        const headingPars = body
            .queryAll("w:pStyle", {
                "w:val": [
                    "Heading1",
                    "Heading2",
                    "Heading3",
                    "Heading4",
                    "Heading5",
                    "Heading6",
                    "Heading7",
                    "Heading8",
                    "Heading9"
                ]
            })
            .map(pStyle => pStyle.closest("w:p"))
            .filter(p => p)
        const header = headingPars.find(p =>
            titleWords.includes(this.getTextContent(p).trim())
        )
        const content = []
        if (header && header.nextSibling) {
            //const content = []
            //const containerNodes = [sectionHeader]
            const headerLevel = this.getParaStyle(header).level
            let searchPar = header

            // Add everything to abstract until next heading with the same or lower level
            while (
                searchPar.nextSibling &&
                (!maxPars || content.length < maxPars)
            ) {
                searchPar = searchPar.nextSibling
                const paraStyle = this.getParaStyle(searchPar)
                if (paraStyle.isHeading && paraStyle.level <= headerLevel) {
                    break
                }
                content.push(searchPar)
            }
        }

        return {header, content}
    }

    groupContentIntoSections(body) {
        const sections = []
        let currentSection = {
            title: null,
            content: []
        }

        const skippedBlocks = []

        body.children.forEach(node => {
            if (skippedBlocks.includes(node)) {
                return
            }
            if (node.tagName !== "w:p") {
                return
            }

            const style = this.getParaStyle(node)
            const title = this.getSectionTitle(node, style)
            if (title && style.isHeading) {
                if (currentSection.content.length) {
                    sections.push(currentSection)
                }
                currentSection = {
                    title,
                    content: []
                }
            }

            const block = this.convertBlock(node, skippedBlocks)
            if (block) {
                currentSection.content.push(block)
            }
        })

        if (currentSection.content.length) {
            sections.push(currentSection)
        }

        return sections
    }

    getSectionTitle(node, style) {
        if (!node || !style) {
            return null
        }

        // For headings, use text content as section title
        if (style.isHeading && style.level <= 4) {
            return this.getTextContent(node)
        }

        // Check style name for section indicators
        if (style.name) {
            const name = style.name.toLowerCase()
            if (name.includes("section") || name.includes("title")) {
                return this.getTextContent(node)
            }
        }

        return null
    }

    findMatchingTemplatePart(sectionTitle, templateParts) {
        if (!sectionTitle) {
            return null
        }

        // Try exact match first
        let matchingPart = templateParts.find(
            part =>
                part.type === "richtext_part" &&
                !part.attrs.metadata &&
                part.attrs.title.toLowerCase() === sectionTitle.toLowerCase()
        )

        if (!matchingPart) {
            // Try fuzzy matching
            matchingPart = templateParts.find(
                part =>
                    part.type === "richtext_part" &&
                    !part.attrs.metadata &&
                    this.isSimilarTitle(part.attrs.title, sectionTitle)
            )
        }

        return matchingPart
    }

    isSimilarTitle(title1, title2) {
        const normalized1 = normalizeText(title1)
        const normalized2 = normalizeText(title2)

        return (
            normalized1.includes(normalized2) ||
            normalized2.includes(normalized1)
        )
    }

    getTextContent(node) {
        return node
            .queryAll("w:t")
            .map(t => t.textContent)
            .join("")
    }

    extractTitle(body) {
        // First try to find paragraph with Title style
        const titlePars = body
            .queryAll("w:pStyle", {"w:val": "Title"})
            .map(pStyle => pStyle.closest("w:p"))
            .filter(p => p)

        if (titlePars.length) {
            return {
                content: this.convertInline(titlePars[0]),
                containerNodes: [titlePars[0]]
            }
        }

        // Fall back to first heading
        const headingPars = body
            .queryAll("w:pStyle", {
                "w:val": [
                    "Heading1",
                    "Heading2",
                    "Heading3",
                    "Heading4",
                    "Heading5",
                    "Heading6",
                    "Heading7",
                    "Heading8",
                    "Heading9"
                ]
            })
            .map(pStyle => pStyle.closest("w:p"))
            .filter(p => p)
        if (headingPars.length) {
            return {
                content: this.convertInline(headingPars[0]),
                containerNodes: [headingPars[0]]
            }
        }

        return {
            content: [
                {
                    type: "text",
                    text: gettext("Untitled")
                }
            ],
            containerNodes: []
        }
    }

    convertBlock(node, skippedBlocks = []) {
        if (node.tagName !== "w:p") {
            return null
        }
        let converted
        const style = this.getParaStyle(node)
        if (style.isHeading) {
            converted = this.convertHeading(node, style)
        } else if (style.numbering) {
            converted = this.convertListItem(node, style)
        } else if (
            style.isCaption &&
            (node.query("w:drawing") || node.query("w:pict"))
        ) {
            converted = this.convertFigure(node, node)
        } else if (
            style.isCaption &&
            (node.nextSibling?.query("w:drawing") ||
                node.nextSibling?.query("w:pict")) &&
            !skippedBlocks.includes(node.nextSibling)
        ) {
            skippedBlocks.push(node.nextSibling)
            converted = this.convertFigure(node.nextSibling, node)
        } else if (node.query("w:drawing") || node.query("w:pict")) {
            if (
                node.nextSibling &&
                this.getParaStyle(node.nextSibling).isCaption
            ) {
                skippedBlocks.push(node.nextSibling)
                converted = this.convertFigure(node, node.nextSibling)
            } else {
                converted = this.convertFigure(node)
            }
        } else {
            converted = this.convertParagraph(node)
        }
        return this.wrapTrackChanges(node, converted)
    }

    wrapTrackChanges(node, content) {
        if (!content || !node.previousSibling) {
            return content
        }
        const track = this.getTracksFromNode(node.previousSibling)
        if (!track) {
            return content
        }

        return {
            ...content,
            attrs: Object.assign({}, content.attrs || {}, {track})
        }
    }

    getTracksFromNode(node) {
        const deletion = node.query("w:pPr")?.query("w:del")
        const insertion = node.query("w:pPr")?.query("w:ins")

        const tracks = []

        if (insertion) {
            const date = new Date(insertion.getAttribute("w:date"))
            const date10 = Math.floor(date.getTime() / 60000) * 10
            tracks.push({
                type: "insertion",
                user: 0, // Default user ID
                username: insertion.getAttribute("w:author"),
                date: date10
            })
        }

        if (deletion) {
            const date = new Date(deletion.getAttribute("w:date"))
            const date10 = Math.floor(date.getTime() / 60000) * 10
            tracks.push({
                type: "deletion",
                user: 0, // Default user ID
                username: deletion.getAttribute("w:author"),
                date: date10
            })
        }

        if (tracks.length === 0) {
            return null
        }

        return tracks
    }

    getParaStyle(node) {
        const pStyle = node.query("w:pStyle")
        const styleId = pStyle?.getAttribute("w:val")
        const style = this.parser.styles[styleId] || {}

        const numPr = node.query("w:numPr")
        const numId = numPr?.query("w:numId")?.getAttribute("w:val")
        const ilvl = parseInt(
            numPr?.query("w:ilvl")?.getAttribute("w:val") || "0"
        )

        return {
            ...style,
            numbering: numId
                ? {
                      id: numId,
                      level: ilvl,
                      definition: this.parser.numbering[numId]
                  }
                : null
        }
    }

    convertParagraph(node) {
        return {
            type: "paragraph",
            content: this.convertInline(node)
        }
    }

    convertHeading(node, style) {
        return {
            type: `heading${style.level}`,
            attrs: {
                id: randomHeadingId(),
                level: style.level
            },
            content: this.convertInline(node)
        }
    }

    convertListItem(node, style) {
        const numbering = style.numbering
        const level = numbering.definition?.levels[numbering.level]

        return {
            type: level?.format === "bullet" ? "bullet_list" : "ordered_list",
            attrs: {
                id: `L${Math.random().toString(36).slice(2)}`,
                level: numbering.level,
                start: level?.start || 1
            },
            content: [
                {
                    type: "list_item",
                    content: [this.convertParagraph(node)]
                }
            ]
        }
    }

    convertFigure(node, captionNode = null) {
        let captionBlock, captionOrder
        if (captionNode) {
            captionBlock = this.convertParagraph(captionNode)
            captionOrder = node.nextSibling === captionNode ? "after" : "before"
        }

        const drawing = node.query("w:drawing")
        if (!drawing) {
            return null
        }

        const blip = drawing.query("a:blip")
        if (!blip) {
            return null
        }

        const rId = blip.getAttribute("r:embed")
        const rel = this.parser.relationships[rId]
        if (!rel) {
            return null
        }

        const imagePath = rel.target.split("/").pop()
        const imageBlob = this.parser.images[imagePath]

        if (!imageBlob) {
            return null
        }

        // <a:ext cx="5753598" cy="4463556" />
        //
        const size = drawing.query("a:ext")
        const width = parseInt(size.getAttribute("cx") || 0) / 9525 // In EMUs
        const height = parseInt(size.getAttribute("cy") || 0) / 9525 // In EMUs

        const imageId = Math.floor(Math.random() * 1000000)
        this.images[imageId] = {
            id: imageId,
            title: imagePath,
            image: imagePath,
            file: imageBlob,

            copyright: {
                holder: false,
                year: false,
                freeToRead: true,
                licenses: []
            },
            checksum: 0,
            width,
            height
        }

        const image = {
            type: "image",
            attrs: {
                image: imageId
            }
        }

        const caption = {
            type: "figure_caption",
            content: captionBlock?.content || []
        }

        const content =
            captionOrder === "before" ? [caption, image] : [image, caption]

        return {
            type: "figure",
            attrs: {
                id: randomFigureId(),
                aligned: "center",
                width: 100,
                caption: !!captionBlock
            },
            content
        }
    }

    convertInline(node) {
        const content = []

        // We'll process all nodes (runs and hyperlinks) in their original order
        const children = []

        // Collect all direct children that we need to process in order
        // This includes both w:r (runs) and w:hyperlink elements
        node.children.forEach(child => {
            if (["w:r", "w:hyperlink", "m:oMath"].includes(child.tagName)) {
                children.push(child)
            }
        })

        // Process each child in document order
        children.forEach(child => {
            if (child.tagName === "w:hyperlink") {
                // Process hyperlink
                const rId = child.getAttribute("r:id")
                const anchor = child.getAttribute("w:anchor")
                const relationship = rId ? this.parser.relationships[rId] : null
                const href =
                    relationship?.target || (anchor ? `#${anchor}` : null)

                if (href) {
                    const runs = child.queryAll("w:r")
                    const text = runs
                        .map(run => run.query("w:t")?.textContent || "")
                        .join("")

                    if (text) {
                        // Check if this is an internal link (bookmark reference) that should be a cross-reference
                        if (anchor && this.referenceTargets[anchor]) {
                            // If the link text is similar to the target text, treat it as a cross-reference
                            const target = this.referenceTargets[anchor]
                            const targetText = target.text || anchor

                            // Compare normalized versions to check if text matches target
                            if (
                                normalizeText(text) ===
                                    normalizeText(targetText) ||
                                // Also check for "Figure X: " or "Table X: " style references
                                text.match(
                                    /^(Figure|Table|Equation)\s+\d+(\.\d+)*(\:|\.)?\s*$/i
                                )
                            ) {
                                content.push(
                                    this.convertCrossReference(anchor, text)
                                )
                                return
                            }
                        }

                        // Otherwise, treat as a normal link
                        const rPr = runs[0]?.query("w:rPr")
                        const formatting = rPr
                            ? this.parser.extractRunProperties(rPr)
                            : {}

                        const marks = this.createMarksFromFormatting(formatting)
                        marks.push({
                            type: "link",
                            attrs: {href, title: text}
                        })

                        content.push({
                            type: "text",
                            text,
                            marks
                        })
                    }
                }
            } else if (child.tagName === "w:r") {
                // Process regular run

                // Skip processing if this run is part of a complex field code
                // This avoids duplicate text content from field codes
                if (
                    child.query("w:fldChar")?.getAttribute("w:fldCharType") !==
                    undefined
                ) {
                    return
                }

                // Process footnote references
                const footnoteRef = child.query("w:footnoteReference")
                if (footnoteRef) {
                    const footnoteId = footnoteRef.getAttribute("w:id")
                    if (this.parser.footnotes[footnoteId]) {
                        content.push(this.convertFootnote(footnoteId))
                    }
                    return
                }

                // Process endnote references
                const endnoteRef = child.query("w:endnoteReference")
                if (endnoteRef) {
                    const endnoteId = endnoteRef.getAttribute("w:id")
                    if (this.parser.endnotes[endnoteId]) {
                        content.push(this.convertFootnote(endnoteId, true))
                    }
                    return
                }

                // Process text with formatting
                const text =
                    child.query("w:t")?.textContent ||
                    child.query("w:delText")?.textContent
                if (!text) {
                    // Process line breaks
                    if (child.query("w:br")) {
                        content.push({type: "hard_break"})
                    }
                    return
                }

                const rPr = child.query("w:rPr")
                const formatting = rPr
                    ? this.parser.extractRunProperties(rPr)
                    : {}
                const insertion = child.closest("w:ins")
                const deletion = child.closest("w:del")

                content.push({
                    type: "text",
                    text,
                    marks: this.createMarksFromFormatting(
                        formatting,
                        insertion,
                        deletion
                    )
                })
            } else if (child.tagName === "m:oMath") {
                const equationNode = this.convertEquation(child)
                if (equationNode) {
                    content.push(equationNode)
                }
            }
        })

        // Process cross-references from field codes
        const fields = this.extractFieldContents(node)
        fields.forEach(field => {
            if (field.type === "REF" && field.target) {
                // Find where this reference should be placed
                // For simplicity, we're just appending them, but ideally
                // you'd want to insert them at the correct position
                // This is a limitation of the current approach
                content.push(
                    this.convertCrossReference(field.target, field.text)
                )
            }
        })

        return content
    }

    // Method to help process cross-references in documents
    findReferenceTargets(document) {
        const targets = {}

        // Find bookmarks
        document.queryAll("w:bookmarkStart").forEach(bookmark => {
            const id = bookmark.getAttribute("w:id")
            const name = bookmark.getAttribute("w:name")
            if (id && name) {
                targets[name] = {
                    id: name,
                    type: "bookmark"
                }
            }
        })

        // Find headings (with styles like Heading1, Heading2, etc.)
        document.queryAll("w:pStyle").forEach(pStyle => {
            const val = pStyle.getAttribute("w:val")
            if (val && val.match(/^Heading\d+$/)) {
                const paragraph = pStyle.closest("w:p")
                if (paragraph) {
                    const text = this.getTextContent(paragraph)
                    // Create an ID from the heading text
                    const id = text
                        .trim()
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/\s+/g, "-")

                    targets[id] = {
                        id: id,
                        type: "heading",
                        text: text
                    }
                }
            }
        })

        return targets
    }

    convertFootnote(id, isEndnote = false) {
        const footnoteContent = isEndnote
            ? this.parser.endnotes[id].content
            : this.parser.footnotes[id].content

        // Convert the footnote content to our document model
        const content = []
        footnoteContent.forEach(block => {
            if (block.type === "paragraph") {
                content.push({
                    type: "paragraph",
                    content: block.content.map(node => {
                        if (node.type === "text") {
                            return {
                                type: "text",
                                text: node.text,
                                marks: node.marks || []
                            }
                        }
                        return node
                    })
                })
            }
        })

        return {
            type: "footnote",
            attrs: {
                footnote: content
            }
        }
    }

    convertEquation(oMathNode) {
        // Extract OMML content and convert to MathML
        const mmlNode = omml2mathml(oMathNode)
        const latex = MathMLToLaTeX.convert(mmlNode.outerXML)
        return {
            type: "equation",
            attrs: {
                equation: latex
            }
        }
    }

    simplifiedOmmlToLatex(omml) {
        // This is a very basic conversion - in a real implementation you would
        // use a library like MathML-to-LaTeX or implement a more complete converter

        // Extract text content as a fallback
        const textContent = omml
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()

        // If the OMML contains a fraction
        if (omml.includes("<m:f>")) {
            const numMatch = omml.match(/<m:num>(.*?)<\/m:num>/s)
            const denMatch = omml.match(/<m:den>(.*?)<\/m:den>/s)

            if (numMatch && denMatch) {
                const num = numMatch[1].replace(/<[^>]+>/g, "").trim()
                const den = denMatch[1].replace(/<[^>]+>/g, "").trim()
                return `\\frac{${num}}{${den}}`
            }
        }

        // If it contains a superscript
        if (omml.includes("<m:sup>")) {
            const baseMatch = omml.match(/<m:e>(.*?)<\/m:e>/s)
            const supMatch = omml.match(/<m:sup>(.*?)<\/m:sup>/s)

            if (baseMatch && supMatch) {
                const base = baseMatch[1].replace(/<[^>]+>/g, "").trim()
                const sup = supMatch[1].replace(/<[^>]+>/g, "").trim()
                return `${base}^{${sup}}`
            }
        }

        // If it contains a subscript
        if (omml.includes("<m:sub>")) {
            const baseMatch = omml.match(/<m:e>(.*?)<\/m:e>/s)
            const subMatch = omml.match(/<m:sub>(.*?)<\/m:sub>/s)

            if (baseMatch && subMatch) {
                const base = baseMatch[1].replace(/<[^>]+>/g, "").trim()
                const sub = subMatch[1].replace(/<[^>]+>/g, "").trim()
                return `${base}_{${sub}}`
            }
        }

        // Return a simplified representation with the text content
        return textContent || "x^2" // Default fallback
    }

    extractFieldContents(node) {
        // This method extracts field code information from Word documents
        // Field codes are used for cross-references, page numbers, etc.
        const fields = []
        let currentField = null
        let collectingInstrText = false
        let collectingFieldResult = false

        // Process all runs in the node to find field codes
        const runs = node.queryAll("w:r")

        for (let i = 0; i < runs.length; i++) {
            const run = runs[i]

            // Check for field chars which mark the beginning/end of fields
            const fieldChar = run.query("w:fldChar")
            if (fieldChar) {
                const type = fieldChar.getAttribute("w:fldCharType")

                if (type === "begin") {
                    // Start a new field
                    currentField = {
                        type: null,
                        text: "",
                        target: null
                    }
                    collectingInstrText = true
                    collectingFieldResult = false
                } else if (type === "separate") {
                    // Switch from collecting instruction to collecting result
                    collectingInstrText = false
                    collectingFieldResult = true

                    // Parse the instruction text to determine field type and parameters
                    if (currentField && currentField.text) {
                        const instr = currentField.text.trim()

                        // Handle REF fields (cross-references)
                        if (instr.startsWith("REF ")) {
                            currentField.type = "REF"
                            // Extract the target bookmark/heading ID
                            const parts = instr.substring(4).trim().split(/\s+/)
                            if (parts.length > 0) {
                                currentField.target = parts[0]
                            }
                        }
                        // Could add more field types here as needed
                    }
                } else if (type === "end") {
                    // End the current field and add it to the list
                    if (currentField) {
                        fields.push(currentField)
                        currentField = null
                    }
                    collectingInstrText = false
                    collectingFieldResult = false
                }
            } else {
                // Process the content of the field
                if (collectingInstrText) {
                    // Collecting the instruction text
                    const instrText = run.query("w:instrText")
                    if (instrText && currentField) {
                        currentField.text += instrText.textContent
                    }
                } else if (collectingFieldResult && currentField) {
                    // Collecting the result text (what's displayed in Word)
                    const text = run.query("w:t")?.textContent || ""
                    currentField.text = text || currentField.text
                }
            }
        }

        return fields
    }

    convertCrossReference(targetId, displayText) {
        // Look up the target in our reference targets
        const target = this.referenceTargets[targetId]

        // If we found the target, use its information
        if (target) {
            return {
                type: "cross_reference",
                attrs: {
                    id: targetId,
                    title: displayText || target.text || targetId
                }
            }
        }

        // If target not found, create a reference with the display text or target ID
        return {
            type: "cross_reference",
            attrs: {
                id: targetId,
                title: displayText || targetId
            }
        }
    }

    createMarksFromFormatting(formatting, insertion = null, deletion = null) {
        const marks = []
        if (formatting.bold) {
            marks.push({type: "strong"})
        }
        if (formatting.italic) {
            marks.push({type: "em"})
        }
        if (formatting.underline) {
            marks.push({type: "underline"})
        }
        if (insertion) {
            const date = new Date(insertion.getAttribute("w:date"))
            const date10 = Math.floor(date.getTime() / 600000) * 10
            marks.push({
                type: "insertion",
                attrs: {
                    user: 0,
                    username: insertion.getAttribute("w:author"),
                    date: date10,
                    approved: false
                }
            })
        }
        if (deletion) {
            const date = new Date(deletion.getAttribute("w:date"))
            const date10 = Math.floor(date.getTime() / 600000) * 10
            marks.push({
                type: "deletion",
                attrs: {
                    user: 0,
                    username: deletion.getAttribute("w:author"),
                    date: date10
                }
            })
        }
        return marks
    }

    hasTrackedChanges(doc) {
        return Boolean(doc.query("w:ins") || doc.query("w:del"))
    }

    detectLanguage(doc) {
        return doc.query("w:lang")?.getAttribute("w:val") || "en-US"
    }
}
