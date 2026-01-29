import {convertLatexToMathMl} from "mathlive"
import pretty from "pretty"

import {escapeText} from "../../common"
import {CATS} from "../../schema/i18n"
import {HTMLExporterCitations} from "./citations"
import {displayNumber} from "./tools"

export class HTMLExporterConvert {
    constructor(
        docTitle,
        docSettings,
        docContent,
        htmlExportTemplate,
        imageDB,
        bibDB,
        csl,
        styleSheets,
        {
            xhtml = false,
            epub = false,
            relativeUrls = true, // Whether to use relative urls for images, css files, etc. Is used when bundled in HTML. Not in print.
            footnoteNumbering = "decimal",
            affiliationNumbering = "alpha",
            idPrefix = "",
            footnoteOffset = 0,
            affiliationOffset = 0,
            figureOffset = {}
        } = {}
    ) {
        this.docTitle = docTitle
        this.docSettings = docSettings
        this.docContent = docContent
        this.htmlExportTemplate = htmlExportTemplate
        this.imageDB = imageDB
        this.bibDB = bibDB
        this.csl = csl
        this.styleSheets = styleSheets
        this.xhtml = xhtml
        this.epub = epub
        this.relativeUrls = relativeUrls
        this.footnoteNumbering = footnoteNumbering
        this.affiliationNumbering = affiliationNumbering

        this.endSlash = this.xhtml ? "/" : ""
        this.imageIds = []
        this.categoryCounter = {} // counters for each type of figure (figure/table/photo)
        this.affiliations = {} // affiliations of authors and editors
        this.parCounter = 0
        this.headingCounter = 0
        this.currentSectionLevel = 0
        this.listCounter = 0
        this.orderedListLengths = []
        this.footnotes = []
        this.fnCounter = footnoteOffset
        this.affCounter = affiliationOffset
        this.metaData = {
            title: this.docTitle,
            authors: [],
            abstract: false,
            keywords: [],
            copyright: {
                licenses: []
            },
            toc: []
        }
        this.features = {
            math: false,
            bibliography: false
        }
        this.citations = {
            type: "",
            bibCSS: "",
            bibHTML: "",
            citationTexts: []
        }
        this.citInfos = []
        this.citationCount = 0
        this.extraStyleSheets = []
        this.idPrefix = idPrefix
        this.categoryCounter = Object.assign({}, figureOffset)
    }

    init() {
        this.analyze(this.docContent)
        return this.process()
    }

    async processCitInfos() {
        const citationProcessor = new HTMLExporterCitations(
            this.docSettings,
            this.bibDB,
            this.csl
        )
        const citations = await citationProcessor.init(this.citInfos)
        this.citations = citations
    }

    async process() {
        if (this.citInfos.length) {
            await this.processCitInfos()
        }

        if (this.citations.bibCSS.length) {
            this.extraStyleSheets.push({
                filename: this.relativeUrls ? "css/bibliography.css" : null,
                contents: pretty(this.citations.bibCSS, {
                    ocd: true
                })
            })
        }
        if (this.features.math) {
            this.extraStyleSheets.push({
                filename: this.relativeUrls
                    ? "css/mathlive.css"
                    : staticUrl("css/libs/mathlive/mathlive.css")
            })
        }
        const body = this.assembleBody()
        const back = this.assembleBack()
        const head = this.assembleHead()
        const html = this.htmlExportTemplate({
            head,
            body,
            back,
            settings: this.docSettings,
            lang: this.docSettings.language.split("-")[0],
            xhtml: this.xhtml,
            epub: this.epub
        })
        return {
            html,
            imageIds: this.imageIds,
            extraStyleSheets: this.extraStyleSheets,
            metaData: this.metaData
        }
    }

