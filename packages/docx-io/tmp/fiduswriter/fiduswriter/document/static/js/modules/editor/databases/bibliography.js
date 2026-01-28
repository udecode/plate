import deepEqual from "fast-deep-equal"

function randomID() {
    return Math.floor(Math.random() * 0xffffffff)
}

export class ModBibliographyDB {
    constructor(mod) {
        mod.bibDB = this
        this.mod = mod
        this.db = false
        this.unsent = []
        // cats aren't used, but we keep this for consistency
        this.cats = []
    }

    setDB(db) {
        this.db = db
        this.unsent = []
    }

    mustSend() {
        // Set a timeout so that the update can be combines with other updates
        // if they happen more or less simultaneously.
        window.setTimeout(
            () => this.mod.editor.mod.collab.doc.sendToCollaborators(),
            100
        )
    }

    // function saveBibEntries is the same as in user's individual BibliographyDB.
    // Function added to make document's and user's bibDBs be connectable to the
    // same interface functions.
    saveBibEntries(tmpDB, isNew) {
        const idTranslations = []
        Object.keys(tmpDB).forEach(bibKey => {
            const reference = tmpDB[bibKey],
                bibId = Number.parseInt(bibKey)
            delete reference.cats
            const oldRef = this.findReference(reference)
            if (oldRef) {
                idTranslations.push([bibId, oldRef])
            } else if (isNew) {
                const id = this.addReference(reference, bibId)
                idTranslations.push([bibId, id])
            } else {
                this.updateReference(bibId, reference)
                idTranslations.push([bibId, bibId])
            }
            // We don't use cats in the document internal bibDB, so just
            // to make sure, we remove it.
        })
        return Promise.resolve(idTranslations)
    }

    // Function added here for compatibility with user's bibDB. See comment at
    // saveBibEntries function.
    updateLocalBibEntries(tmpDB, idTranslations) {
        idTranslations.forEach(bibTrans => {
            this.updateLocalReference([bibTrans[1]], tmpDB[bibTrans[0]])
        })
        return idTranslations
    }

    // Function added here for compatibility with user's bibDB. See comment at
    // saveBibEntries function.
    deleteBibEntries(ids) {
        ids.forEach(id => this.deleteReference(id))
        return Promise.resolve(ids)
    }

    // This function only makes real sense in the user's bibDB. It is kept here
    // for compatibility reasons.
    getDB() {
        return new Promise(resolve => {
            window.setTimeout(() => resolve({bibPks: [], bibCats: []}), 100)
        })
    }

    addReference(reference, id) {
        while (!id || this.db[id]) {
            id = randomID()
        }
        this.updateReference(id, reference)
        return id
    }

    // Add or update a reference to the bibliography database both remotely and locally.
    updateReference(id, reference) {
        this.updateLocalReference(id, reference)
        this.unsent.push({
            type: "update",
            id
        })
        this.mustSend()
    }

    // Add or update a reference only locally.
    updateLocalReference(id, reference) {
        const preExisting = this.db[id] ? true : false
        this.db[id] = reference
        if (preExisting) {
            this.mod.editor.mod.citations.resetCitations()
        } else {
            this.mod.editor.mod.citations.layoutCitations()
        }
    }

    deleteReference(id) {
        this.deleteLocalReference(id)
        this.unsent.push({
            type: "delete",
            id
        })
        this.mustSend()
    }

    deleteLocalReference(id) {
        delete this.db[id]
    }

    hasUnsentEvents() {
        return this.unsent.length
    }

    unsentEvents() {
        return this.unsent.map(event => {
            if (event.type === "delete") {
                return event
            } else if (event.type === "update") {
                // Check bib entry still exists. Otherwise ignore.
                const reference = this.db[event.id]
                if (reference) {
                    return {
                        type: "update",
                        id: event.id,
                        reference
                    }
                } else {
                    return {
                        type: "ignore"
                    }
                }
            }
        })
    }

    eventsSent(n) {
        this.unsent = this.unsent.slice(n.length)
    }

    receive(events) {
        events.forEach(event => {
            if (event.type == "delete") {
                this.deleteLocalReference(event.id)
            } else if (event.type == "update") {
                this.updateLocalReference(event.id, event.reference)
            }
        })
    }

    findReference(ref) {
        return Object.keys(this.db).find(id => {
            const bib = this.db[id]
            return (
                bib.bib_type === ref.bib_type &&
                deepEqual(bib.fields, ref.fields)
            )
        })
    }

    hasReference(ref) {
        if (this.findReference(ref) !== undefined) {
            return true
        } else {
            return false
        }
    }
}
