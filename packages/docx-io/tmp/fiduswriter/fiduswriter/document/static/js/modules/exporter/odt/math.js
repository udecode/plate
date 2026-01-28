export class ODTExporterMath {
    constructor(xml) {
        this.xml = xml
        this.objectCounter = 1
        this.manifestXml = false
        this.domParser = new DOMParser()
    }

    init() {
        return this.xml
            .getXml("META-INF/manifest.xml")
            .then(manifestXml => {
                this.manifestXml = manifestXml
                this.checkObjectCounter()
                return Promise.resolve()
            })
            .then(() => import("mathlive"))
            .then(MathLive => (this.mathLive = MathLive))
    }

    checkObjectCounter() {
        const manifestEl = this.manifestXml.query("manifest:manifest")
        const fileEntries = manifestEl.queryAll("manifest:file-entry")

        fileEntries.forEach(fileEntry => {
            const fullPath = fileEntry.getAttribute("manifest:full-path")
            const dir = fullPath.split("/")[0]
            const dirParts = dir.split(" ")
            if (dirParts.length === 2 && dirParts[0] === "Object") {
                const objectNumber = Number.parseInt(dirParts[1])
                if (objectNumber >= this.objectCounter) {
                    this.objectCounter = objectNumber + 1
                }
            }
        })
    }

    latexToMathML(latex) {
        return this.mathLive.convertLatexToMathMl(latex)
    }

    addMath(latex) {
        const objectNumber = this.objectCounter++
        this.xml.addExtraFile(
            `Object ${objectNumber}/content.xml`,
            `<math xmlns="http://www.w3.org/1998/Math/MathML">${this.latexToMathML(
                latex
            )}</math>`
        )
        const manifestEl = this.manifestXml.query("manifest:manifest")
        const stringOne = `<manifest:file-entry manifest:full-path="Object ${objectNumber}/content.xml" manifest:media-type="text/xml"/>`
        manifestEl.appendXML(stringOne)
        const stringTwo = `<manifest:file-entry manifest:full-path="Object ${objectNumber}/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.formula"/>`
        manifestEl.appendXML(stringTwo)
        return objectNumber
    }
}
