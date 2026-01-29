import {post, postJson} from "../../common/network"

// class for server calls of BibliographyDB.
export class BibliographyDBServerConnector {
    constructor() {}

    getDB(lastModified, numberOfEntries, localStorageOwnerId) {
        return postJson("/api/bibliography/biblist/", {
            last_modified: lastModified,
            number_of_entries: numberOfEntries,
            user_id: localStorageOwnerId
        }).then(({json}) => {
            return {
                bibCats: json["bib_categories"],
                bibList: json.hasOwnProperty("bib_list")
                    ? json["bib_list"].map(item =>
                          this.serverBibItemToBibDB(item)
                      )
                    : false,
                lastModified: json["last_modified"],
                numberOfEntries: json["number_of_entries"],
                userId: json["user_id"]
            }
        })
    }

    /** Converts a bibliography item as it arrives from the server to a BibDB object.
     * @function serverBibItemToBibDB
     * @param item The bibliography item from the server.
     */
    serverBibItemToBibDB(bibDBEntry) {
        return {id: bibDBEntry["id"], bibDBEntry}
    }

    saveBibEntries(tmpDB, isNew) {
        return postJson("/api/bibliography/save/", {
            is_new: isNew,
            bibs: JSON.stringify(tmpDB)
        }).then(({json}) => json["id_translations"])
    }

    saveCategories(cats) {
        return postJson("/api/bibliography/save_category/", cats).then(
            ({json}) => {
                return json.entries
            }
        )
    }

    deleteCategory(ids) {
        return post("/api/bibliography/delete_category/", {ids})
    }

    deleteBibEntries(ids) {
        return post("/api/bibliography/delete/", {ids})
    }
}
