import {ZipAnalyzer} from "./zip_analyzer"

export class ImporterRegistry {
    constructor() {
        this.importers = new Map()
    }

    register(fileTypes, importer) {
        fileTypes.forEach(([description, types]) => {
            types.forEach(extension =>
                this.importers.set(extension, {importer, description})
            )
        })
    }

    getZipImporter(zip) {
        const analyzer = new ZipAnalyzer(zip, this.getAllFormats())
        const analysis = analyzer.analyze()

        if (analysis.hasConvertible) {
            return {
                importer: this.getImporter(analysis.format)["importer"],
                getContents: () => analyzer.getContents()
            }
        }

        return null
    }

    getImporter(format) {
        return this.importers.get(format)
    }

    getAllFormats() {
        return Array.from(this.importers.keys())
    }

    getAllDescriptions() {
        return Array.from(this.importers).reduce(
            (acc, [extension, {description}]) => {
                ;(acc[description] = acc[description] || []).push(extension)
                return acc
            },
            {}
        )
    }
}

export const importerRegistry = new ImporterRegistry()

import {DocxImporter} from "./docx"
import {OdtImporter} from "./odt"
// Register built-in importers
import {PandocImporter} from "./pandoc"

importerRegistry.register([["Pandoc JSON", ["json"]]], PandocImporter)

importerRegistry.register([["ODT", ["odt"]]], OdtImporter)

importerRegistry.register([["DOCX", ["docx"]]], DocxImporter)

export function registerImporter(fileTypes, importer) {
    importerRegistry.register(fileTypes, importer)
}
