import {BIBLIOGRAPHY_HEADERS, CATS} from "../../schema/i18n"
import {escapeLatexText} from "./escape_latex"

export class LatexExporterConvert {
    constructor(exporter, imageDB, bibDB, settings) {
        this.exporter = exporter
        this.settings = settings
        this.imageDB = imageDB
        this.bibDB = bibDB
        this.imageIds = []
        this.usedBibDB = {}
        // While walking the tree, we take note of the kinds of features That
        // are present in the file, so that we can assemble an preamble and
        // epilogue based on our findings.
        this.features = {}
        this.internalLinks = []
        this.categoryCounter = {} // counters for each type of figure (figure/table/photo)
        this.authorsTex = ""
    }

    init(docContent) {
        this.preWalkJson(docContent)
        const rawTransformation = this.walkJson(docContent)
        const body = this.postProcess(rawTransformation)
        const copyright = this.assembleCopyright()
        const preamble = this.assemblePreamble()
        const epilogue = this.assembleEpilogue()
        const latex =
            copyright +
            this.docDeclaration +
            preamble +
            this.authorsTex +
            "\n\\begin{document}\n" +
            body +
            epilogue +
            "\n\\end{document}\n"
        const returnObject = {
            latex,
            imageIds: this.imageIds,
            usedBibDB: this.usedBibDB
        }
        return returnObject
    }

    get docDeclaration() {
        return "\\documentclass{article}\n"
    }

    // Check for things needed before creating raw transform
    preWalkJson(node) {
        switch (node.type) {
            // Collect all internal links so that we only set the anchors for those
            // that are being linked to.
            case "text":
                if (node.marks) {
                    const hyperlink = node.marks.find(
                        mark => mark.type === "link"
                    )
                    if (hyperlink) {
                        const href = hyperlink.attrs.href
                        if (
                            href[0] === "#" &&
                            !this.internalLinks.includes(href)
                        ) {
                            this.internalLinks.push(href.slice(1))
                        }
                    }
                }
                break
        }
        if (node.content) {
            node.content.forEach(child => this.preWalkJson(child))
        }
    }

