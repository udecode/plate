import {parseCSL} from "biblatex-csl-converter"
import {MathMLToLaTeX} from "mathml-to-latex"

import {xmlDOM} from "../../exporter/tools/xml"
import {
    randomCommentId,
    randomFigureId,
    randomHeadingId,
    randomListId,
    randomTableId
} from "../../schema/common"
import {parseTracks} from "../../schema/common/track"

export class OdtConvert {
    constructor(
        contentXml,
        stylesXml,
        manifestXml,
        importId,
        template,
        bibliography
    ) {
        this.importId = importId
        this.template = template
        this.bibliography = bibliography
        this.images = {}
        this.styles = {}

        this.contentDoc = contentXml ? xmlDOM(contentXml) : null
        this.stylesDoc = stylesXml ? xmlDOM(stylesXml) : null
        this.manifestDoc = manifestXml ? xmlDOM(manifestXml) : null

        this.tracks = {}
        this.comments = {}
        this.currentCommentIds = []
        this.currentTracks = []
        this.referenceableObjects = {} // All objects that can be referenced
    }

    init() {
        this.parseTrackedChanges()
        this.parseStyles()
        this.parseComments()

        this.collectReferenceableObjects(this.contentDoc)
        const content = this.convert()
        return {
            content,
            settings: {
                import_id: this.importId,
                tracked: Object.keys(this.tracks).length > 0,
                language: this.detectLanguage()
            },
            comments: this.comments
        }
    }

    parseTrackedChanges() {
        const trackedChangesEl = this.contentDoc.query("text:tracked-changes")
        if (!trackedChangesEl) {
            return
        }

        // Tracked deletions are stored in two different ways in FW and ODT.
        // FW: The deleted content stays in place where it was before the deletion,
        // and is marked with a tracked change mark. Megre only occurs after change
        // has been accepted.
        // ODT: The deleted content is removed from the content flow and is replaced by a marker.
        // The removed content is stored in a special section of the document.
        // This method takes all the deleted content and puts it back into the place where
        // it was previously. That way the structure is more similar to the output FW document
        // and is more easily converted.
        const deletions = {}

        const changedRegions = trackedChangesEl.queryAll("text:changed-region")
        changedRegions.forEach(region => {
            const id = region.getAttribute("text:id")

            const insertion = region.query("text:insertion")
            const deletion = region.query("text:deletion")
            if (!insertion && !deletion) {
                // Neither insertion or deletion. Must be type unknown to us
                return
            }
            const changeInfo = region.query("office:change-info")
            if (changeInfo) {
                const track = {
                    type: insertion ? "insertion" : "deletion",
                    user: 1,
                    username: changeInfo.query("dc:creator")?.textContent || "",
                    date: parseInt(
                        new Date(
                            changeInfo.query("dc:date")?.textContent || ""
                        ).getTime() / 60000
                    )
                }
                if (insertion) {
                    track.approved = false
                }
                this.tracks[id] = track

                if (deletion) {
                    // Store deletion content for later use
                    deletions[id] = deletion.children.filter(
                        child => child.tagName !== "office:change-info"
                    )
                }
            }
        })

        // Then find and replace all deletion change markers
        const changeMarkers = this.contentDoc.queryAll("text:change")
        changeMarkers.forEach(marker => {
            const changeId = marker.getAttribute("text:change-id")
            const deletion = deletions[changeId]
            if (deletion) {
                if (deletion.length > 0) {
                    // Create change-start and change-end elements
                    const markerIndex =
                        marker.parentElement.children.indexOf(marker)

                    marker.parentElement.insertXMLAt(
                        `<text:change-start text:change-id="${changeId}"/>`,
                        markerIndex
                    )
                    marker.parentElement.insertXMLAt(
                        `<text:change-end text:change-id="${changeId}"/>`,
                        markerIndex + 2
                    )

                    if (deletion.length === 1) {
                        // Single block - just insert the content
                        deletion[0].children.forEach(content => {
                            marker.parentElement.insertBefore(content, marker)
                        })
                    } else {
                        // Multiple blocks - need to split the paragraph/headline
                        const parentElement = marker.parentElement
                        parentElement.splitAtChildElement(
                            marker,
                            deletion[0].children
                                ?.map(node => node.toString())
                                .join("") || "", // First block content to be added to current node
                            deletion
                                .slice(1, -1)
                                .map(node => node.toString())
                                .join(""), // Middle blocks
                            deletion[deletion.length - 1].toString() // Last block
                        )
                    }
                }
                // Remove the original change marker
                marker.parentElement.removeChild(marker)
            }
        })
    }

    parseStyles() {
        if (!this.stylesDoc) {
            return
        }
        const styleNodes = this.stylesDoc.queryAll("style:style")
        styleNodes.forEach(node => {
            const styleName = node.getAttribute("style:name")
            this.styles[styleName] = this.parseStyle(node)
        })
        const contentStyleNodes = this.contentDoc.queryAll("style:style")
        contentStyleNodes.forEach(node => {
            const styleName = node.getAttribute("style:name")
            this.styles[styleName] = this.parseStyle(node)
        })
    }

