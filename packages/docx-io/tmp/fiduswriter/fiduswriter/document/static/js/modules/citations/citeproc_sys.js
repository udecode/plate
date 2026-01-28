/* Connects Fidus Writer citation system with citeproc */
import {CSLExporter} from "biblatex-csl-converter"

export class citeprocSys {
    constructor(bibDB) {
        this.bibDB = bibDB
        this.abbreviations = {
            default: {}
        }
        this.abbrevsname = "default"
        // We cache values retrieved once.
        this.items = {}
        this.missingItems = []
    }

    retrieveItem(id) {
        if (!this.items[id]) {
            if (this.bibDB.db[id]) {
                const cslGetter = new CSLExporter(this.bibDB.db, [id])
                const cslOutput = cslGetter.parse()
                Object.assign(this.items, cslOutput)
            } else {
                this.missingItems.push(id)
                this.items[id] = {author: [{literal: ""}], type: "article", id}
            }
        }
        return this.items[id]
    }

    getAbbreviation(_dummy, obj, _jurisdiction, vartype, key) {
        try {
            if (this.abbreviations[this.abbrevsname][vartype][key]) {
                obj["default"][vartype][key] =
                    this.abbreviations[this.abbrevsname][vartype][key]
            } else {
                obj["default"][vartype][key] = ""
            }
        } catch (_error) {
            // There is breakage here that needs investigating.
        }
    }
}
