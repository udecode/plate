import {Dialog, FileSelector, addAlert} from "../../common"
import {NewFolderDialog} from "./new_folder_dialog"
import {moveTemplate} from "./templates"
import {moveFile, shortFileTitle} from "./tools"
/**
 * Functions for the document move dialog.
 */

export class FileDialog {
    constructor({
        title = "", // Dialog title
        movingFiles = [], // Array of all files that are to be moved.
        allFiles = [], // Array of all existing files.
        moveUrl = "", // URL to use for moving files
        successMessage = "", // Message for success
        errorMessage = "", // Message for failure
        succcessCallback = (_file, _path) => {}, // Callback on success
        fileIcon = "far fa-file-alt"
    }) {
        this.title = title
        this.movingFiles = movingFiles
        this.allFiles = allFiles
        this.moveUrl = moveUrl
        this.successMessage = successMessage
        this.errorMessage = errorMessage
        this.succcessCallback = succcessCallback
        this.fileIcon = fileIcon

        this.path = this.getPath()
        this.fileSelector = false
    }

    getPath() {
        if (this.movingFiles.length === 1) {
            let path = this.movingFiles[0].path
            if (path.endsWith("/")) {
                path +=
                    this.movingFiles[0].title.replace(/\//g, "") ||
                    gettext("Untitled")
            }
            return path
        }
        // We are moving several files. We assume they are all in the same directory
        // so we only need to take the file of the first file.
        return this.movingFiles[0].path.split("/").slice(0, -1).join("/") + "/"
    }

    updatePathDir(path) {
        const fileName = this.dialog.dialogEl
            .querySelector("#path")
            .value.split("/")
            .pop()
        this.dialog.dialogEl.querySelector("#path").value = path + fileName
    }

    init() {
        this.dialog = new Dialog({
            title: this.title,
            id: "move-dialog",
            width: 820,
            height: 440,
            body: moveTemplate({
                path: this.path
            }),
            buttons: [
                {
                    text: gettext("New folder"),
                    classes: "fw-dark",
                    click: () => {
                        const dialog = new NewFolderDialog(folderName => {
                            if (!this.fileSelector) {
                                return
                            }
                            this.fileSelector.addFolder(folderName)
                        })
                        dialog.open()
                    }
                },
                {type: "cancel"},
                {
                    text: gettext("Submit"),
                    classes: "fw-dark",
                    click: () => {
                        //apply the current state to server
                        let path =
                            this.dialog.dialogEl.querySelector("#path").value
                        this.dialog.close()

                        if (path === this.path) {
                            // No change
                            return
                        }
                        if (this.movingFiles.length > 1) {
                            if (!path.endsWith("/")) {
                                path += "/"
                            }
                            this.movingFiles.forEach(doc => {
                                this.moveFile(
                                    doc,
                                    doc.path.endsWith("/")
                                        ? path
                                        : path + doc.path.split("/").pop()
                                )
                            })
                        } else {
                            this.moveFile(this.movingFiles[0], path)
                        }
                    }
                }
            ]
        })
        this.dialog.open()

        this.fileSelector = new FileSelector({
            dom: this.dialog.dialogEl.querySelector(".file-selector"),
            files: this.allFiles,
            showFiles: false,
            selectDir: path => this.updatePathDir(path),
            fileIcon: this.fileIcon
        })
        this.fileSelector.init()
    }

    moveFile(file, requestedPath) {
        return moveFile(file.id, file.title, requestedPath, this.moveUrl)
            .then(path => {
                addAlert(
                    "success",
                    `${this.successMessage}: '${shortFileTitle(file.title, path)}'`
                )
                this.succcessCallback(file, path)
            })
            .catch(() => {
                addAlert(
                    "error",
                    `${this.errorMessage}: '${shortFileTitle(file.title, file.path)}'`
                )
            })
    }
}