    parseStyle(styleNode) {
        const properties = {
            // Basic style information
            parentStyleName: styleNode.getAttribute("style:parent-style-name"),
            isSection:
                styleNode.getAttribute("style:family") === "section" ||
                Boolean(styleNode.query("style:section-properties")),
            title: styleNode.getAttribute("style:display-name"),

            // Family and name info
            family: styleNode.getAttribute("style:family"),
            name: styleNode.getAttribute("style:name"),

            // Heading related
            isHeading:
                styleNode.getAttribute("style:family") === "paragraph" &&
                (styleNode
                    .getAttribute("style:name")
                    .toLowerCase()
                    .includes("heading") ||
                    styleNode
                        .getAttribute("style:parent-style-name")
                        ?.toLowerCase()
                        .includes("heading")),
            outlineLevel: styleNode.getAttribute("text:outline-level"),

            // Text properties
            textProperties: {},

            // Paragraph properties
            paragraphProperties: {},

            // Section properties
            sectionProperties: {}
        }

        // Parse text properties
        const textProperties = styleNode.query("style:text-properties")
        if (textProperties) {
            properties.textProperties = {
                bold: textProperties.getAttribute("fo:font-weight") === "bold",
                italic:
                    textProperties.getAttribute("fo:font-style") === "italic",
                fontSize: this.convertLength(
                    textProperties.getAttribute("fo:font-size")
                ),
                fontFamily: textProperties.getAttribute("fo:font-family"),
                color: textProperties.getAttribute("fo:color"),
                backgroundColor: textProperties.getAttribute(
                    "fo:background-color"
                ),
                textDecoration:
                    textProperties.getAttribute("style:text-underline-style") ||
                    textProperties.getAttribute("style:text-line-through-style")
            }
        }

        // Parse paragraph properties
        const paragraphProperties = styleNode.query(
            "style:paragraph-properties"
        )
        if (paragraphProperties) {
            properties.paragraphProperties = {
                marginTop: this.convertLength(
                    paragraphProperties.getAttribute("fo:margin-top")
                ),
                marginBottom: this.convertLength(
                    paragraphProperties.getAttribute("fo:margin-bottom")
                ),
                marginLeft: this.convertLength(
                    paragraphProperties.getAttribute("fo:margin-left")
                ),
                marginRight: this.convertLength(
                    paragraphProperties.getAttribute("fo:margin-right")
                ),
                textAlign: paragraphProperties.getAttribute("fo:text-align"),
                lineHeight: paragraphProperties.getAttribute("fo:line-height"),
                backgroundColor: paragraphProperties.getAttribute(
                    "fo:background-color"
                ),
                padding: this.convertLength(
                    paragraphProperties.getAttribute("fo:padding")
                ),
                borderStyle: paragraphProperties.getAttribute("fo:border-style")
            }
        }

        // Parse section properties
        const sectionProperties = styleNode.query("style:section-properties")
        if (sectionProperties) {
            properties.sectionProperties = {
                columnCount: sectionProperties.getAttribute("fo:column-count"),
                columnGap: this.convertLength(
                    sectionProperties.getAttribute("fo:column-gap")
                ),
                backgroundColor: sectionProperties.getAttribute(
                    "fo:background-color"
                ),
                margins: {
                    top: this.convertLength(
                        sectionProperties.getAttribute("fo:margin-top")
                    ),
                    bottom: this.convertLength(
                        sectionProperties.getAttribute("fo:margin-bottom")
                    ),
                    left: this.convertLength(
                        sectionProperties.getAttribute("fo:margin-left")
                    ),
                    right: this.convertLength(
                        sectionProperties.getAttribute("fo:margin-right")
                    )
                }
            }
        }

        // Additional table-specific properties
        if (styleNode.getAttribute("style:family") === "table") {
            properties.tableProperties = {
                align: styleNode.getAttribute("table:align"),
                width: this.convertLength(
                    styleNode.getAttribute("style:width")
                ),
                relWidth: styleNode.getAttribute("style:rel-width")
            }
        }

        return properties
    }

    convertObject(node, attrs) {
        const mathEl = node.query("math")
        if (mathEl) {
            attrs = Object.assign(
                {
                    equation: MathMLToLaTeX.convert(mathEl.innerXML)
                },
                attrs
            )
            return {
                type: "equation",
                attrs
            }
        }
        return null
    }