    walkJson(node, options = {}) {
        let start = "",
            content = "",
            end = "",
            placeFootnotesAfterBlock = false
        switch (node.type) {
            case "doc":
                break
            case "title":
                start += "\n\\title{"
                end = "}" + end
                break
            case "heading_part":
                if (node.attrs.metadata === "subtitle" && node.content) {
                    start += "\n\\subtitle{"
                    end = "}" + end
                    this.features.subtitle = true
                    options = Object.assign({}, options)
                    options.ignoreHeading = true
                } else if (!options.madeTitle) {
                    start += "\n\n\\maketitle\n"
                    options.madeTitle = true
                }
                break
            case "contributor":
                // Ignore - we deal with contributors_part instead.
                break
            case "contributors_part":
                if (node.content) {
                    if (node.attrs.metadata === "authors") {
                        // TODO: deal with node.attrs.metadata === 'editors'
                        const authorsPerAffil = node.content
                            .map(node => {
                                const author = node.attrs,
                                    nameParts = []
                                let affiliation = false
                                if (author.firstname) {
                                    nameParts.push(author.firstname)
                                }
                                if (author.lastname) {
                                    nameParts.push(author.lastname)
                                }
                                if (nameParts.length && author.institution) {
                                    affiliation = author.institution
                                } else if (author.institution) {
                                    // We have an institution but no names. Use institution as name.
                                    nameParts.push(author.institution)
                                }
                                return {
                                    name: nameParts.join(" "),
                                    affiliation,
                                    email: author.email
                                }
                            })
                            .reduce((affils, author) => {
                                const affil = author.affiliation
                                affils[affil] = affils[affil] || []
                                affils[affil].push(author)
                                return affils
                            }, {})

                        Object.values(authorsPerAffil).forEach(affil => {
                            affil.forEach(author => {
                                this.authorsTex += `\n\\author{${escapeLatexText(author.name)}${
                                    author.email
                                        ? `\\thanks{${escapeLatexText(author.email)}}`
                                        : ""
                                }}`
                            })

                            this.authorsTex += `\n\\affil{${
                                affil[0].affiliation
                                    ? escapeLatexText(affil[0].affiliation)
                                    : ""
                            }}`
                        })
                        this.authorsTex += "\n\n"
                        this.features.authors = true
                    } else {
                        if (!options.madeTitle) {
                            start += "\n\n\\maketitle\n"
                            options.madeTitle = true
                        }
                        // TODO: deal with contributor lists of non-authors properly
                        content += node.content
                            .map(contributorNode => {
                                const nameParts = []
                                if (contributorNode.attrs.firstname) {
                                    nameParts.push(
                                        contributorNode.attrs.firstname
                                    )
                                }
                                if (contributorNode.attrs.lastname) {
                                    nameParts.push(
                                        contributorNode.attrs.lastname
                                    )
                                }
                                if (
                                    !nameParts.length &&
                                    contributorNode.attrs.institution
                                ) {
                                    // We have an institution but no names. Use institution as name.
                                    nameParts.push(
                                        contributorNode.attrs.institution
                                    )
                                }
                                return nameParts.join(" ")
                            })
                            .join(", ")
                        content += "\n\n"
                    }
                }

                break
            case "tags_part":
                if (node.content) {
                    if (node.attrs.metadata === "keywords") {
                        start += "\n\\keywords{"
                        end = "}" + end
                        this.features.keywords = true
                    } else if (!options.madeTitle) {
                        start += "\n\n\\maketitle\n"
                        options.madeTitle = true
                    }
                    content += node.content
                        .map(keyword => escapeLatexText(keyword.attrs.tag))
                        .join("\\sep ")
                }
                break
            case "tag":
                // Ignore - we already took all the tags_part from the keywords node.
                break
            case "richtext_part":
                if (!options.madeTitle) {
                    start += "\n\n\\maketitle\n"
                    options.madeTitle = true
                }
                if (node.content && node.attrs.metadata === "abstract") {
                    start += "\n\\begin{abstract}\n"
                    end = "\n\\end{abstract}\n" + end
                }
                break
            case "table_of_contents":
                start += "\n\n\\tableofcontents\n"
                break
            case "separator_part":
            case "table_part":
                // part separators as in page breaks should usually already be handled
                // by LaTeX and table parts will simply show the table inside of them.
                break
            case "paragraph":
                start += "\n\n"
                end = "\n" + end
                break
            case "heading1":
            case "heading2":
            case "heading3":
            case "heading4":
            case "heading5":
            case "heading6": {
                if (options.ignoreHeading) {
                    break
                }
                const level = Number.parseInt(node.type.slice(-1))
                switch (level) {
                    case 1:
                        start += "\n\n\\section{"
                        break
                    case 2:
                        start += "\n\n\\subsection{"
                        break
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                        // TODO: Add support for levels 4/5/6
                        start += "\n\n\\subsubsection{"
                        break
                }
                end = `}\\label{${node.attrs.id}}\n\n` + end
                // Check if this heading is being linked to. If this is the case,
                // place a protected hypertarget here that does not add an extra
                // entry into the PDF TOC.
                if (this.internalLinks.includes(node.attrs.id)) {
                    // Add a link target
                    end =
                        end +
                        `\\texorpdfstring{\\protect\\hypertarget{${node.attrs.id}}{}}{}`
                }
                options = Object.assign({}, options)
                options.noLineBreak = true
                if (!options.onlyFootnoteMarkers) {
                    placeFootnotesAfterBlock = true
                    options.onlyFootnoteMarkers = true
                    options.unplacedFootnotes = []
                }
                break
            }
            case "code_block":
                start += "\n\\begin{code}\n\n"
                end = "\n\n\\end{code}\n" + end
                this.features.code = true
                break
            case "blockquote":
                start += "\n\\begin{quote}\n\n"
                end = "\n\n\\end{quote}\n" + end
                break
            case "ordered_list":
                if (node.attrs.order !== 1) {
                    start += `\n\\begin{enumerate}[start=${node.attrs.order}]`
                    this.features.orderedListStart = true
                } else {
                    start += "\n\\begin{enumerate}"
                }
                end = "\n\\end{enumerate}" + end
                if (!options.onlyFootnoteMarkers) {
                    placeFootnotesAfterBlock = true
                    options = Object.assign({}, options)
                    options.onlyFootnoteMarkers = true
                    options.unplacedFootnotes = []
                }
                break
            case "bullet_list":
                start += "\n\\begin{itemize}"
                end = "\n\\end{itemize}" + end
                if (!options.onlyFootnoteMarkers) {
                    placeFootnotesAfterBlock = true
                    options = Object.assign({}, options)
                    options.onlyFootnoteMarkers = true
                    options.unplacedFootnotes = []
                }
                break
            case "list_item":
                start += "\n\\item "
                end = "\n" + end
                break
            case "footnote":
                if (options.onlyFootnoteMarkers) {
                    // We are inside a headline or a list and can only place a
                    // footnote marker here. The footnote will have to be put
                    // beyond the block node instead.
                    start += "\\protect\\footnotemark{}"
                    options.unplacedFootnotes.push(node.attrs.footnote)
                } else {
                    if (
                        !node.attrs.footnote.find(par => par.type === "figure")
                    ) {
                        // LaTeX doesn't allow figures in footnotes, so well move
                        // this footnote into the regular text.
                        start += "\\footnote{"
                        end = "}" + end
                    }
                    let fnContent = ""
                    node.attrs.footnote.forEach(footPar => {
                        fnContent += this.walkJson(footPar, options)
                    })
                    content += fnContent.replace(/^\s+|\s+$/g, "")
                }
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
                    start += "\\emph{"
                    end = "}" + end
                }
                if (strong) {
                    start += "\\textbf{"
                    end = "}" + end
                }
                if (underline) {
                    start += "\\underline{"
                    end = "}" + end
                }
                if (hyperlink) {
                    const href = hyperlink.attrs.href
                    if (href[0] === "#") {
                        // Internal link
                        start += `\\hyperlink{${href.slice(1)}}{`
                    } else {
                        // External link
                        start += `\\href{${href}}{`
                    }
                    end = "}" + end
                    this.features.hyperlinks = true
                }
                if (anchor && this.internalLinks.includes(anchor.attrs.id)) {
                    // Add a link target
                    start += `\\hypertarget{${anchor.attrs.id}}{`
                    end = "}" + end
                }
                content += escapeLatexText(node.text)
                break
            }
            case "cross_reference": {
                content += `\\hyperref[${node.attrs.id}]{${node.attrs.title || "MISSING TARGET"}}`
                this.features.hyperlinks = true
                break
            }
            case "citation": {
                const references = node.attrs.references
                const format = node.attrs.format
                let citationCommand = "\\" + format

                if (
                    references.length > 1 &&
                    references.every(ref => !ref.locator && !ref.prefix)
                ) {
                    // multi source citation without page numbers or text before.
                    const citationEntryKeys = []

                    const allCitationItemsPresent = references
                        .map(ref => ref.id)
                        .every(citationEntry => {
                            const bibDBEntry = this.bibDB.db[citationEntry]
                            if (bibDBEntry) {
                                if (!bibDBEntry) {
                                    // Not present in bibliography database, skip it.
                                    // TODO: Throw an error?
                                    return false
                                }
                                if (!this.usedBibDB[citationEntry]) {
                                    const citationKey =
                                        this.createUniqueCitationKey(
                                            bibDBEntry.entry_key
                                        )
                                    this.usedBibDB[citationEntry] =
                                        Object.assign({}, bibDBEntry)
                                    this.usedBibDB[citationEntry].entry_key =
                                        citationKey
                                }
                                citationEntryKeys.push(
                                    this.usedBibDB[citationEntry].entry_key
                                )
                            }
                            return true
                        })
                    if (allCitationItemsPresent) {
                        citationCommand += `{${citationEntryKeys.join(",")}}`
                    } else {
                        citationCommand = false
                    }
                } else {
                    if (references.length > 1) {
                        citationCommand += "s" // Switching from \autocite to \autocites
                    }

                    const allCitationItemsPresent = references.every(ref => {
                        const bibDBEntry = this.bibDB.db[ref.id]
                        if (!bibDBEntry) {
                            // Not present in bibliography database, skip it.
                            // TODO: Throw an error?
                            return false
                        }

                        if (ref.prefix) {
                            citationCommand += `[${ref.prefix}]`
                            if (!ref.locator) {
                                citationCommand += "[]"
                            }
                        }
                        if (ref.locator) {
                            citationCommand += `[${ref.locator}]`
                        }
                        citationCommand += "{"

                        if (!this.usedBibDB[ref.id]) {
                            const citationKey = this.createUniqueCitationKey(
                                bibDBEntry.entry_key
                            )
                            this.usedBibDB[ref.id] = Object.assign(
                                {},
                                bibDBEntry
                            )
                            this.usedBibDB[ref.id].entry_key = citationKey
                        }
                        citationCommand += this.usedBibDB[ref.id].entry_key
                        citationCommand += "}"

                        return true
                    })

                    if (!allCitationItemsPresent) {
                        citationCommand = false
                    }
                }
                if (citationCommand) {
                    content += citationCommand
                    this.features.citations = true
                }
                break
            }
            case "figure": {
                const category = node.attrs.category
                const captionContent = node.attrs.caption
                    ? node.content.find(node => node.type === "figure_caption")
                          ?.content || []
                    : []
                let caption
                if (category !== "none") {
                    if (!this.categoryCounter[category]) {
                        this.categoryCounter[category] = 1
                    }
                    const catCount = this.categoryCounter[category]++
                    const catLabel = `${CATS[category][this.settings.language]} ${catCount}`
                    if (captionContent.length) {
                        caption = `${catLabel}: ${captionContent.map(node => this.walkJson(node)).join("")}`
                    } else {
                        caption = catLabel
                    }
                } else {
                    caption = captionContent
                        .map(node => this.walkJson(node))
                        .join("")
                }
                let innerFigure = ""
                let copyright
                const image =
                    node.content.find(node => node.type === "image")?.attrs
                        .image || false
                if (image) {
                    this.imageIds.push(image)
                    const imageDBEntry = this.imageDB.db[image],
                        filePathName = imageDBEntry.image,
                        filename = filePathName.split("/").pop()
                    copyright = imageDBEntry.copyright
                    if (filename.split(".").pop() === "svg") {
                        innerFigure += `\\includesvg[width=${Number.parseInt(node.attrs.width) / 100}\\textwidth]{${filename}}\n`
                        this.features.SVGs = true
                    } else {
                        innerFigure += `\\scaledgraphics{${filename}}{${Number.parseInt(node.attrs.width) / 100}}\n`
                        this.features.images = true
                    }
                } else {
                    const equation =
                        node.content.find(
                            node => node.type === "figure_equation"
                        )?.attrs.equation || ""
                    innerFigure += `\\begin{displaymath}\n${equation}\n\\end{displaymath}\n`
                }
                if (category === "table") {
                    const aligned =
                        node.attrs.width === "100" ? "left" : node.attrs.aligned
                    if (aligned === "center") {
                        start += "\n\n\\begin{center}"
                        end = "\n\n\\end{center}\n" + end
                    } else if (aligned === "right") {
                        start += "\n\n{\\raggedleft" // This is not a typo - raggedleft = aligned: right
                        end = "\n\n}\n" + end
                    } // aligned === 'left' is default
                    start += "\n\\begin{table}\n"
                    content += caption.length ? `\\caption*{${caption}}` : ""
                    content += `\\label{${node.attrs.id}}\n${innerFigure}`
                    end = "\\end{table}\n" + end
                } else {
                    // TODO: handle photo figure types in a special way
                    if (
                        node.attrs.width === "100" ||
                        node.attrs.aligned === "center"
                    ) {
                        start += "\n\\begin{figure}\n"
                        end = "\\end{figure}\n" + end
                    } else {
                        const aligned = node.attrs.aligned[0]
                        start += `\n\\begin{wrapfigure}{${aligned}}{${Number.parseInt(node.attrs.width) / 100}\\textwidth}\n`
                        end = "\\end{wrapfigure}\n" + end
                        this.features.wrapfig = true
                    }
                    content += `${innerFigure}${caption.length ? `\\caption*{${caption}}` : ""}\\label{${node.attrs.id}}\n`
                }
                if (copyright?.holder) {
                    content += `% © ${copyright.year ? copyright.year : new Date().getFullYear()} ${copyright.holder}\n`
                }
                if (copyright?.licenses.length) {
                    copyright.licenses.forEach(license => {
                        content += `% ${license.title}: ${license.url}${license.start ? ` (${license.start})\n` : ""}\n`
                    })
                }
                if (this.internalLinks.includes(node.attrs.id)) {
                    // Add a link target
                    end =
                        `\\texorpdfstring{\\protect\\hypertarget{${node.attrs.id}}{}}{}\n` +
                        end
                }
                this.features.captions = true
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
            case "table":
                if (node.content?.length) {
                    const category = node.attrs.category

                    const captionContent = node.attrs.caption
                        ? node.content[0].content || []
                        : []
                    let caption
                    if (category !== "none") {
                        if (!this.categoryCounter[category]) {
                            this.categoryCounter[category] = 1
                        }
                        const catCount = this.categoryCounter[category]++
                        const catLabel = `${CATS[category][this.settings.language]} ${catCount}`
                        if (captionContent.length) {
                            caption = `${catLabel}: ${captionContent.map(node => this.walkJson(node)).join("")}`
                        } else {
                            caption = catLabel
                        }
                    } else {
                        caption = captionContent
                            .map(node => this.walkJson(node))
                            .join("")
                    }
                    let columns = 1
                    if (
                        node.content.length > 1 &&
                        node.content[1].content?.length
                    ) {
                        columns = node.content[1].content[0].content.reduce(
                            (columns, node) => columns + node.attrs.colspan,
                            0
                        )
                    }
                    const aligned =
                        node.attrs.width === "100" ? "left" : node.attrs.aligned
                    if (aligned === "center") {
                        start += "\n\n\\begin{center}"
                        end = "\n\n\\end{center}\n" + end
                    } else if (aligned === "right") {
                        start += "\n\n{\\raggedleft" // This is not a typo - raggedleft = aligned: right
                        end = "\n\n}\n"
                    } // aligned === 'left' is default
                    if (caption.length) {
                        start += "\n\\begin{table}\n"
                        start += `\\caption*{${caption}}\\label{${node.attrs.id}}`
                        end = "\\end{table}\n" + end
                        this.features.captions = true
                    }
                    start += `\n\n\\begin{tabu} to ${
                        node.attrs.width === "100"
                            ? ""
                            : Number.parseInt(node.attrs.width) / 100
                    }\\textwidth { |${"X|".repeat(columns)} }\n\\hline\n\n`
                    end = "\\hline\n\n\\end{tabu}" + end
                    this.features.tables = true
                }
                break
            case "table_body":
                // Pass through to table.
                break
            case "table_caption":
                // We already deal with this in 'table'.
                return ""
            case "table_row":
                end += " \\\\\n"
                break
            case "table_cell":
            case "table_header":
                if (node.attrs.colspan > 1) {
                    start += `\\multicolumn{${node.attrs.colspan}}{c}{`
                    end += "}"
                }
                // TODO: these multirow outputs don't work very well with longer text.
                // If there is another alternative, please change!
                if (node.attrs.rowspan > 1) {
                    start += `\\multirow{${node.attrs.rowspan}}{*}{`
                    end += "}"
                    this.features.rowspan = true
                }
                end += " & "
                break
            case "equation":
                content += `$${node.attrs.equation}$`
                break
            case "hard_break":
                if (!options.noLineBreak) {
                    content += "\n\n"
                }
                break
            default:
                break
        }

