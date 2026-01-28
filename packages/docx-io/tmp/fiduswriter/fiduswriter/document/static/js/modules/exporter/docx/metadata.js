import {escapeText} from "../../common"

export class DOCXExporterMetadata {
    constructor(xml, metadata) {
        this.xml = xml
        this.metadata = metadata
        this.coreXML = false
    }

    init() {
        return this.xml.getXml("docProps/core.xml").then(coreXML => {
            this.coreXML = coreXML
            this.addMetadata()
            return Promise.resolve()
        })
    }

    addMetadata() {
        const corePropertiesEl = this.coreXML.query("cp:coreProperties")

        // Title
        let titleEl = this.coreXML.query("dc:title")
        if (!titleEl) {
            corePropertiesEl.appendXML("<dc:title></dc:title>")
            titleEl = corePropertiesEl.lastElementChild
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
        const lastAuthor = authors.length
            ? escapeText(authors[0])
            : gettext("Unknown")
        const allAuthors = authors.length
            ? escapeText(authors.join(";"))
            : gettext("Unknown")
        let allAuthorsEl = this.coreXML.query("dc:creator")

        if (!allAuthorsEl) {
            corePropertiesEl.appendXML("<dc:creator></dc:creator>")
            allAuthorsEl = corePropertiesEl.lastElementChild
        }
        allAuthorsEl.innerXML = allAuthors
        let lastAuthorEl = this.coreXML.query("dc:lastModifiedBy")
        if (!lastAuthorEl) {
            corePropertiesEl.appendXML(
                "<dc:lastModifiedBy></dc:lastModifiedBy>"
            )
            lastAuthorEl = corePropertiesEl.lastElementChild
        }
        lastAuthorEl.innerXML = lastAuthor
        // Keywords
        if (this.metadata.keywords.length) {
            // It is not really clear how keywords should be separated in DOCX files,
            // so we use ", ".
            const keywordsString = escapeText(this.metadata.keywords.join(", "))

            let keywordsEl = this.coreXML.query("cp:keywords")
            if (!keywordsEl) {
                corePropertiesEl.appendXML("<cp:keywords></cp:keywords>")
                keywordsEl = corePropertiesEl.lastElementChild
            }
            keywordsEl.innerXML = keywordsString
        }

        // time
        const date = new Date()
        const dateString = date.toISOString().split(".")[0] + "Z"
        const createdEl = this.coreXML.query("dcterms:created")
        createdEl.innerXML = dateString
        let modifiedEl = this.coreXML.query("dcterms:modified")
        if (!modifiedEl) {
            corePropertiesEl.appendXML(
                '<dcterms:modified xsi:type="dcterms:W3CDTF"></dcterms:modified>'
            )
            modifiedEl = corePropertiesEl.lastElementChild
        }
        modifiedEl.innerXML = dateString
    }
}