    parseComments() {
        const annotations = this.contentDoc.queryAll("office:annotation")
        annotations.forEach(annotation => {
            const username = annotation.query("dc:creator")?.textContent || ""
            const date = new Date(
                annotation.query("dc:date")?.textContent || ""
            ).getTime()

            const id = (annotation.getAttribute("office:name") || "")
                .replace(/\D/g, "")
                .slice(0, 9)

            if (id) {
                // main comment
                this.comments[id] = {
                    user: 0,
                    username,
                    date,
                    comment: annotation
                        .queryAll("text:p")
                        .map(par => this.convertBlockNode(par))
                        .filter(par => par),
                    answers: [],
                    resolved:
                        annotation.getAttribute("loext:resolved") === "true"
                }
            } else {
                const parentId = (
                    annotation.getAttribute("loext:parent-name") || ""
                )
                    .replace(/\D/g, "")
                    .slice(0, 9)
                if (parentId && this.comments[parentId]) {
                    this.comments[parentId].answers.push({
                        id: randomCommentId(),
                        user: 0,
                        username,
                        date,
                        // drop the frist paragraph. It only contains "Reply to...."
                        answer: annotation
                            .queryAll("text:p")
                            .slice(1)
                            .map(par => this.convertBlockNode(par))
                            .filter(par => par)
                    })
                }
            }
        })
    }

    collectReferenceableObjects(node) {
        // Handle heading bookmarks
        const bookmarkStarts = node.queryAll("text:bookmark-start")
        bookmarkStarts.forEach(mark => {
            const refName = mark.getAttribute("text:name")
            if (!refName) {
                return
            }

            // Find the closest heading
            let targetParent = mark.parentElement
            while (targetParent) {
                if (targetParent.tagName === "text:h") {
                    const id = randomHeadingId()
                    this.referenceableObjects[refName] = {
                        type: "heading",
                        id,
                        node: targetParent
                    }
                    break
                }
                targetParent = targetParent.parentElement
            }
        })

        // Handle figure sequences
        const sequences = node.queryAll("text:sequence")
        sequences.forEach(sequence => {
            const refName = sequence.getAttribute("text:ref-name")
            if (!refName) {
                return
            }

            // Find the figure container
            let targetParent = sequence.parentElement
            while (targetParent) {
                if (targetParent.tagName === "draw:frame") {
                    const id = randomFigureId()
                    this.referenceableObjects[refName] = {
                        type: "figure",
                        id,
                        node: targetParent
                    }
                    break
                }
                targetParent = targetParent.parentElement
            }
        })
    }

