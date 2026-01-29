import {xmlDOM} from "../../exporter/tools/xml"

const DEFAULT_STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
</w:styles>`

export class DocxParser {
    constructor(zip) {
        this.zip = zip
        this.styles = {}
        this.numbering = {}
        this.comments = {}
        this.footnotes = {}
        this.endnotes = {}
        this.relationships = {}
        this.images = {}

        this.coreDoc = null
        this.document = null
    }

    init() {
        return this.parseStyles()
            .then(() => this.parseNumbering())
            .then(() => this.parseComments())
            .then(() => this.parseFootnotes())
            .then(() => this.parseEndnotes())
            .then(() => this.parseRelationships())
            .then(() => this.parseImages())
            .then(() => this.parseCoreDoc())
            .then(() => this.parseDocument())
    }

    async parseStyles() {
        try {
            const content = await this.zip
                .file("word/styles.xml")
                ?.async("string")
            const stylesDoc = xmlDOM(content || DEFAULT_STYLES_XML)
            const styles = stylesDoc.queryAll("w:style")

            styles.forEach(style => {
                const id = style.getAttribute("w:styleId")
                const type = style.getAttribute("w:type")
                const name = style.query("w:name")?.getAttribute("w:val")
                const basedOn = style.query("w:basedOn")?.getAttribute("w:val")

                this.styles[id] = {
                    id,
                    type,
                    name,
                    isHeading:
                        (id && /heading\d+/i.test(id)) ||
                        (basedOn && /heading\d+/i.test(basedOn)),
                    isCaption:
                        (id && /caption/i.test(id)) ||
                        (basedOn && /caption/i.test(basedOn)),
                    level: id ? parseInt(id.match(/\d+/)?.[0] || 0) : 0,
                    basedOn,
                    paragraphProps: this.extractParagraphProperties(style),
                    runProps: this.extractRunProperties(style)
                }
            })
        } catch (err) {
            console.warn("Could not parse styles", err)
        }
    }

    extractParagraphProperties(style) {
        const pPr = style.query("w:pPr")
        if (!pPr) {
            return {}
        }

        return {
            indent: this.extractIndentation(pPr),
            alignment: pPr.query("w:jc")?.getAttribute("w:val"),
            numbering: this.extractNumbering(pPr),
            keepNext: Boolean(pPr.query("w:keepNext"))
        }
    }

    extractIndentation(pPr) {
        const ind = pPr.query("w:ind")
        if (!ind) {
            return {}
        }

        return {
            left: parseInt(
                ind.getAttribute("w:left") || ind.getAttribute("w:start") || "0"
            ),
            right: parseInt(
                ind.getAttribute("w:right") || ind.getAttribute("w:end") || "0"
            ),
            hanging: parseInt(ind.getAttribute("w:hanging") || "0"),
            firstLine: parseInt(ind.getAttribute("w:firstLine") || "0")
        }
    }

    extractNumbering(pPr) {
        const numPr = pPr.query("w:numPr")
        if (!numPr) {
            return null
        }

        return {
            id: numPr.query("w:numId")?.getAttribute("w:val"),
            level: parseInt(numPr.query("w:ilvl")?.getAttribute("w:val") || "0")
        }
    }

    extractRunProperties(rPr) {
        if (!rPr) {
            return {}
        }

        return {
            bold: Boolean(rPr.query("w:b")),
            italic: Boolean(rPr.query("w:i")),
            underline: rPr.query("w:u")?.getAttribute("w:val") || false,
            strike: Boolean(rPr.query("w:strike")),
            smallCaps: Boolean(rPr.query("w:smallCaps")),
            vertAlign: rPr.query("w:vertAlign")?.getAttribute("w:val") || false,
            fontSize:
                parseInt(rPr.query("w:sz")?.getAttribute("w:val") || "0") / 2,
            color: rPr.query("w:color")?.getAttribute("w:val") || false
        }
    }

    async parseNumbering() {
        try {
            const content = await this.zip
                .file("word/numbering.xml")
                ?.async("string")
            if (!content) {
                return
            }
            const numberingDoc = xmlDOM(content)

            // Parse abstract numbering definitions
            const abstractNums = numberingDoc.queryAll("w:abstractNum")
            const abstractNumbering = {}

            abstractNums.forEach(abstractNum => {
                const id = abstractNum.getAttribute("w:abstractNumId")
                const levels = abstractNum.queryAll("w:lvl").map(lvl => ({
                    level: lvl.getAttribute("w:ilvl"),
                    format: lvl.query("w:numFmt")?.getAttribute("w:val"),
                    text: lvl.query("w:lvlText")?.getAttribute("w:val"),
                    start: parseInt(
                        lvl.query("w:start")?.getAttribute("w:val") || "1"
                    )
                }))
                abstractNumbering[id] = levels
            })

            // Parse numbering instances
            const nums = numberingDoc.queryAll("w:num")
            nums.forEach(num => {
                const numId = num.getAttribute("w:numId")
                const abstractNumId = num
                    .query("w:abstractNumId")
                    ?.getAttribute("w:val")

                this.numbering[numId] = {
                    abstractId: abstractNumId,
                    levels: abstractNumbering[abstractNumId] || [],
                    overrides: this.extractNumberingOverrides(num)
                }
            })
        } catch (err) {
            console.warn("Could not parse numbering", err)
        }
    }

    extractNumberingOverrides(num) {
        return num.queryAll("w:lvlOverride").map(override => ({
            level: override.getAttribute("w:ilvl"),
            start: parseInt(
                override.query("w:startOverride")?.getAttribute("w:val") || "1"
            )
        }))
    }

    async parseComments() {
        try {
            const content = await this.zip
                .file("word/comments.xml")
                ?.async("string")
            if (!content) {
                return
            }
            const commentsDoc = xmlDOM(content)

            commentsDoc.queryAll("w:comment").forEach(comment => {
                const id = comment.getAttribute("w:id")
                this.comments[id] = {
                    id,
                    author: comment.getAttribute("w:author"),
                    date: comment.getAttribute("w:date"),
                    content: this.extractCommentContent(comment)
                }
            })
        } catch (err) {
            console.warn("Could not parse comments", err)
        }
    }

    extractCommentContent(comment) {
        const content = []
        comment.queryAll("w:p").forEach(p => {
            content.push({
                type: "paragraph",
                content: this.extractParagraphContent(p)
            })
        })
        return content
    }

    async parseFootnotes() {
        try {
            const content = await this.zip
                .file("word/footnotes.xml")
                ?.async("string")
            if (!content) {
                return
            }
            const footnotesDoc = xmlDOM(content)

            footnotesDoc.queryAll("w:footnote").forEach(footnote => {
                const id = footnote.getAttribute("w:id")
                if (id === "0" || id === "-1") {
                    return // Skip separator footnotes
                }
                this.footnotes[id] = {
                    id,
                    content: this.extractBlockContent(footnote)
                }
            })
        } catch (err) {
            console.warn("Could not parse footnotes", err)
        }
    }

    // async parseFootnotes() {
    //     try {
    //         const content = await this.zip
    //             .file("word/footnotes.xml")
    //             ?.async("string")
    //         if (!content) {
    //             return
    //         }
    //         const footnotesDoc = xmlDOM(content)

    //         footnotesDoc.queryAll("w:footnote").forEach(footnote => {
    //             const id = footnote.getAttribute("w:id")
    //             if (id === "0" || id === "-1") {
    //                 return // Skip separator footnotes
    //             }

    //             // Process each paragraph in the footnote
    //             const paragraphs = []
    //             footnote.queryAll("w:p").forEach(p => {
    //                 paragraphs.push({
    //                     type: "paragraph",
    //                     content: this.extractParagraphContent(p)
    //                 })
    //             })

    //             this.footnotes[id] = {
    //                 id,
    //                 content: paragraphs
    //             }
    //         })
    //     } catch (err) {
    //         console.warn("Could not parse footnotes", err)
    //     }
    // }

    // extractParagraphContent(p) {
    //     const content = []

    //     // Handle field codes (for cross-references)
    //     const fieldRuns = []
    //     let currentFieldCode = null
    //     let collectingField = false

    //     p.queryAll("w:r").forEach(r => {
    //         const fieldChar = r.query("w:fldChar")
    //         if (fieldChar) {
    //             const type = fieldChar.getAttribute("w:fldCharType")
    //             if (type === "begin") {
    //                 collectingField = true
    //                 currentFieldCode = { code: "", result: "" }
    //             } else if (type === "separate") {
    //                 collectingField = false
    //             } else if (type === "end") {
    //                 if (currentFieldCode) {
    //                     fieldRuns.push(currentFieldCode)
    //                     currentFieldCode = null
    //                 }
    //             }
    //         } else if (collectingField && currentFieldCode) {
    //             const instrText = r.query("w:instrText")
    //             if (instrText) {
    //                 currentFieldCode.code += instrText.textContent
    //             }
    //         } else if (currentFieldCode) {
    //             const text = r.query("w:t")?.textContent
    //             if (text) {
    //                 currentFieldCode.result += text
    //             }
    //         }

    //         // Normal text processing
    //         const text = r.query("w:t")?.textContent
    //         if (!text && !r.query("w:drawing") && !r.query("w:pict")) {
    //             // Check for breaks
    //             if (r.query("w:br")) {
    //                 content.push({ type: "hard_break" })
    //             }
    //             return
    //         }

    //         // Check for hyperlinks
    //         const hyperlink = r.closest("w:hyperlink")
    //         if (hyperlink && !r.query("w:drawing") && !r.query("w:pict")) {
    //             // This will be handled separately
    //             return
    //         }

    //         const rPr = r.query("w:rPr")
    //         const formatting = rPr ? this.extractRunProperties(rPr) : {}

    //         if (text) {
    //             content.push({
    //                 type: "text",
    //                 text,
    //                 marks: this.createMarksFromFormatting(formatting)
    //             })
    //         }
    //     })

    //     // Process hyperlinks in the paragraph
    //     p.queryAll("w:hyperlink").forEach(hyperlink => {
    //         const rId = hyperlink.getAttribute("r:id")
    //         const anchor = hyperlink.getAttribute("w:anchor")

    //         // Collect all text from the hyperlink
    //         let linkText = ""
    //         hyperlink.queryAll("w:r").forEach(r => {
    //             const t = r.query("w:t")
    //             if (t) {
    //                 linkText += t.textContent
    //             }
    //         })

    //         if (linkText) {
    //             let href = "#"
    //             if (rId && this.relationships[rId]) {
    //                 href = this.relationships[rId].target
    //             } else if (anchor) {
    //                 href = `#${anchor}`
    //             }

    //             content.push({
    //                 type: "text",
    //                 text: linkText,
    //                 marks: [{
    //                     type: "link",
    //                     attrs: {
    //                         href,
    //                         title: linkText
    //                     }
    //                 }]
    //             })
    //         }
    //     })

    //     // Process field runs for cross-references
    //     fieldRuns.forEach(field => {
    //         if (field.code.startsWith("REF ")) {
    //             const target = field.code.substring(4).trim().split(/\s+/)[0]
    //             content.push({
    //                 type: "cross_reference",
    //                 attrs: {
    //                     id: target,
    //                     title: field.result || target
    //                 }
    //             })
    //         }
    //     })

    //     // Handle equations
    //     const oMath = p.query("m:oMath")
    //     if (oMath) {
    //         // Very basic LaTeX conversion (would need a proper OMML to LaTeX converter)
    //         const latex = "x^2" // Placeholder - should use a proper converter
    //         content.push({
    //             type: "equation",
    //             attrs: {
    //                 equation: latex
    //             }
    //         })
    //     }

    //     return content
    // }

    async parseEndnotes() {
        try {
            const content = await this.zip
                .file("word/endnotes.xml")
                ?.async("string")
            if (!content) {
                return
            }
            const endnotesDoc = xmlDOM(content)

            endnotesDoc.queryAll("w:endnote").forEach(endnote => {
                const id = endnote.getAttribute("w:id")
                if (id === "0" || id === "-1") {
                    return // Skip separator endnotes
                }
                this.endnotes[id] = {
                    id,
                    content: this.extractBlockContent(endnote)
                }
            })
        } catch (err) {
            console.warn("Could not parse endnotes", err)
        }
    }

    async parseRelationships() {
        try {
            const content = await this.zip
                .file("word/_rels/document.xml.rels")
                ?.async("string")
            if (!content) {
                return
            }
            const relsDoc = xmlDOM(content)

            relsDoc.queryAll("Relationship").forEach(rel => {
                const id = rel.getAttribute("Id")
                this.relationships[id] = {
                    id,
                    type: rel.getAttribute("Type"),
                    target: rel.getAttribute("Target")
                }
            })
        } catch (err) {
            console.warn("Could not parse relationships", err)
        }
    }

    async parseImages() {
        // Find and extract image files
        const imageFiles = Object.keys(this.zip.files).filter(path =>
            path.startsWith("word/media/")
        )

        for (const path of imageFiles) {
            try {
                const blob = await this.zip.file(path).async("blob")
                const filename = path.split("/").pop()
                const content = this.addMimeType(blob, filename)
                this.images[filename] = content
            } catch (err) {
                console.warn(`Could not parse image ${path}`, err)
            }
        }
    }

    addMimeType(blob, filename) {
        return new File([blob], filename, {
            type: this.getImageFileType(filename)
        })
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

    extractBlockContent(node) {
        const content = []
        node.queryAll("w:p").forEach(p => {
            content.push({
                type: "paragraph",
                content: this.extractParagraphContent(p)
            })
        })
        return content
    }

    extractParagraphContent(p) {
        const content = []
        p.queryAll("w:r").forEach(r => {
            const text = r.query("w:t")?.textContent
            if (!text) {
                return
            }

            const rPr = r.query("w:rPr")
            const formatting = rPr ? this.extractRunProperties(rPr) : {}

            content.push({
                type: "text",
                text,
                marks: this.createMarksFromFormatting(formatting)
            })
        })
        return content
    }

    createMarksFromFormatting(formatting) {
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
        return marks
    }

    async parseCoreDoc() {
        try {
            const content = await this.zip
                .file("docProps/core.xml")
                ?.async("string")
            if (!content) {
                return
            }
            this.coreDoc = xmlDOM(content)
        } catch (err) {
            console.warn("Could not parse core doc", err)
        }
    }

    async parseDocument() {
        try {
            const content = await this.zip
                .file("word/document.xml")
                ?.async("string")
            if (!content) {
                return
            }
            this.document = xmlDOM(content)
        } catch (err) {
            console.warn("Could not parse document", err)
        }
    }
}
