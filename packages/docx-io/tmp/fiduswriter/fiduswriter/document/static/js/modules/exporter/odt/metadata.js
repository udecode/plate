import {escapeText} from "../../common"

export class ODTExporterMetadata {
    constructor(xml, styles, metadata) {
        this.xml = xml
        this.styles = styles
        this.metadata = metadata
        this.metaXml = false
    }

    init() {
        return this.xml.getXml("meta.xml").then(metaXml => {
            this.metaXml = metaXml
            this.addMetadata()
            return Promise.resolve()
        })
    }

    addMetadata() {
        const metaEl = this.metaXml.query("office:meta")

        // Title
        let titleEl = this.metaXml.query("dc:title")
        if (!titleEl) {
            metaEl.appendXML("<dc:title></dc:title>")
            titleEl = this.metaXml.children[this.metaXml.children.length - 1]
        }
        titleEl.innerXML = escapeText(this.metadata.title)

        // Authors
        const authors = this.metadata.authors.map(author => {
            const nameParts = []
            if (author.firstname) {
                nameParts.push(author.firstname)
            }
            if (author.lastname) {
                nameParts.push(author.lastname)
            }
            if (!nameParts.length && author.institution) {
                // We have an institution but no names. Use institution as name.
                nameParts.push(author.institution)
            }
            return nameParts.join(" ")
        })

        const initialAuthor = authors.length
            ? escapeText(authors[0])
            : gettext("Unknown")
        // TODO: We likely want to differentiate between first and last author.
        const lastAuthor = initialAuthor

        let lastAuthorEl = this.metaXml.query("dc:creator")
        if (!lastAuthorEl) {
            metaEl.appendXML("<dc:creator></dc:creator>")
            lastAuthorEl =
                this.metaXml.children[this.metaXml.children.length - 1]
        }
        lastAuthorEl.innerXML = lastAuthor
        let initialAuthorEl = this.metaXml.query("meta:initial-creator")
        if (!initialAuthorEl) {
            metaEl.appendXML("<meta:initial-creator></meta:initial-creator>")
            initialAuthorEl =
                this.metaXml.children[this.metaXml.children.length - 1]
        }
        initialAuthorEl.innerXML = initialAuthor

        // Keywords
        // Remove all existing keywords
        const keywordEls = this.metaXml.queryAll("meta:keywords")
        keywordEls.forEach(keywordEl =>
            keywordEl.parentElement.removeChild(keywordEl)
        )
        // Add new keywords
        const keywords = this.metadata.keywords
        keywords.forEach(keyword =>
            metaEl.appendXML(
                `<meta:keyword>${escapeText(keyword)}</meta:keyword>`
            )
        )

        // language
        // LibreOffice seems to ignore the value set in metadata and instead uses
        // the one set in default styles. So we set both.
        this.styles.setLanguage(this.metadata.language)
        let languageEl = this.metaXml.query("dc:language")
        if (!languageEl) {
            metaEl.appendXML("<dc:language></dc:language>")
            languageEl = this.metaXml.children[this.metaXml.children.length - 1]
        }
        languageEl.innerXML = this.metadata.language
        // time
        const date = new Date()
        const dateString = date.toISOString().split(".")[0]
        const createdEl = metaEl.query("meta:creation-date")
        createdEl.innerXML = dateString
        let dateEl = this.metaXml.query("dc:date")
        if (!dateEl) {
            metaEl.appendXML("<dc:date></dc:date>")
            dateEl = this.metaXml.children[this.metaXml.children.length - 1]
        }
        dateEl.innerXML = `${dateString}.000000000`
    }
}