        if (node.content) {
            node.content.forEach(child => {
                content += this.walkJson(child, options)
            })
        }
        if (placeFootnotesAfterBlock && options.unplacedFootnotes?.length) {
            // There are footnotes that needed to be placed behind the node.
            // This happens in the case of headlines and lists.
            end += `\\addtocounter{footnote}{-${options.unplacedFootnotes.length}}`
            options.unplacedFootnotes.forEach(footnote => {
                end += "\\stepcounter{footnote}\n"
                end += "\\footnotetext{"
                let fnContent = ""
                footnote.forEach(footPar => {
                    fnContent += this.walkJson(footPar, options)
                })
                end += fnContent.replace(/^\s+|\s+$/g, "")
                end += "}"
            })
            options.unplacedFootnotes = []
        }
        if (
            ["table_cell", "table_header"].includes(node.type) &&
            node.attrs.rowspan > 1
        ) {
            // \multirow doesn't allow multiple paragraphs.
            content = content.trim().replace(/\n\n/g, " \\\\ ")
        }

        return start + content + end
    }

    // The database doesn't ensure that citation keys are unique.
    // So here we need to make sure that the same key is not used twice in one
    // document.
    createUniqueCitationKey(suggestedKey) {
        const usedKeys = Object.keys(this.usedBibDB).map(key => {
            return this.usedBibDB[key].entry_key
        })
        if (usedKeys.includes(suggestedKey)) {
            suggestedKey += "X"
            return this.createUniqueCitationKey(suggestedKey)
        } else {
            return suggestedKey
        }
    }

    postProcess(latex) {
        return (
            latex
                // join blocks of the same type that follow oneanother.
                .replace(/\\end{code}\n\n\\begin{code}\n\n/g, "")
                .replace(/\\end{quote}\n\n\\begin{quote}\n\n/g, "")
                // Remove the last divider in any any table row.
                .replace(/& {2}\\\\/g, "\\\\")
                // Remove new lines between table cells.
                .replace(/\n & \n\n/g, " & ")
                // Remove new lines within itemization
                .replace(/\\item \n\n/g, "\\item ")
        )
    }

    assembleEpilogue() {
        let epilogue = ""
        if (this.features.citations) {
            const bibliographyHeader =
                this.settings.bibliography_header[this.settings.language] ||
                BIBLIOGRAPHY_HEADERS[this.settings.language]
            epilogue += `\n\n\\printbibliography[title={${escapeLatexText(bibliographyHeader)}}]`
        }
        return epilogue
    }

    assembleCopyright() {
        let note = ""
        if (this.settings.copyright) {
            if (this.settings.copyright.holder) {
                note += `% © ${this.settings.copyright.year ? this.settings.copyright.year : new Date().getFullYear()} ${this.settings.copyright.holder}\n`
            }
            if (this.settings.copyright.licenses.length) {
                this.settings.copyright.licenses.forEach(license => {
                    note += `% ${license.url}${license.start ? ` (${license.start})` : ""}\n`
                })
            }
        }

        if (note.length) {
            note += "\n\n"
        }
        return note
    }

    assemblePreamble() {
        let preamble = ""

        if (this.features.subtitle) {
            preamble += `
                \n\\usepackage{titling}
                \n\\newcommand{\\subtitle}[1]{%
                    \n\t\\posttitle{%
                        \n\t\t\\par\\end{center}
                        \n\t\t\\begin{center}\\large#1\\end{center}
                        \n\t\t\\vskip 0.5em}%
                }
            `
        }
        if (this.features.authors) {
            preamble += `
                \n\\usepackage{authblk}
                \n\\makeatletter
                \n\\let\\@fnsymbol\\@alph
                \n\\makeatother
            `
        }

        if (this.features.keywords) {
            preamble += `
                \n\\def\\keywords{\\vspace{.5em}
                \n{\\textit{Keywords}:\\,\\relax%
                \n}}
                \n\\def\\endkeywords{\\par}
                \n\\newcommand{\\sep}{, }
            `
        }

        if (this.features.hyperlinks) {
            preamble += "\n\\usepackage{hyperref}"
        }

        if (this.features.captions) {
            preamble += "\n\\usepackage{caption}"
        }

        if (this.features.wrapfig) {
            preamble += "\n\\usepackage{wrapfig}"
        }

        if (this.features.citations) {
            preamble += `
                \n\\usepackage[backend=biber,hyperref=false,citestyle=authoryear,bibstyle=authoryear]{biblatex}
                \n\\bibliography{bibliography}
            `
        }

        if (this.features.SVGs) {
            preamble += "\n\\usepackage{svg}"
        }

        if (this.features.images) {
            preamble += "\n\\usepackage{graphicx}"
            // The following scales graphics down to text width, but not scaling them up if they are smaller
            preamble += `
                \n\\usepackage{calc}
                \n\\newlength{\\imgwidth}
                \n\\newcommand\\scaledgraphics[2]{%
                \n\\settowidth{\\imgwidth}{\\includegraphics{#1}}%
                \n\\setlength{\\imgwidth}{\\minof{\\imgwidth}{#2\\textwidth}}%
                \n\\includegraphics[width=\\imgwidth,height=\\textheight,keepaspectratio]{#1}%
                \n}
            `
        }

        if (this.features.tables) {
            preamble += "\n\\usepackage{tabu}"
        }

        if (this.features.orderedListStart) {
            preamble += "\n\\usepackage{enumitem}"
        }

        if (this.features.rowspan) {
            preamble += "\n\\usepackage{multirow}"
        }

        if (this.features.code) {
            // See https://tex.stackexchange.com/questions/445424/making-a-multiline-code-environment
            preamble += `
            \n\\usepackage{xcolor}
            \\definecolor{mygray}{gray}{0.9}
            \\usepackage{fvextra}
            \\usepackage{tcolorbox}
            \\newenvironment{code}%
            {\\VerbatimEnvironment
            \\begin{tcolorbox}[colback=mygray, boxsep=0pt, arc=0pt, boxrule=0pt]
            \\begin{Verbatim}[fontsize=\\scriptsize, commandchars=\\\\\\{\\},
            breaklines, breakafter=*, breaksymbolsep=0.5em,
            breakaftersymbolpre={\\,\\tiny\\ensuremath{\\rfloor}}]}%
            {\\end{Verbatim}%
             \\end{tcolorbox}}
            `
        }

        return preamble
    }
}