    convert() {
        const templateParts = this.template.content.content.slice()
        templateParts.shift()

        const document = {
            type: "doc",
            attrs: {
                import_id: this.importId
            },
            content: []
        }

        // Add title (required first element)
        const title = this.extractTitle()

        if (title.content.length) {
            document.content.push({
                type: "title",
                content: title.content
            })
        } else {
            // If no title found, use default title
            document.content.push({
                type: "title",
                content: [
                    {
                        type: "text",
                        text: gettext("Untitled")
                    }
                ]
            })
        }
        title.containerNodes.forEach(node => {
            node.parentElement.removeChild(node)
        })

        document.attrs.title =
            title.content.map(node => node.textContent).join("") ||
            gettext("Untitled")

        // Get all content sections from the ODT
        const body = this.contentDoc.query("office:text")
        if (!body) {
            return document
        }

        // Look for metadata sections first (author, abstract, etc.)
        const metadataContent = this.extractMetadata()
        metadataContent.forEach(({type, attrs, content}) => {
            const templatePart = templateParts.find(
                part => part.attrs.metadata === type
            )
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
                    node.parentElement.removeChild(node)
                })
            }
        })

        // Group remaining content by sections based on style names/titles
        const sections = this.groupContentIntoSections(body)

        // Map ODT sections to template parts
        sections.forEach(section => {
            // Find matching template part
            const templatePart = this.findMatchingTemplatePart(
                section.title,
                templateParts
            )

            if (templatePart) {
                // If template part found, use its configuration
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
            // Find default body template part
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

    extractMetadata() {
        const metadata = []

        // Extract authors if present
        const authors = this.extractAuthors()
        if (authors.content.length) {
            metadata.push({
                type: "authors",
                content: authors
            })
        }

        // Extract abstract if present
        const abstract = this.extractAbstract()
        if (abstract.content.length) {
            metadata.push({
                type: "abstract",
                content: abstract
            })
        }

        // Extract keywords if present
        const keywords = this.extractKeywords()
        if (keywords.content.length) {
            metadata.push({
                type: "keywords",
                content: keywords
            })
        }

        return metadata
    }

    extractAuthors() {
        const authors = []

        // Try to find author information in metadata
        const metaAuthors = this.contentDoc.queryAll("meta:user-defined", {
            "meta:name": "author"
        })
        metaAuthors.forEach(authorMeta => {
            const authorText = authorMeta.textContent
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
                containerNodes: metaAuthors
            }
        }

        // Also check for creator in document metadata
        const creator = this.contentDoc.query("meta:creator")
        if (creator) {
            const [firstname = "", lastname = ""] = creator.textContent.split(
                " ",
                2
            )
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

    extractAbstract() {
        // Look for section titled "Abstract" or with abstract style
        const abstractSection =
            this.contentDoc.query("text:section", {
                "text:style-name": "Abstract"
            }) ||
            this.contentDoc.query("text:h", {
                "text:outline-level": "1"
            }) // Then check content for "Abstract"

        if (
            abstractSection &&
            (abstractSection.getAttribute("text:style-name") === "Abstract" ||
                abstractSection.textContent.includes("Abstract"))
        ) {
            return {
                content: this.convertContainer(abstractSection),
                containerNodes: [abstractSection]
            }
        }

        return {
            content: [],
            containerNodes: []
        }
    }

    extractKeywords() {
        // Look for keywords section or metadata
        const keywordsSection =
            this.contentDoc.query("text:p", {"text:style-name": "Keywords"}) ||
            this.contentDoc.query("meta:user-defined", {
                "meta:name": "keywords"
            })

        if (keywordsSection) {
            return {
                content: this.convertContainer(keywordsSection),
                containerNodes: [keywordsSection]
            }
        }

        return {content: [], containerNodes: []}
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
            // Try fuzzy matching if exact match fails
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
        // Remove special characters and extra spaces
        const normalize = str =>
            str
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .trim()

        const normalized1 = normalize(title1)
        const normalized2 = normalize(title2)

        // Check if one string contains the other
        return (
            normalized1.includes(normalized2) ||
            normalized2.includes(normalized1)
        )
    }

    extractTitle() {
        // First try to find paragraph with Title style
        const titleParagraph = this.contentDoc.query("text:p", {
            "text:style-name": "Title"
        })
        if (titleParagraph) {
            return {
                content: this.convertBlockNode(titleParagraph)?.content || [],
                containerNodes: [titleParagraph]
            }
        }

        // Fall back to first heading
        const titleHeading = this.contentDoc.query("text:h", {
            "text:outline-level": "1"
        })
        if (titleHeading) {
            return {
                content: this.convertBlockNode(titleHeading)?.content || [],
                containerNodes: [titleHeading]
            }
        }

        // Check for other common title style names
        const commonTitleStyles = [
            "title",
            "doctitle",
            "document-title",
            "heading-title"
        ]
        for (const styleName of commonTitleStyles) {
            const titleElement = this.contentDoc.query("text:p", {
                "text:style-name": styleName
            })
            if (titleElement) {
                return {
                    content: this.convertBlockNode(titleElement)?.content || [],
                    containerNodes: [titleElement]
                }
            }
        }

        // Check style properties for title-like formatting
        const firstParagraph = this.contentDoc.query("text:p")
        if (firstParagraph) {
            const styleName = firstParagraph.getAttribute("text:style-name")
            const style = this.styles[styleName]

            if (style && this.isTitleStyle(style)) {
                // Remove this node from the document so it's not processed again
                return {
                    content:
                        this.convertBlockNode(firstParagraph)?.content || [],
                    containerNodes: [firstParagraph]
                }
            }
        }

        return {
            content: [],
            containerNodes: []
        }
    }

    isTitleStyle(style) {
        // Check if style or its parent has characteristics of a title style
        if (!style) {
            return false
        }

        // Check style name
        if (style.title?.toLowerCase().includes("title")) {
            return true
        }

        // Check text properties for title-like formatting
        const textProps = style.textProperties
        if (textProps) {
            // Title usually has larger font size and/or bold weight
            if (textProps.fontSize > 14 || textProps.bold) {
                return true
            }
        }

        // Check paragraph properties
        const paraProps = style.paragraphProperties
        if (paraProps) {
            // Titles are often centered and have larger margins
            if (
                paraProps.textAlign === "center" ||
                (paraProps.marginTop > 0.5 && paraProps.marginBottom > 0.5)
            ) {
                return true
            }
        }

        // Check parent style if exists
        if (style.parentStyleName) {
            const parentStyle = this.styles[style.parentStyleName]
            return this.isTitleStyle(parentStyle)
        }

        return false
    }

    getSectionTitle(node, styleName) {
        if (!node || !styleName) {
            return null
        }

        // For headings, use the text content as section title
        if (node.tagName === "text:h") {
            // Get the heading level
            const level = parseInt(node.getAttribute("text:outline-level")) || 1

            // Only use level 1 and 2 headings as section titles
            if (level <= 2) {
                return node.textContent.trim()
            }
        }

        // Check if the style indicates a section title
        const style = this.styles[styleName]
        if (style) {
            // Check for explicit section title style
            if (
                style.title ||
                styleName.toLowerCase().includes("section") ||
                styleName.toLowerCase().includes("title")
            ) {
                // If it's a styled paragraph, use its content as title
                if (node.tagName === "text:p") {
                    return node.textContent.trim()
                }
            }

            // Check if it's a custom section style
            const parentStyle = style.parentStyleName
                ? this.styles[style.parentStyleName]
                : null
            if (parentStyle?.isSection) {
                return node.textContent.trim()
            }
        }

        // For text:section elements, check for section-name attribute
        if (node.tagName === "text:section") {
            const sectionName = node.getAttribute("text:name")
            if (sectionName) {
                return this.formatSectionName(sectionName)
            }
        }

        return null
    }

    formatSectionName(name) {
        // Remove common suffixes
        name = name.replace(/_?(section|part|chapter)$/i, "")

        // Split by underscores or hyphens
        const words = name.split(/[_-]/)

        // Capitalize first letter of each word and join
        return words
            .map(
                word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ")
            .trim()
    }

    groupContentIntoSections(body) {
        const sections = []
        let currentSection = {
            title: null,
            content: []
        }

        body.children.forEach(node => {
            const styleName = node.getAttribute("text:style-name")
            const title = this.getSectionTitle(node, styleName)

            if (title && this.isHeadingStyle(styleName)) {
                // Start new section
                if (currentSection.content.length) {
                    sections.push(currentSection)
                }
                currentSection = {
                    title: title,
                    content: []
                }
            }

            const converted = this.convertBlockNode(node)
            if (converted) {
                currentSection.content.push(converted)
            }
        })

        // Add final section
        if (currentSection.content.length) {
            sections.push(currentSection)
        }

        return sections
    }

    isHeadingStyle(styleName) {
        if (!styleName) {
            return false
        }

        const style = this.styles[styleName]
        if (!style) {
            return false
        }

        // Check multiple indicators that this might be a heading style
        return (
            // Direct heading indicators
            style.isHeading ||
            styleName.toLowerCase().includes("heading") ||
            styleName.toLowerCase().includes("title") ||
            // Check outline level property
            Boolean(style.outlineLevel) ||
            // Check if it's derived from a heading style
            (style.parentStyleName &&
                this.isHeadingStyle(style.parentStyleName)) ||
            // Check specific formatting that's typical for headings
            (style.paragraphProperties &&
                // Larger margins than normal paragraphs
                (style.paragraphProperties.marginTop > 0.3 ||
                    style.paragraphProperties.marginBottom > 0.3 ||
                    // Different alignment
                    style.paragraphProperties.textAlign === "center")) ||
            // Check text properties typical for headings
            (style.textProperties &&
                // Larger font size
                (style.textProperties.fontSize > 12 ||
                    // Bold text
                    style.textProperties.bold ||
                    // Different font family
                    style.textProperties.fontFamily))
        )
    }

    convertContainer(container) {
        return container.children
            .map(node => this.convertBlockNode(node))
            .filter(node => node)
    }

    convertBlockNode(node) {
        const track = this.currentTracks.map(track => ({
            type: track.type,
            user: track.attrs.user,
            username: track.attrs.username,
            date: track.attrs.date
        }))

        const attrs = track.length ? {track} : {}

        switch (node.tagName) {
            case "text:p":
                if (
                    node.children.length === 1 &&
                    node.children[0].tagName === "draw:frame"
                ) {
                    // Paragraph consists of only one figure/image.
                    return this.convertImage(node.children[0], attrs)
                }
                return this.convertParagraph(node, attrs)
            case "text:h":
                return this.convertHeading(node, attrs)
            case "text:list":
                return this.convertList(node, attrs)
            case "draw:frame":
                return this.convertImage(node, attrs)
            case "draw:object":
                return this.convertObject(node, attrs)
            case "table:table":
                return this.convertTable(node, attrs)
            case "text:sequence-decls":
            case "office:forms":
            case "text:tracked-changes":
                return null
            default:
                console.warn(`Unsupported block node: ${node.tagName}`)
                return null
        }
    }

    convertParagraph(node, attrs = {}) {
        const styleName = node.getAttribute("text:style-name")
        const style = this.styles[styleName]

        // Check if this paragraph is title-like
        if (this.isTitleStyle(style)) {
            attrs = Object.assign(
                {
                    id: randomHeadingId()
                },
                attrs
            )
            return {
                type: "heading1",
                attrs,
                content: this.convertNodeChildren(node)
            }
        }

        if (this.isHeadingStyle(styleName)) {
            return this.convertHeading(node, attrs)
        }

        return {
            type: "paragraph",
            attrs,
            content: this.convertNodeChildren(node)
        }
    }

    convertHeading(node, attrs = {}) {
        const level =
            parseInt(node.getAttribute("text:outline-level") || 1) || 1

        // Check for bookmark
        let id = null
        const bookmarkStart = node.query("text:bookmark-start")
        if (bookmarkStart) {
            const refName = bookmarkStart.getAttribute("text:name")
            if (refName && this.referenceableObjects[refName]) {
                id = this.referenceableObjects[refName].id
            }
        }
        attrs = Object.assign(
            {
                id: id || randomHeadingId()
            },
            attrs
        )
        return {
            type: `heading${level}`,
            attrs,
            content: this.convertNodeChildren(node)
        }
    }

    convertNodeChildren(node, currentStyleMarks = []) {
        let insideZoteroReferenceMark = false

        return node.children
            .map(child => {
                if (insideZoteroReferenceMark) {
                    if (child.tagName === "text:reference-mark-end") {
                        // Process citation when we hit the end mark
                        const name = child.getAttribute("text:name")
                        if (
                            name &&
                            name.startsWith("ZOTERO_ITEM CSL_CITATION")
                        ) {
                            insideZoteroReferenceMark = false
                            return this.convertCitation(name, currentStyleMarks)
                        }
                    }
                    return null
                }

                switch (child.tagName) {
                    case "text:change-start": {
                        const changeId = child.getAttribute("text:change-id")
                        const track = this.tracks[changeId]
                        if (track) {
                            const trackMark = {
                                type: track.type,
                                attrs: {
                                    user: track.user,
                                    username: track.username,
                                    date: track.date
                                }
                            }
                            if (track.type === "insertion") {
                                trackMark.attrs.approved = track.approved
                            }
                            this.currentTracks.push(trackMark)
                        }
                        return null
                    }
                    case "text:change-end": {
                        const changeId = child.getAttribute("text:change-id")
                        const track = this.tracks[changeId]
                        if (track) {
                            this.currentTracks = this.currentTracks.filter(
                                mark => mark.type !== track.type
                            )
                        }
                        return null
                    }
                    case "#text":
                        return this.convertText(
                            String(child.textContent),
                            currentStyleMarks
                        )
                    case "text:s": // space
                        return this.convertText(" ", currentStyleMarks)
                    case "text:span": {
                        return this.convertSpan(child, currentStyleMarks)
                    }
                    case "text:a":
                        return this.convertLink(child, currentStyleMarks)
                    case "text:note":
                        return this.convertFootnote(child, currentStyleMarks)
                    case "office:annotation":
                        return this.convertAnnotationStart(child)
                    case "office:annotation-end":
                        return this.convertAnnotationEnd(child)
                    case "text:reference-mark-start": {
                        const name = child.getAttribute("text:name")
                        if (
                            name &&
                            name.startsWith("ZOTERO_ITEM CSL_CITATION")
                        ) {
                            insideZoteroReferenceMark = true
                        }
                        return null
                    }
                    case "text:bookmark-ref":
                        return this.convertHeadingReference(child)
                    case "text:sequence-ref":
                        return this.convertFigureReference(child)
                    case "text:soft-page-break":
                        return null
                    default:
                        console.warn(
                            `Unsupported inline node: ${child.tagName}`
                        )
                }
            })
            .filter(node => node)
            .flat()
    }

    getCurrentMarks(currentStyleMarks = []) {
        const commentMarks = []
        // Add comment marks for any active comment IDs
        this.currentCommentIds.forEach(commentId => {
            commentMarks.push({
                type: "comment",
                attrs: {
                    id: commentId
                }
            })
        })
        return [...currentStyleMarks, ...this.currentTracks, ...commentMarks]
    }

    convertText(text, currentStyleMarks) {
        const textNode = {
            type: "text",
            text
        }
        const marks = this.getCurrentMarks(currentStyleMarks)
        if (marks.length) {
            textNode.marks = marks
        }
        return textNode
    }

    convertSpan(node, currentStyleMarks) {
        const styleName = node.getAttribute("text:style-name")
        const style = this.styles[styleName]
        if (style?.textProperties?.bold) {
            currentStyleMarks = [...currentStyleMarks, {type: "strong"}]
        }
        if (style?.textProperties?.italic) {
            currentStyleMarks = [...currentStyleMarks, {type: "em"}]
        }
        return this.convertNodeChildren(node, currentStyleMarks)
    }

    convertFootnote(node, currentStyleMarks) {
        const noteBody = node.query("text:note-body")
        if (!noteBody) {
            return null
        }

        // Get the first paragraph in the footnote
        const firstParagraph = noteBody.query("text:p")
        if (!firstParagraph) {
            return null
        }

        // Check if this is a citation-only footnote
        const referenceMarkStart = firstParagraph.query(
            "text:reference-mark-start"
        )
        const referenceMarkEnd = firstParagraph.query("text:reference-mark-end")

        if (
            referenceMarkStart &&
            referenceMarkEnd &&
            referenceMarkStart
                .getAttribute("text:name")
                .startsWith("ZOTERO_ITEM CSL_CITATION") &&
            // Check that there's no content outside the reference marks
            firstParagraph.children.every(
                child =>
                    child.tagName === "text:reference-mark-start" ||
                    child.tagName === "text:reference-mark-end" ||
                    (child.tagName === "text:span" &&
                        child.previousSibling?.tagName ===
                            "text:reference-mark-start" &&
                        child.nextSibling?.tagName ===
                            "text:reference-mark-end")
            )
        ) {
            // If it's a citation-only footnote, convert it directly to a citation
            const citationData = referenceMarkStart.getAttribute("text:name")
            return this.convertCitation(citationData, currentStyleMarks)
        }

        // Otherwise, convert as regular footnote
        return {
            type: "footnote",
            attrs: {
                footnote: this.convertContainer(noteBody)
            },
            marks: this.getCurrentMarks(currentStyleMarks)
        }
    }

    convertCitation(citationData, currentStyleMarks) {
        // Handle both string citation data and reference mark names
        try {
            const jsonStr = citationData.replace(
                "ZOTERO_ITEM CSL_CITATION ",
                ""
            )

            // Parse the CSL citation data
            const lastBrace = jsonStr.lastIndexOf("}") + 1
            const cslData = JSON.parse(jsonStr.substring(0, lastBrace))

            // Create citation references
            const citations = cslData.citationItems
                .map(item => {
                    const id = String(item.itemData.id)

                    // Find in bibliography
                    let [bibKey, _] =
                        Object.entries(this.bibliography || {}).find(
                            ([_key, entry]) => entry.entry_key === id
                        ) || []

                    if (!bibKey && item.itemData) {
                        // Not yet present in bibliography. Parse the CSL data and add it.
                        const parseData = parseCSL({
                            [id]: item.itemData
                        })
                        const bibEntry = parseData["1"]
                        bibKey = `${Object.keys(this.bibliography || {}).length + 1}`
                        if (!this.bibliography) {
                            this.bibliography = {}
                        }
                        this.bibliography[bibKey] = bibEntry
                    }

                    return bibKey
                        ? {
                              id: bibKey,
                              prefix: item.prefix || "",
                              locator: item.locator || ""
                          }
                        : null
                })
                .filter(citation => citation)

            if (!citations.length) {
                return null
            }

            return {
                type: "citation",
                attrs: {
                    format: "cite", // Could be determined from properties if needed
                    references: citations
                },
                marks: this.getCurrentMarks(currentStyleMarks)
            }
        } catch (error) {
            console.warn("Failed to parse CSL citation:", error)
            return null
        }
    }

    convertList(node, attrs) {
        const listStyle = node.getAttribute("text:style-name")
        const isOrdered = this.isOrderedList(listStyle)

        attrs = Object.assign(
            {
                id: randomListId()
            },
            attrs
        )

        if (isOrdered) {
            attrs.order = 1
        }

        return {
            type: isOrdered ? "ordered_list" : "bullet_list",
            attrs,
            content: node.queryAll("text:list-item").map(item => ({
                type: "list_item",
                content: this.convertContainer(item)
            }))
        }
    }

    convertAnnotationStart(node) {
        const commentId = (node.getAttribute("office:name") || "")
            .replace(/\D/g, "")
            .slice(0, 9)
        if (commentId && this.comments[commentId]) {
            this.currentCommentIds.push(commentId)
        }
        return null
    }

    convertAnnotationEnd(node) {
        const commentId = (node.getAttribute("office:name") || "")
            .replace(/\D/g, "")
            .slice(0, 9)
        if (commentId) {
            const index = this.currentCommentIds.indexOf(commentId)
            if (index !== -1) {
                this.currentCommentIds.splice(index, 1)
            }
        }
        return null
    }

    convertHeadingReference(node) {
        const refName = node.getAttribute("text:ref-name")
        if (!refName || !this.referenceableObjects[refName]) {
            return null
        }

        const targetObject = this.referenceableObjects[refName]
        if (targetObject.type !== "heading") {
            return null
        }

        return {
            type: "cross_reference",
            attrs: {
                id: targetObject.id,
                title: targetObject.node.textContent
            }
        }
    }

    convertFigureReference(node) {
        const refName = node.getAttribute("text:ref-name")
        if (!refName || !this.referenceableObjects[refName]) {
            return null
        }

        const targetObject = this.referenceableObjects[refName]
        if (targetObject.type !== "figure") {
            return null
        }

        // Find the caption text within the figure
        const caption = targetObject.node.query("text:p")?.textContent || ""

        return {
            type: "cross_reference",
            attrs: {
                id: targetObject.id,
                title: caption
            }
        }
    }

    isOrderedList(styleName) {
        if (!this.stylesDoc) {
            return false
        }
        const listStyle = this.stylesDoc.query("text:list-style", {
            "style:name": styleName
        })
        return listStyle?.query("text:list-level-style-number") !== null
    }

    convertImage(node, attrs = {}) {
        const imageElement = node.query("draw:image")
        if (!imageElement) {
            return null
        }

        const frame = node.closest("draw:frame")
        if (!frame) {
            return null
        }

        const href = imageElement.getAttribute("xlink:href")
        if (!href || !href.startsWith("Pictures/")) {
            return null
        }

        const imageId = Math.floor(Math.random() * 1000000)
        const width = this.convertLength(node.getAttribute("svg:width"))
        const height = this.convertLength(node.getAttribute("svg:height"))

        const title = href.split("/").pop()
        this.images[imageId] = {
            id: imageId,
            title,
            copyright: {
                holder: false,
                year: false,
                freeToRead: true,
                licenses: []
            },
            image: href,
            file_type: this.getImageFileType(title),
            file: null,
            width,
            height,
            checksum: 0
        }

        // Find sequence element for figure reference
        const sequence = frame.query("text:sequence")
        let figureId = null
        if (sequence) {
            const refName = sequence.getAttribute("text:ref-name")
            if (refName && this.referenceableObjects[refName]) {
                figureId = this.referenceableObjects[refName].id
            }
        }

        const caption = node.query("text:p")
        const captionContent = caption ? this.convertNodeChildren(caption) : []

        attrs = Object.assign(
            {
                id: figureId || randomFigureId(),
                aligned: "center",
                width: Math.min(Math.round((width / 8.5) * 100), 100),
                caption: Boolean(captionContent.length)
            },
            attrs
        )

        const figureCaption = {type: "figure_caption"}
        if (captionContent.length) {
            figureCaption.content = captionContent
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
                figureCaption
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

    convertLength(length) {
        if (!length) {
            return 0
        }

        // Match number and unit
        const match = length.match(/^(-?\d*\.?\d+)(pt|cm|mm|in|pc|px|%)?$/)
        if (!match) {
            return 0
        }

        const [_, value, unit = "pt"] = match
        const numValue = parseFloat(value)

        // Convert to inches first (as base unit)
        switch (unit) {
            case "pt": // points
                return numValue / 72
            case "pc": // picas (1 pica = 12 points)
                return (numValue * 12) / 72
            case "cm": // centimeters
                return numValue / 2.54
            case "mm": // millimeters
                return numValue / 25.4
            case "in": // inches
                return numValue
            case "px": // pixels (assuming 96 DPI)
                return numValue / 96
            case "%": // percentage (return as is)
                return numValue
            default:
                return 0
        }
    }

    convertTable(node, attrs) {
        const width =
            node.getAttribute("style:rel-width")?.replace("%", "") || "100"
        const styleName = node.getAttribute("table:style-name")
        const style = this.styles[styleName]
        const aligned = style?.tableProperties.align || "center"

        attrs = Object.assign(
            {
                id: randomTableId(),
                track: parseTracks(node.getAttribute("text:change-id")),
                width,
                aligned,
                layout: "fixed",
                category: "none",
                caption: false
            },
            attrs
        )
        return {
            type: "table",
            attrs,
            content: [
                {type: "table_caption"},
                {
                    type: "table_body",
                    content: node
                        .queryAll("table:table-row")
                        .map(row => this.convertTableRow(row))
                }
            ]
        }
    }

    convertTableRow(row) {
        return {
            type: "table_row",
            content: row
                .queryAll(["table:table-cell", "table:covered-table-cell"])
                .map(cell => this.convertTableCell(cell))
        }
    }

    convertTableCell(node) {
        if (node.tagName === "table:covered-table-cell") {
            return null
        }
        return {
            type: "table_cell",
            attrs: {
                colspan:
                    parseInt(
                        node.getAttribute("table:number-columns-spanned")
                    ) || 1,
                rowspan:
                    parseInt(node.getAttribute("table:number-rows-spanned")) ||
                    1,
                track: parseTracks(node.getAttribute("text:change-id"))
            },
            content: this.convertContainer(node)
        }
    }

    convertLink(node, currentStyleMarks) {
        const href = node.getAttribute("xlink:href")
        currentStyleMarks = currentStyleMarks.concat([
            {type: "link", attrs: {href}}
        ])
        return this.convertNodeChildren(node, currentStyleMarks)
    }

    detectLanguage() {
        // Try to detect document language in following order:
        // 1. From document content
        // 2. From document styles
        // 3. Default to "en-US"

        // Check content language
        if (this.contentDoc) {
            const langAttr =
                this.contentDoc.getAttribute("office:default-language") ||
                this.contentDoc.getAttribute("dc:language")
            if (langAttr) {
                return langAttr
            }

            const firstParagraph = this.contentDoc.query("text:p")
            if (firstParagraph) {
                const paraLang = firstParagraph.getAttribute("xml:lang")
                if (paraLang) {
                    return paraLang
                }
            }
        }

        // Check styles language
        if (this.stylesDoc) {
            const defaultStyle = this.stylesDoc.query("style:default-style")
            if (defaultStyle) {
                const styleLang =
                    defaultStyle.getAttribute("fo:language") ||
                    defaultStyle.getAttribute("style:language-complex")
                if (styleLang) {
                    return styleLang
                }
            }
        }

        // Default to "en-US"
        return "en-US"
    }
}