    // Find information for meta tags in header
    analyze(node) {
        switch (node.type) {
            case "citation":
                this.citInfos.push(JSON.parse(JSON.stringify(node.attrs)))
                break
            case "contributors_part":
                if (node.attrs.metadata === "authors" && node.content) {
                    node.content.forEach(author => {
                        this.metaData.authors.push(author)
                    })
                }
                break
            case "doc":
                this.metaData.copyright = node.attrs.copyright
                break
            case "heading1":
            case "heading2":
            case "heading3":
            case "heading4":
            case "heading5":
            case "heading6": {
                const level = Number.parseInt(node.type.slice(-1))
                this.metaData.toc.push({
                    level,
                    id: node.attrs.id,
                    title: (node.content || [])
                        .map(subNode => this.walkJson(subNode))
                        .join("")
                })
                break
            }
            case "equation":
            case "figure_equation":
                this.features.math = true
                break
            case "footnote":
                node.attrs.footnote.forEach(child => this.analyze(child))
                break
            case "richtext_part":
                if (
                    node.attrs.metadata === "abstract" &&
                    !node.attrs.language &&
                    this.metaData.abstract
                ) {
                    this.metaData.abstract = this.walkJson(node)
                }
                break
            case "tags_part":
                if (node.attrs.metadata === "keywords" && node.content) {
                    node.content.forEach(tag => {
                        this.metaData.keywords.push(tag.attrs.tag)
                    })
                }
                break
            case "title": {
                const title = this.textWalkJson(node)
                if (title.length) {
                    this.metaData.title = title
                }
                this.metaData.toc.push({
                    docTitle: true,
                    level: 1,
                    id: "title",
                    title: title
                })
                break
            }

            default:
                break
        }
        if (node.content) {
            node.content.forEach(child => this.analyze(child))
        }
    }

    assembleHead() {
        let head = `<title>${escapeText(this.metaData.title)}</title>`
        if (this.metaData.authors.length) {
            const authorString = this.metaData.authors
                .map(author => {
                    if (author.firstname || author.lastname) {
                        const nameParts = []
                        if (author.firstname) {
                            nameParts.push(author.firstname)
                        }
                        if (author.lastname) {
                            nameParts.push(author.lastname)
                        }
                        return nameParts.join(" ")
                    } else if (author.institution) {
                        return author.institution
                    }
                })
                .join(", ")
            if (authorString.length) {
                head += `<meta name="author" content="${escapeText(authorString)}"${this.endSlash}>`
            }
        }
        if (this.metaData.copyright.holder) {
            head += `<link rel="schema.dcterms" href="http://purl.org/dc/terms/"${this.endSlash}>`
            const year = this.metaData.copyright.year
                ? this.metaData.copyright.year
                : new Date().getFullYear()
            head += `<meta name="dcterms.dateCopyrighted" content="${year}"${this.endSlash}>`
            head += `<meta name="dcterms.rightsHolder" content="${escapeText(this.metaData.copyright.holder)}"${this.endSlash}>`
            // TODO: Add this.metaData.copyright.freeToRead if present

            head += this.metaData.copyright.licenses
                .map(
                    license =>
                        `<link rel="license" href="${escapeText(license.url)}"${this.endSlash}>` // TODO: Add this.metaData.copyright.license.start info if present
                )
                .join("")
        }
        if (this.metaData.abstract.default) {
            head += this.walkJson(this.metaData.abstract.default)
        }
        Object.keys(this.metaData.abstract)
            .filter(language => language !== "default")
            .forEach(language => {
                head += this.walkJson(this.metaData.abstract[language])
            })
        if (this.metaData.keywords.length) {
            head += `<meta name="keywords" content="${escapeText(this.metaData.keywords.join(", "))}"${this.endSlash}>`
        }
        head += this.styleSheets
            .concat(this.extraStyleSheets)
            .map(sheet => {
                if (!sheet.filename && !sheet.contents) {
                    console.warn(
                        "No filename or contents for stylesheet.",
                        sheet
                    )
                    return ""
                }
                return sheet.filename
                    ? `<link rel="stylesheet" type="text/css" href="${sheet.filename}"${this.endSlash}>`
                    : `<style>${sheet.contents}</style>`
            })
            .join("")
        return head
    }

