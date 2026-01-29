import {activateWait, addAlert, deactivateWait} from "../../common"
import {BibliographyDBServerConnector} from "./server_connector"

const FW_LOCALSTORAGE_VERSION = "1.2"

export class BibliographyDB {
    constructor(app) {
        this.app = app
        this.db = {}
        this.cats = []
        this.sc = new BibliographyDBServerConnector()
    }

    /** Get the bibliography from the server and create as this.db.
     * @function getDB
     */

    getDB() {
        const localStorageVersion = window.localStorage.getItem("version")
        let lastModified = Number.parseInt(
                window.localStorage.getItem("last_modified_biblist")
            ),
            numberOfEntries = Number.parseInt(
                window.localStorage.getItem("number_of_entries")
            ),
            localStorageOwnerId = Number.parseInt(
                window.localStorage.getItem("owner_id")
            )

        // A dictionary to look up bib fields by their fw type name.
        // Needed for translation to CSL and Biblatex.
        //Fill BibDB

        if (Number.isNaN(lastModified)) {
            lastModified = -1
        }

        if (Number.isNaN(numberOfEntries)) {
            numberOfEntries = -1
        }

        if (Number.isNaN(localStorageOwnerId)) {
            localStorageOwnerId = -1
        }

        if (localStorageVersion != FW_LOCALSTORAGE_VERSION) {
            lastModified = -1
            numberOfEntries = -1
            localStorageOwnerId = -1
        }
        activateWait()
        return this.sc
            .getDB(lastModified, numberOfEntries, localStorageOwnerId)
            .then(
                ({bibCats, bibList, lastModified, numberOfEntries, userId}) => {
                    bibCats.forEach(bibCat => this.cats.push(bibCat))
                    if (bibList) {
                        try {
                            window.localStorage.setItem(
                                "biblist",
                                JSON.stringify(bibList)
                            )
                            window.localStorage.setItem(
                                "last_modified_biblist",
                                lastModified
                            )
                            window.localStorage.setItem(
                                "number_of_entries",
                                numberOfEntries
                            )
                            window.localStorage.setItem("owner_id", userId)
                            window.localStorage.setItem(
                                "version",
                                FW_LOCALSTORAGE_VERSION
                            )
                        } catch (error) {
                            // The local storage was likely too small
                            throw error
                        }
                    } else {
                        bibList = JSON.parse(
                            window.localStorage.getItem("biblist")
                        )
                    }
                    bibList.forEach(({id, bibDBEntry}) => {
                        this.db[id] = bibDBEntry
                    })
                    deactivateWait()
                    return
                }
            )
            .catch(error => {
                addAlert("error", gettext("Could not obtain bibliography data"))
                deactivateWait()
                throw error
            })
    }

    /** Saves a bibliography entry to the database on the server.
     * @function saveBibEntries
     * @param tmpDB The bibliography DB with temporary IDs to be send to the server.
     */
    saveBibEntries(tmpDB, isNew) {
        return this.sc
            .saveBibEntries(tmpDB, isNew)
            .then(idTranslations =>
                this.updateLocalBibEntries(tmpDB, idTranslations)
            )
            .catch(error => {
                addAlert(
                    "error",
                    gettext("The bibliography could not be updated")
                )
                if (this.app.isOffline()) {
                    addAlert(
                        "info",
                        gettext(
                            "You are currently offline. Please try again when you are back online."
                        )
                    )
                } else {
                    throw error
                }
            })
    }

    updateLocalBibEntries(tmpDB, idTranslations) {
        idTranslations.forEach(bibTrans => {
            this.db[bibTrans[1]] = tmpDB[bibTrans[0]]
        })
        addAlert("success", gettext("The bibliography has been updated."))
        return idTranslations
    }

    /** Update or create new category
     * @function saveCategories
     * @param cats The category objects to add.
     */
    saveCategories(cats) {
        activateWait()

        return this.sc
            .saveCategories(cats)
            .then(bibCats => {
                // Replace the old with the new categories, but don't lose the link to the array (so delete each, then add each).
                while (this.cats.length > 0) {
                    this.cats.pop()
                }
                while (bibCats.length > 0) {
                    this.cats.push(bibCats.pop())
                }
                addAlert("success", gettext("The categories have been updated"))
                deactivateWait()
                return this.cats
            })
            .catch(error => {
                addAlert(
                    "error",
                    gettext("The categories could not be updated")
                )
                deactivateWait()
                if (this.app.isOffline()) {
                    addAlert(
                        "info",
                        gettext(
                            "You are currently offline. Please try again when you are back online."
                        )
                    )
                } else {
                    throw error
                }
            })
    }

    /** Delete a categories
     * @function deleteCategory
     * @param ids A list of ids to delete.
     */
    deleteCategory(ids) {
        return this.sc.deleteCategory(ids).then(() => {
            const deletedPks = ids.slice()
            const deletedBibCats = []
            this.cats.forEach(bibCat => {
                if (ids.indexOf(bibCat.id) !== -1) {
                    deletedBibCats.push(bibCat)
                }
            })
            deletedBibCats.forEach(bibCat => {
                const index = this.cats.indexOf(bibCat)
                this.cats.splice(index, 1)
            })
            return deletedPks
        })
    }

    /** Delete a list of bibliography items both locally and on the server.
     * @function deleteBibEntries
     * @param ids A list of bibliography item ids that are to be deleted.
     */
    deleteBibEntries(ids) {
        activateWait()
        ids = ids.map(id => Number.parseInt(id))
        return this.sc
            .deleteBibEntries(ids)
            .then(() => {
                ids.forEach(id => {
                    delete this.db[id]
                })
                addAlert(
                    "success",
                    gettext("The bibliography item(s) have been deleted")
                )
                deactivateWait()
                return ids
            })
            .catch(error => {
                addAlert(
                    "error",
                    "The bibliography item(s) could not be deleted"
                )
                deactivateWait()
                if (this.app.isOffline()) {
                    addAlert(
                        "info",
                        gettext(
                            "You are currently offline. Please try again when you are back online."
                        )
                    )
                } else {
                    throw error
                }
            })
    }
}
