import {get} from "../../common"

export class GetImages {
    constructor(images, entries) {
        this.images = images
        this.imageEntries = Object.values(this.images)
        this.entries = entries
        this.counter = 0
    }

    init() {
        if (this.entries.length > 0) {
            if (this.entries[0].hasOwnProperty("url")) {
                return this.getImageUrlEntry()
            } else {
                return this.getImageZipEntry()
            }
        } else {
            return Promise.resolve()
        }
    }

    getImageZipEntry() {
        if (this.counter < this.imageEntries.length) {
            return new Promise(resolve => {
                const f = this.entries.find(
                    entry =>
                        entry.filename === this.imageEntries[this.counter].image
                )
                if (!f) {
                    console.warn(
                        `Image ${this.imageEntries[this.counter].image} not found`,
                        this.imageEntries,
                        this.entries
                    )
                    this.counter++
                    return this.getImageZipEntry().then(() => {
                        resolve()
                    })
                }
                const fc = f.content
                this.imageEntries[this.counter]["file"] = new window.Blob(
                    [fc],
                    {
                        type: this.imageEntries[this.counter].file_type
                    }
                )
                this.counter++
                this.getImageZipEntry().then(() => {
                    resolve()
                })
            })
        } else {
            return Promise.resolve()
        }
    }

    getImageUrlEntry() {
        if (this.counter < this.imageEntries.length) {
            const getUrl = this.entries.find(
                entry =>
                    entry.filename ===
                    `images/${this.imageEntries[this.counter].image.split("/").pop()}`
            ).url
            return get(getUrl)
                .then(response => response.blob())
                .then(blob => {
                    this.imageEntries[this.counter]["file"] = blob
                    this.counter++
                    return this.getImageUrlEntry()
                })
        } else {
            return Promise.resolve()
        }
    }
}