    // Only allow for text output
    textWalkJson(node) {
        let content = ""
        if (node.type === "text") {
            content += escapeText(node.text).normalize("NFC")
        } else if (node.content) {
            node.content.forEach(child => {
                content += this.textWalkJson(child)
            })
        }
        return content
    }

    walkJson(node, options = {}) {
        let start = "",
            content = "",
            end = ""
        switch (node.type) {
            case "doc":
                break
            case "title":
                start += `<div class="doc-part doc-title" id="${this.idPrefix}title">`
                end = "</div>" + end
                break
            case "heading_part":
                start += `<div class="doc-part doc-heading doc-${node.attrs.id} ${node.attrs.metadata || "other"}" id="${this.idPrefix}${node.attrs.id}"${node.attrs.language ? ` lang="${node.attrs.language}"` : ""}>`
                end = "</div>" + end
                break
            case "contributor":
                // Ignore - we deal with contributors_part instead.
                break
            case "contributors_part":
                if (node.content) {
                    start += `<div class="doc-part doc-contributors doc-${node.attrs.id} ${node.attrs.metadata || "other"}" id="${this.idPrefix}${node.attrs.id}"${node.attrs.language ? ` lang="${node.attrs.language}"` : ""}>`
                    end = "</div>" + end
                    let counter = 0
                    const contributorOutputs = []
                    node.content.forEach(childNode => {
                        const contributor = childNode.attrs
                        let output = ""
                        if (contributor.firstname || contributor.lastname) {
                            output += `<span id="${this.idPrefix}${node.attrs.id}-${counter++}" class="person">`
                            const nameParts = []
                            if (contributor.firstname) {
                                nameParts.push(
                                    `<span class="firstname">${escapeText(contributor.firstname)}</span>`
                                )
                            }
                            if (contributor.lastname) {
                                nameParts.push(
                                    `<span class="lastname">${escapeText(contributor.lastname)}</span>`
                                )
                            }
                            if (nameParts.length) {
                                output += `<span class="name">${nameParts.join(" ")}</span>`
                            }
                            if (contributor.institution) {
                                let affNumber
                                if (
                                    this.affiliations[contributor.institution]
                                ) {
                                    affNumber =
                                        this.affiliations[
                                            contributor.institution
                                        ]
                                } else {
                                    affNumber = ++this.affCounter
                                    this.affiliations[contributor.institution] =
                                        affNumber
                                }
                                const affNumberDisplay = displayNumber(
                                    affNumber,
                                    this.affiliationNumbering
                                )
                                output += `<a class="affiliation" href="#aff-${affNumber}"${this.epub ? ' epub:type="noteref"' : ""}>${affNumberDisplay}</a>`
                            }
                            output += "</span>"
                        } else if (contributor.institution) {
                            // There is an affiliation but no first/last name. We take this
                            // as a group collaboration.
                            output += `<span id="${this.idPrefix}${node.attrs.id}-${counter++}" class="group">`
                            output += `<span class="name">${escapeText(contributor.institution)}</span>`
                            output += "</span>"
                        }
                        contributorOutputs.push(output)
                    })
                    content += contributorOutputs.join(", ")
                }
                break
            case "tags_part":
                if (node.content) {
                    start += `<div class="doc-part doc-tags doc-${node.attrs.id} doc-${node.attrs.metadata || "other"}" id="${this.idPrefix}${node.attrs.id}"${node.attrs.language ? ` lang="${node.attrs.language}"` : ""}>`
                    end = "</div>" + end
                }
                break
            case "tag":
                content += `<span class='tag'>${escapeText(node.attrs.tag)}</span>`
                break
            case "richtext_part":
                if (node.content) {
                    start += `<div class="doc-part doc-richtext doc-${node.attrs.id} doc-${node.attrs.metadata || "other"}" id="${this.idPrefix}${node.attrs.id}"${node.attrs.language ? ` lang="${node.attrs.language}"` : ""}>`
                    end = "</div>" + end
                }
                break
            case "table_of_contents":
                start += `<div class="doc-part table-of-contents"><h1>${escapeText(node.attrs.title)}</h1>`
                content += this.metaData.toc
                    .map(
                        item =>
                            `<h${item.level}><a href="#${item.id}">${item.title}</a></h${item.level}>`
                    )
                    .join("")
                end += "</div>"
                break
            case "separator_part":
                content += `<hr class="doc-part doc-separator doc-${node.attrs.id} doc-${node.attrs.metadata || "other"}" id="${this.idPrefix}${node.attrs.id}">`
                break
            case "table_part":
                if (node.content) {
                    start += `<div class="doc-part doc-table doc-${node.attrs.id} doc-${node.attrs.metadata || "other"}" id="${this.idPrefix}${node.attrs.id}"${node.attrs.language ? ` lang="${node.attrs.language}"` : ""}>`
                    end = "</div>" + end
                }
                break
            case "paragraph":
                start += `<p id="${this.idPrefix}p-${++this.parCounter}">`
                end = "</p>" + end
                break
            case "heading1":
            case "heading2":
            case "heading3":
            case "heading4":
            case "heading5":
            case "heading6": {
                const level = Number.parseInt(node.type.slice(-1))
                start += `<h${level} id="${this.idPrefix}${node.attrs.id}">`
                end = `</h${level}>` + end
                break
            }
            case "code_block":
                start += "<code>"
                end = "</code>" + end
                break
            case "blockquote":
                start += "<blockquote>"
                end = "</blockquote>" + end
                break
            case "ordered_list": {
                if (node.attrs.order == 1) {
                    start += `<ol id="${this.idPrefix}list-${++this.listCounter}">`
                } else {
                    start += `<ol id="${this.idPrefix}list-${++this.listCounter}" start="${node.attrs.order}">`
                }
                end = "</ol>" + end
                break
            }
            case "bullet_list":
                start += `<ul id="${this.idPrefix}list-${++this.listCounter}">`
                end = "</ul>" + end
                break
            case "list_item":
                start += "<li>"
                end = "</li>" + end
                break
            case "footnote": {
                const footnoteNumber = ++this.fnCounter
                const footnoteNumberDisplay = displayNumber(
                    footnoteNumber,
                    this.footnoteNumbering
                )
                content += `<a class="footnote"${this.epub ? ' epub:type="noteref"' : ""} href="#fn-${footnoteNumber}">${footnoteNumberDisplay}</a>`
                options = Object.assign({}, options)
                options.inFootnote = true
                this.footnotes.push(
                    this.walkJson(
                        {
                            type: "footnotecontainer",
                            attrs: {
                                id: `fn-${footnoteNumber}`,
                                label: footnoteNumberDisplay // Note: it's unclear whether the footnote number is required as a label
                            },
                            content: node.attrs.footnote
                        },
                        options
                    )
                )
                break
            }
            case "footnotecontainer":
                start += `<aside class="footnote"${this.epub ? ' epub:type="footnote"' : ""} role="doc-footnote" id="${this.idPrefix}${node.attrs.id}"><label>${node.attrs.label}</label>`
                end = "</aside>" + end
                break
            case "text": {
                let strong, em, underline, hyperlink, anchor
                // Check for hyperlink, bold/strong, italic/em and underline
                if (node.marks) {
                    strong = node.marks.find(mark => mark.type === "strong")
                    em = node.marks.find(mark => mark.type === "em")
                    underline = node.marks.find(
                        mark => mark.type === "underline"
                    )
                    hyperlink = node.marks.find(mark => mark.type === "link")
                    anchor = node.marks.find(mark => mark.type === "anchor")
                }
                if (em) {
                    start += "<em>"
                    end = "</em>" + end
                }
                if (strong) {
                    start += "<strong>"
                    end = "</strong>" + end
                }
                if (underline) {
                    start += '<span class="underline">'
                    end = "</span>" + end
                }
                if (hyperlink) {
                    const href = hyperlink.attrs.href
                    const link = href.startsWith("#")
                        ? `#${this.idPrefix}${href.slice(1)}`
                        : href
                    start += `<a href="${link}">`
                    end = "</a>" + end
                }
                if (anchor) {
                    const id = anchor.attrs.id
                    start += `<span class="anchor" id="${this.idPrefix}${id}" data-id="${this.idPrefix}${id}">`
                    end = "</span>" + end
                }
                content += escapeText(node.text).normalize("NFC")
                break
            }
            case "cross_reference": {
                start += `<a class="reference" href="#${this.idPrefix}${node.attrs.id}">`
                content += escapeText(node.attrs.title || "MISSING TARGET")
                end = "</a>" + end
                break
            }
            case "citation": {
                if (!this.citations.citationTexts.length) {
                    // There are no citations. This may happen while analyzing.
                    return ""
                }
                const citationText =
                    this.citations.citationTexts[this.citationCount++]
                if (
                    options.inFootnote ||
                    this.citations.citationType !== "note"
                ) {
                    content += citationText
                } else {
                    content += `<a class="footnote"${this.epub ? 'epub:type="noteref" ' : ""} href="#fn-${++this.fnCounter}">${this.fnCounter}</a>`
                    this.footnotes.push(
                        `<aside class="footnote"${this.epub ? 'epub:type="footnote" ' : ""} id="fn-${this.fnCounter}"><label>${this.fnCounter}</label><p id="${this.idPrefix}p-${++this.parCounter}">${citationText}</p></aside>`
                    )
                }
                break
            }
            case "figure": {
                let imageUrl, copyright
                const image =
                    node.content.find(node => node.type === "image")?.attrs
                        .image || false
                if (image !== false) {
                    this.imageIds.push(image)
                    const imageDBEntry = this.imageDB.db[image],
                        filePathName = imageDBEntry.image
                    copyright = imageDBEntry.copyright
                    imageUrl = this.relativeUrls
                        ? `images/${filePathName.split("/").pop()}`
                        : filePathName
                }
                const caption = node.attrs.caption
                    ? node.content.find(node => node.type === "figure_caption")
                          ?.content || []
                    : []
                if (
                    node.attrs.category === "none" &&
                    imageUrl &&
                    !caption.length &&
                    (!copyright || !copyright.holder)
                ) {
                    content += `<img id="${this.idPrefix}${node.attrs.id}" class="aligned-${node.attrs.aligned} image-width-${node.attrs.width}" src="${imageUrl}"${this.endSlash}>`
                } else {
                    start += `<figure
                        id="${this.idPrefix}${node.attrs.id}"
                        class="aligned-${node.attrs.aligned} image-width-${node.attrs.width}"
                        data-aligned="${node.attrs.aligned}"
                        data-width="${node.attrs.width}"
                        data-category="${node.attrs.category}"
                    >`
                    end = "</figure>" + end

                    const equation = node.content.find(
                        node => node.type === "figure_equation"
                    )?.attrs.equation

                    if (image && copyright?.holder) {
                        let figureFooter = `<footer class="copyright ${copyright.freeToRead ? "free-to-read" : "not-free-to-read"}"><small>`
                        figureFooter += "© "
                        const year = copyright.year
                            ? copyright.year
                            : new Date().getFullYear()
                        figureFooter += `<span class="copyright-year">${year}</span> `
                        figureFooter += `<span class="copyright-holder">${escapeText(copyright.holder)}</span> `
                        figureFooter += copyright.licenses
                            .map(
                                license =>
                                    `<span class="license"><a rel="license"${license.start ? ` data-start="${license.start}"` : ""}>${escapeText(license.url)}</a></span>`
                            )
                            .join("")
                        figureFooter += "</small></footer>"
                        end = figureFooter + end
                    }

                    const category = node.attrs.category
                    if (caption.length || category !== "none") {
                        let figcaption = "<figcaption>"
                        if (category !== "none") {
                            if (!this.categoryCounter[category]) {
                                this.categoryCounter[category] = 0
                            }
                            const catCount = ++this.categoryCounter[category]
                            const catLabel = `${CATS[category][this.docSettings.language]} ${catCount}`
                            figcaption += `<label>${escapeText(catLabel)}</label>`
                        }
                        if (caption.length) {
                            figcaption += `<p>${caption.map(node => this.walkJson(node)).join("")}</p>`
                        }
                        figcaption += "</figcaption>"
                        if (category === "table") {
                            start += figcaption
                        } else {
                            end = figcaption + end
                        }
                    }

                    if (equation) {
                        start += `<div class="figure-equation" data-equation="${escapeText(equation)}"><math display="block">`
                        end = "</math></div>" + end
                        content = convertLatexToMathMl(equation)
                    } else {
                        if (imageUrl) {
                            content += `<img src="${imageUrl}"${this.endSlash}>`
                        }
                    }
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
                start += `<table
                id="${this.idPrefix}${node.attrs.id}"
                class="table-${node.attrs.width}
                table-${node.attrs.aligned}
                table-${node.attrs.layout}"
                data-width="${node.attrs.width}"
                data-aligned="${node.attrs.aligned}"
                data-layout="${node.attrs.layout}"
                data-category="${node.attrs.category}"
            >`
                end = "</table>" + end
                const category = node.attrs.category
                if (category !== "none") {
                    if (!this.categoryCounter[category]) {
                        this.categoryCounter[category] = 0
                    }
                    const catCount = ++this.categoryCounter[category]
                    const catLabel = `${CATS[category][this.docSettings.language]} ${catCount}`
                    start += `<label>${escapeText(catLabel)}</label>`
                }
                const caption = node.attrs.caption
                    ? node.content[0].content || []
                    : []
                if (caption.length) {
                    start += `<caption><p>${caption.map(node => this.walkJson(node)).join("")}</p></caption>`
                }
                start += "<tbody>"
                end = "</tbody>" + end
                break
            }
            case "table_body":
                // Pass through to table.
                break
            case "table_caption":
                // We already deal with this in 'table'.
                return ""
            case "table_row":
                start += "<tr>"
                end = "</tr>" + end
                break
            case "table_cell":
                start += `<td${node.attrs.colspan === 1 ? "" : ` colspan="${node.attrs.colspan}"`}${node.attrs.rowspan === 1 ? "" : ` rowspan="${node.attrs.rowspan}"`}>`
                end = "</td>" + end
                break
            case "table_header":
                start += `<th${node.attrs.colspan === 1 ? "" : ` colspan="${node.attrs.colspan}"`}${node.attrs.rowspan === 1 ? "" : ` rowspan="${node.attrs.rowspan}"`}>`
                end = "</th>" + end
                break
            case "equation":
                start += '<span class="equation"><math>'
                end = "</math></span>" + end
                content = convertLatexToMathMl(node.attrs.equation)
                break
            case "hard_break":
                content += `<br${this.endSlash}>`
                break
            default:
                break
        }

        if (!content.length && node.content) {
            node.content.forEach(child => {
                content += this.walkJson(child, options)
            })
        }

        return start + content + end
    }

    assembleBody() {
        return `<div id="${this.idPrefix}body">${this.walkJson(this.docContent)}</div>`
    }

    assembleBack() {
        let back = ""
        if (
            this.footnotes.length ||
            this.citations.bibHTML.length ||
            Object.keys(this.affiliations).length
        ) {
            back += `<div id="${this.idPrefix}back">`
            if (Object.keys(this.affiliations).length) {
                back += `<section id="${this.idPrefix}affiliations" class="affiliations">${Object.entries(
                    this.affiliations
                )
                    .map(
                        ([name, id]) =>
                            `<aside class="affiliation" id="aff-${id}"${this.epub ? 'epub:type="footnote"' : ""}><label>${displayNumber(id, this.affiliationNumbering)}</label> <div>${escapeText(name)}</div></aside>`
                    )
                    .join("")}</section>`
            }
            if (this.footnotes.length) {
                back += `<section class="fnlist footnotes" role="doc-footnotes" id="${this.idPrefix}footnotes">${this.footnotes.join("")}</section>`
            }
            if (this.citations.bibHTML.length) {
                back += `<div id="${this.idPrefix}references" class="references">${this.citations.bibHTML}</div>`
            }
            back += "</div>"
        }
        return back
    }
}
