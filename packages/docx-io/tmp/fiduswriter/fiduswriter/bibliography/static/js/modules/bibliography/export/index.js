import download from "downloadjs"
import {ZipFileCreator} from "../../exporter/tools/zip"

export class BibLatexFileExporter {
    constructor(bibDB, pks) {
        this.pks = pks // A list of pk values of the bibliography items to be exported.
        this.bibDB = bibDB // The bibliography database to export from.
    }

    init() {
        import("biblatex-csl-converter").then(({BibLatexExporter}) => {
            const exporter = new BibLatexExporter(this.bibDB.db, this.pks)

            const zipper = new ZipFileCreator([
                {
                    filename: "bibliography.bib",
                    contents: exporter.output
                }
            ])
            zipper
                .init()
                .then(blob =>
                    download(blob, "bibliography.zip", "application/zip")
                )
        })
    }
}
