import {FidusWriterPasteHandler} from "./fidus_writer"
import {GeneralPasteHandler} from "./general"
import {GoogleDocsPasteHandler} from "./google_docs"
import {LibreOfficeWriterPasteHandler} from "./libreoffice_writer"
import {MicrosoftWordPasteHandler} from "./microsoft_word"

import {resetPasteRange} from "../../state_plugins/clipboard"

// Some pasted HTML will need slight conversions to work correctly.
// We try to sniff whether paste comes from MsWord, LibreOffice or Google Docs
// and use specialized handlers for these and a general handler everything else.

export class HTMLPaste {
    constructor(editor, inHTML, pmType, view) {
        this.editor = editor
        this.inHTML = inHTML
        this.pmType = pmType
        this.view = view
    }

    getOutput() {
        this.parseHTML()
        this.selectHandler()
        this.handlerInstance = new this.handler(
            this.editor,
            this.htmlDoc,
            this.pmType
        )
        this.outHTML = this.handlerInstance.getOutput()
        setTimeout(() => {
            this.resetPasteRange()
        }, 0)
        return this.outHTML
    }

    parseHTML() {
        const parser = new window.DOMParser()
        this.htmlDoc = parser
            .parseFromString(this.inHTML, "text/html")
            .getElementsByTagName("html")[0]
    }

    // Find out what the source of the paste is and choose a corresponding
    // handler.
    selectHandler() {
        // For LibreOffice
        const head = this.htmlDoc.getElementsByTagName("head")[0]
        const generatorMetaTag = head.querySelector("meta[name=generator]")
        // For Google Docs
        const body = this.htmlDoc.getElementsByTagName("body")[0]
        const firstB = body.querySelector("b")
        // For Fidus Writer
        const pmSlice = this.htmlDoc.querySelector("[data-pm-slice]")
        if (
            this.htmlDoc.hasAttribute("xmlns:w") &&
            this.htmlDoc.getAttribute("xmlns:w") ===
                "urn:schemas-microsoft-com:office:word"
        ) {
            this.handler = MicrosoftWordPasteHandler
        } else if (generatorMetaTag?.content?.startsWith("LibreOffice")) {
            this.handler = LibreOfficeWriterPasteHandler
        } else if (firstB?.id.startsWith("docs-internal-guid")) {
            this.handler = GoogleDocsPasteHandler
        } else if (pmSlice) {
            this.handler = FidusWriterPasteHandler
        } else {
            this.handler = GeneralPasteHandler
        }
    }

    resetPasteRange() {
        const tr = this.view.state.tr
        resetPasteRange(tr)
        this.view.dispatch(tr)
    }
}
