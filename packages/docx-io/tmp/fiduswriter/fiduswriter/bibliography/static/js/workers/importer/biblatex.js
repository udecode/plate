import {BibLatexParser} from "biblatex-csl-converter"

export class BibLatexImportWorker {
    constructor(fileContents, sendMessage) {
        this.fileContents = fileContents
        this.sendMessage = sendMessage
    }

    /** Second step of the BibTeX file import. Takes a BibTeX file object,
     * processes client side and cuts into chunks to be uploaded to the server.
     */
    init() {
        const bibData = new BibLatexParser(this.fileContents)
        const bibDataOutput = bibData.parse()
        this.tmpDB = bibDataOutput.entries
        this.bibKeys = Object.keys(this.tmpDB)
        if (!this.bibKeys.length) {
            this.sendMessage({
                type: "error",
                errorCode: "no_Entries",
                done: true
            })
            return
        } else {
            this.bibKeys.forEach(bibKey => {
                const bibEntry = this.tmpDB[bibKey]
                // We add an empty category list for all newly imported bib entries.
                bibEntry.cats = []
                // If the entry has no title, add an empty title
                if (!bibEntry.fields.title) {
                    bibEntry.fields.title = []
                }
                // If the entry has no date, add an uncertain date
                if (!bibEntry.fields.date) {
                    bibEntry.fields.date = "uuuu"
                }
                // If the entry has no editor or author, add empty author
                if (!bibEntry.fields.author && !bibEntry.fields.editor) {
                    bibEntry.fields.author = [{literal: []}]
                }
            })
            bibData.errors.forEach(error => {
                error.errorType = error.type
                error.errorCode = "entry_error"
                error.type = "error"
                this.sendMessage(error)
            })
            bibData.warnings.forEach(warning => {
                warning.errorCode = warning.type
                warning.type = "warning"
                this.sendMessage(warning)
            })
            this.totalChunks = Math.ceil(this.bibKeys.length / 50)
            this.currentChunkNumber = 0
            this.processChunk()
        }
    }

    processChunk() {
        if (this.currentChunkNumber < this.totalChunks) {
            const fromNumber = this.currentChunkNumber * 50
            const toNumber = fromNumber + 50
            const currentChunk = {}
            this.bibKeys.slice(fromNumber, toNumber).forEach(bibKey => {
                currentChunk[bibKey] = this.tmpDB[bibKey]
            })
            this.sendMessage({type: "data", data: currentChunk})
            this.currentChunkNumber++
            this.processChunk()
        } else {
            this.sendMessage({type: "ok", done: true})
        }
    }
}
