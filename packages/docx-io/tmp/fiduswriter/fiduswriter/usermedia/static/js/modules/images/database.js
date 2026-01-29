import {activateWait, addAlert, deactivateWait, postJson} from "../common"

/* A class that holds information about images uploaded by the user. */

export class ImageDB {
    constructor() {
        this.db = {}
        this.cats = []
    }

    getDB() {
        this.db = {}
        this.cats = []

        activateWait()

        return postJson("/api/usermedia/images/").then(({json}) => {
            this.cats = json.imageCategories
            json.images.forEach(image => {
                this.db[image.id] = image
            })
            deactivateWait()
            return
        })
    }

    saveImage(imageData) {
        activateWait()
        const postData = Object.assign({}, imageData, {
            cats: JSON.stringify(imageData.cats)
        })

        return postJson("/api/usermedia/save/", postData)
            .then(({json}) => {
                deactivateWait()
                if (Object.keys(json.errormsg).length) {
                    return Promise.reject(new Error(json.errormsg.error))
                } else {
                    this.db[json.values.id] = json.values
                    return json.values.id
                }
            })
            .catch(error => {
                if (error.status === 413) {
                    addAlert(
                        "error",
                        `${gettext("Image is larger than the maximum permitted size")}${settings_MEDIA_MAX_SIZE ? `: ${Number.parseInt(settings_MEDIA_MAX_SIZE / 1000000)}MB` : "."}`
                    )
                } else if (error.message) {
                    addAlert("error", gettext(error.message))
                } else {
                    addAlert("error", gettext(error.statusText))
                }
                deactivateWait()
                throw error
            })
    }
}
