import {addAlert, makeWorker} from "../../common"

const ERROR_MSG = {
    no_entries: gettext(
        "No bibliography entries could be found in import file."
    ),
    entry_error: gettext("An error occured while reading a bibtex entry"),
    unknown_field: gettext(
        "Field cannot not be saved. Fidus Writer does not support the field."
    ),
    unknown_type: gettext(
        'Entry has been saved as "misc". Fidus Writer does not support the entry type.'
    ),
    unknown_date: gettext("Field does not contain a valid EDTF string."),
    server_save: gettext("The bibliography could not be updated")
}

export class BibLatexImporter {
    constructor(
        fileContents,
        bibDB,
        addToListCall,
        callback,
        showAlerts = true
    ) {
        this.fileContents = fileContents
        this.bibDB = bibDB
        this.addToListCall = addToListCall
        this.callback = callback
        this.showAlerts = showAlerts
    }

    init() {
        const importWorker = makeWorker(
            staticUrl("js/biblatex_import_worker.js")
        )
        importWorker.onmessage = message => this.onMessage(message.data)
        importWorker.postMessage({fileContents: this.fileContents})
    }

    onMessage(message) {
        let errorMsg, data
        switch (message.type) {
            case "error":
            case "warning":
                errorMsg = ERROR_MSG[message.errorCode]
                if (!errorMsg) {
                    errorMsg = gettext(
                        "There was an issue with the bibtex import"
                    )
                }
                if (message.errorType) {
                    errorMsg += `, error_type: ${message.errorType}`
                }
                if (message.key) {
                    errorMsg += `, key: ${message.key}`
                }
                if (message.type_name) {
                    errorMsg += `, entry: ${message.type_name}`
                }
                if (message.field_name) {
                    errorMsg += `, field_name: ${message.field_name}`
                }
                if (message.entry) {
                    errorMsg += `, entry: ${message.entry}`
                }
                if (this.showAlerts) {
                    addAlert(message.type, errorMsg)
                }
                break
            case "data":
                data = message.data
                this.bibDB.saveBibEntries(data, true).then(idTranslations => {
                    const newIds = idTranslations.map(idTrans => idTrans[1])
                    this.addToListCall(newIds)
                })
                break
            default:
                break
        }
        if (message.done && this.callback) {
            this.callback()
        }
    }
}
