import {BibLatexImportWorker} from "./workers/importer/biblatex.js"

addEventListener("message", message => {
    const importer = new BibLatexImportWorker(
        message.data.fileContents,
        response => postMessage(response),
        message.data.csrfToken,
        message.data.domain
    )
    importer.init()
})
