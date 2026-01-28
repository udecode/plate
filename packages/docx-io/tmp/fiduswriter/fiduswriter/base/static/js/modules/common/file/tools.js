import {postJson} from "../network"

export const shortFileTitle = (title, path) => {
    if (!path.length || path.endsWith("/")) {
        return title || gettext("Untitled")
    }
    return path.split("/").pop()
}

export const longFilePath = (title, path, prefix = "") => {
    if (!path.length) {
        path = "/"
    }
    if (path.endsWith("/")) {
        path += title.replace(/\//g, "") || gettext("Untitled")
    }
    if (prefix.length) {
        const pathParts = path.split("/")
        const fileName = pathParts.pop()
        pathParts.push(prefix + fileName)
        path = pathParts.join("/")
    }

    return path
}

export const cleanPath = (title, path) => {
    if (!path.startsWith("/")) {
        path = "/" + path
    }
    path = path.replace(/\/{2,}/g, "/") // replace multiple backslashes

    if (
        path.endsWith(
            `/${title.replace(/\//g, "")}` || `/${gettext("Untitled")}`
        )
    ) {
        path = path.split("/").slice(0, -1).join("/") + "/"
    }
    if (path === "/") {
        path = ""
    }
    return path
}

export const moveFile = (fileId, title, path, moveUrl) => {
    path = cleanPath(title, path)
    return new Promise((resolve, reject) => {
        postJson(moveUrl, {id: fileId, path}).then(({json}) => {
            if (json.done) {
                resolve(path)
            } else {
                reject()
            }
        })
    })
}
