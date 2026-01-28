import {escapeText, findTarget} from "../basic"
import {ensureCSS} from "../network"

export class FileSelector {
    constructor({
        dom,
        files,
        showFiles = true,
        selectFolders = true,
        multiSelect = false,
        selectDir = _path => {},
        selectFile = _path => {},
        fileIcon = "far fa-file-alt"
    }) {
        this.dom = dom
        this.files = files
        this.showFiles = showFiles // Whether to show existing files or only folders
        this.selectFolders = selectFolders // Whether to allow the selection of folders
        this.multiSelect = multiSelect // Whether to allow the selectioj of multiple entries
        this.selectDir = selectDir
        this.selectFile = selectFile
        this.fileIcon = fileIcon // File icon to use
        this.root = {
            name: "/",
            type: "folder",
            open: true,
            selected: false,
            path: "/",
            children: []
        }
        this.selected = []
        if (this.selectFolders && !this.multiSelect) {
            this.root.selected = true
            this.selected.push(this.root)
        }
    }

    init() {
        this.readDirStructure()
        this.sortDirStructure()
        ensureCSS(staticUrl("css/file_selector.css"))
        this.dom.classList.add("fw-file-selector")
        this.render()
        this.bind()
    }

    readDirStructure() {
        // Read directory structure from existing file paths
        this.files.forEach(file => {
            let treeWalker = this.root.children
            let path = file.path
            if (!path.length || path.endsWith("/")) {
                path += file.title || gettext("Untitled")
            }
            const pathParts = path.split("/")
            pathParts.forEach((pathPart, pathIndex) => {
                if (!pathPart.length) {
                    return
                }
                if (pathIndex === pathParts.length - 1) {
                    if (this.showFiles) {
                        treeWalker.push({
                            name: pathPart,
                            type: "file",
                            path: pathParts.slice(0, pathIndex + 1).join("/"),
                            file
                        })
                    }
                    return
                }
                let folder = treeWalker.find(
                    item => item.name === pathPart && item.type === "folder"
                )
                if (!folder) {
                    folder = {
                        name: pathPart,
                        type: "folder",
                        open: false,
                        selected: false,
                        path: pathParts.slice(0, pathIndex + 1).join("/") + "/",
                        children: []
                    }
                    treeWalker.push(folder)
                }
                treeWalker = folder.children
            })
        })
    }

    sortDirStructure(entries = this.root.children) {
        entries.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1
            }
            return a.name > b.name ? 1 : -1
        })
        entries.forEach(entry => {
            if (entry.type === "folder" && entry.children.length) {
                this.sortDirStructure(entry.children)
            }
        })
    }

    addFolder(rawName) {
        const name = rawName.replace(/\//g, "")
        // Add a new folder as a subfolder to the currently selected folder
        if (
            !this.selected.length ||
            this.selected[0].type !== "folder" ||
            this.selected[0].children.find(
                child => child.type === "folder" && child.name === name
            )
        ) {
            // A file is selected. Give up.
            return
        }
        const newFolder = {
            name,
            type: "folder",
            open: true,
            selected: true,
            path: this.selected[0].path + name + "/",
            children: []
        }
        this.selected[0].children.push(newFolder)
        this.sortDirStructure(this.selected[0].children)
        this.selected[0].open = true
        if (!this.multiSelect) {
            this.selected[0].selected = false
            this.selected = []
        }
        this.selected.push(newFolder)
        this.selectDir(newFolder.path)
        this.render()
    }

    deselectAll() {
        this.selected.forEach(entry => (entry.selected = false))
        this.selected = []
        this.render()
    }

    render() {
        this.dom.innerHTML = this.renderFolder(this.root)
    }

    renderFolder(folder, indentLevel = 0) {
        let returnString = ""
        returnString += `<div class="folder${folder.open ? "" : " closed"}">`
        returnString += `<p style="margin-left:${indentLevel * 10}px;">${
            folder.children.length
                ? `<i class="far fa-${folder.open ? "minus" : "plus"}-square"></i>&nbsp;`
                : ""
        }<span class="folder-name${folder.selected ? " selected" : ""}"><i class="fas fa-folder"></i>&nbsp;${escapeText(folder.name)}</span></p>`
        if (folder.open) {
            returnString += '<div class="folder-content">'
            returnString += folder.children
                .map(child => {
                    if (child.type === "folder") {
                        return this.renderFolder(child, indentLevel + 1)
                    } else {
                        return `<p class="file" style="margin-left:${(indentLevel + 1) * 10 + 20}px;"><span class="file-name${child.selected ? " selected" : ""}"><i class="${this.fileIcon}"></i>&nbsp;${escapeText(child.name)}</span></p>`
                    }
                })
                .join("")
            returnString += "</div>"
        }
        returnString += "</div>"
        return returnString
    }

    findEntry(dom) {
        const searchPath = []
        let seekItem = dom
        while (seekItem.closest("div.folder, p.file")) {
            let itemNumber = 0
            seekItem = seekItem.closest("div.folder, p.file")
            while (seekItem.previousElementSibling) {
                itemNumber++
                seekItem = seekItem.previousElementSibling
            }
            searchPath.push(itemNumber)
            seekItem = seekItem.parentElement
        }
        let entry = this.root
        searchPath.pop()
        while (searchPath.length) {
            entry = entry.children[searchPath.pop()]
        }
        return entry
    }

    bind() {
        this.dom.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, ".fa-plus-square", el): {
                    event.preventDefault()
                    const entry = this.findEntry(el.target)
                    entry.open = true
                    this.render()
                    break
                }
                case findTarget(event, ".fa-minus-square", el): {
                    event.preventDefault()
                    const entry = this.findEntry(el.target)
                    entry.open = false
                    this.render()
                    break
                }
                case findTarget(event, ".folder-name", el): {
                    event.preventDefault()
                    if (!this.selectFolders) {
                        // Folders cannot be selected
                        return
                    }
                    const entry = this.findEntry(el.target)
                    if (this.selected.includes(entry)) {
                        entry.selected = false
                        this.selected = this.selected.filter(e => e !== entry)
                        this.render()
                    } else {
                        entry.selected = true
                        if (!this.multiSelect && this.selected.length) {
                            this.selected[0].selected = false
                        }
                        this.selected.push(entry)
                        this.render()
                        this.selectDir(entry.path)
                    }
                    break
                }
                case findTarget(event, ".file-name", el): {
                    event.preventDefault()
                    const entry = this.findEntry(el.target)
                    if (this.selected.includes(entry)) {
                        entry.selected = false
                        this.selected = this.selected.filter(e => e !== entry)
                        this.render()
                    } else {
                        entry.selected = true
                        if (!this.multiSelect && this.selected.length) {
                            this.selected[0].selected = false
                        }
                        this.selected.push(entry)
                        this.render()
                        this.selectFile(entry.path)
                    }
                    break
                }
            }
        })
    }
}
