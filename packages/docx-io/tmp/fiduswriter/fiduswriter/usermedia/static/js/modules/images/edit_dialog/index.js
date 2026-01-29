import {ContentMenu, Dialog, addAlert, setCheckableLabel} from "../../common"
import {imageEditModel} from "./model"
import {imageEditTemplate} from "./templates"
export class ImageEditDialog {
    constructor(imageDB, imageId = false, page) {
        this.imageDB = imageDB
        this.page = page
        this.imageId = imageId
        this.dialog = false
        this.copyright = this.imageId
            ? this.imageDB.db[this.imageId].copyright
            : {
                  holder: false,
                  year: false,
                  freeToRead: true,
                  licenses: []
              }
        this.menu = this.page.menu?.imageEditModel || imageEditModel()
    }

    //open a dialog for uploading an image
    init() {
        if (this.page.app.isOffline()) {
            this.showOffline()
            return Promise.resolve()
        }
        const returnPromise = new Promise(resolve => {
            this.dialog = new Dialog({
                title: this.imageId
                    ? gettext("Update Image Information")
                    : gettext("Upload Image"),
                id: "editimage",
                classes: "fw-media-uploader",
                body: imageEditTemplate({
                    image: this.imageId ? this.imageDB.db[this.imageId] : false,
                    cats: this.imageDB.cats
                }),
                buttons: [
                    {
                        text: this.imageId
                            ? gettext("Update")
                            : gettext("Upload"),
                        click: () => resolve(this.saveImage()),
                        classes: "fw-dark"
                    },
                    {
                        type: "cancel",
                        classes: "fw-orange",
                        click: () => this.dialog.close()
                    }
                ]
            })
            this.dialog.open()
        })

        document
            .querySelectorAll(".fw-checkable-label")
            .forEach(el =>
                el.addEventListener("click", () => setCheckableLabel(el))
            )

        if (!this.imageId) {
            this.bindMediaUploadEvents()
        }

        document
            .querySelector(".figure-edit-menu")
            .addEventListener("click", event => {
                event.preventDefault()
                event.stopImmediatePropagation()

                const contentMenu = new ContentMenu({
                    menu: this.menu,
                    width: 220,
                    page: this,
                    menuPos: {X: event.pageX - 50, Y: event.pageY + 50}
                })
                contentMenu.open()
            })

        return returnPromise
    }

    //add image upload events
    bindMediaUploadEvents() {
        const selectButton = document.querySelector(
                "#editimage .fw-media-select-button"
            ),
            mediaInputSelector = document.querySelector(
                "#editimage .fw-media-file-input"
            )
        this.mediaPreviewerDiv = document.querySelector(
            "#editimage .figure-preview > div"
        )
        this.rotation = 0
        this.cropped = false

        selectButton.addEventListener("click", () => {
            mediaInputSelector.click()
        })

        mediaInputSelector.addEventListener("change", () => {
            this.mediaInput = mediaInputSelector.files[0]
            const fr = new window.FileReader()
            fr.onload = () => {
                this.mediaPreviewerDiv.innerHTML = `<div class="img" style="background-image: url(${fr.result});" />`
                this.mediaPreviewer =
                    this.mediaPreviewerDiv.querySelector(".img")
                this.mediaPreviewerDiv.classList.remove("crop-mode")
                this.dialog.centerDialog()
            }
            fr.readAsDataURL(this.mediaInput)
        })
    }

    displayCreateImageError(errors) {
        Object.keys(errors).forEach(eKey => {
            const eMsg = `<div class="warning">${errors[eKey]}</div>`
            if ("error" == eKey) {
                document
                    .getElementById("editimage")
                    .insertAdjacentHTML("afterbegin", eMsg)
            } else {
                document
                    .getElementById(`id_${eKey}`)
                    .insertAdjacentHTML("afterend", eMsg)
            }
        })
    }

    saveImage() {
        const imageData = {
            title: document.querySelector("#editimage .fw-media-title").value,
            copyright: this.copyright,
            cats: Array.from(
                document.querySelectorAll("#editimage .entry-cat:checked")
            ).map(el => Number.parseInt(el.value))
        }
        if (this.imageId) {
            imageData.id = this.imageId
        } else if (!this.rotation && !this.cropped) {
            imageData.image = this.mediaInput
        } else {
            const mediaPreviewerStyle =
                this.mediaPreviewer.currentStyle ||
                window.getComputedStyle(this.mediaPreviewer, false)
            const base64data = mediaPreviewerStyle.backgroundImage
                .slice(4, -1)
                .replace(/"/g, "")
            const bstr = atob(base64data.split(",")[1])
            let n = bstr.length
            const u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            imageData.image = new File([u8arr], this.mediaInput.name, {
                type: this.mediaInput.type
            })
        }
        // Remove old warning messages
        document
            .querySelectorAll("#editimage .warning")
            .forEach(el => el.parentElement.removeChild(el))
        return new Promise(resolve => {
            this.imageDB.saveImage(imageData).then(
                imageId => {
                    this.dialog.close()
                    addAlert("success", gettext("The image has been updated."))
                    this.imageId = imageId
                    resolve(imageId)
                },
                errors => {
                    if (this.page.app.isOffline()) {
                        this.showOffline()
                        return
                    }
                    this.displayCreateImageError(errors)
                    addAlert(
                        "error",
                        gettext(
                            "Some errors were found. Please examine the form."
                        )
                    )
                }
            )
        })
    }

    showOffline() {
        addAlert(
            "info",
            gettext(
                "You are currently offline. Please try again after going online."
            )
        )
    }
}
