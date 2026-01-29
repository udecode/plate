import download from "downloadjs"

import {shortFileTitle} from "../../common"
import {createSlug} from "../tools/file"
import {ShrinkFidus} from "./shrink"
import {ZipFidus} from "./zip"

export class ExportFidusFile {
    constructor(doc, bibDB, imageDB, includeTemplate = true) {
        this.doc = doc
        this.bibDB = bibDB
        this.imageDB = imageDB
        this.includeTemplate = includeTemplate
        return this.init()
    }

    init() {
        const shrinker = new ShrinkFidus(this.doc, this.imageDB, this.bibDB)
        return shrinker
            .init()
            .then(({doc, shrunkImageDB, shrunkBibDB, httpIncludes}) => {
                const zipper = new ZipFidus(
                    this.doc.id,
                    doc,
                    shrunkImageDB,
                    shrunkBibDB,
                    httpIncludes,
                    this.includeTemplate
                )
                return zipper.init()
            })
            .then(blob =>
                download(
                    blob,
                    createSlug(shortFileTitle(this.doc.title, this.doc.path)) +
                        ".fidus",
                    "application/fidus+zip"
                )
            )
    }
}
