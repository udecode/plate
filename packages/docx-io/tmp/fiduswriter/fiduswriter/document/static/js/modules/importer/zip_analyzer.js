export class ZipAnalyzer {
    constructor(zip, formats = []) {
        this.zip = zip
        this.formats = formats

        this.analysis = null
    }

    analyze() {
        if (this.analysis) {
            return this.analysis
        }

        let convertibleFile = null
        const imageFiles = []
        let bibFile = null

        // Analyze all files in the ZIP
        this.zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                const fileName = relativePath.split("/").pop()
                const extension = fileName.split(".").pop().toLowerCase()

                if (extension === "bib") {
                    bibFile = zipEntry
                } else if (
                    [
                        "avif",
                        "avifs",
                        "png",
                        "jpg",
                        "jpeg",
                        "gif",
                        "svg",
                        "webp"
                    ].includes(extension)
                ) {
                    imageFiles.push({path: relativePath, entry: zipEntry})
                } else if (this.formats.includes(extension)) {
                    // Store the first convertible file found
                    if (!convertibleFile) {
                        convertibleFile = {
                            path: relativePath,
                            entry: zipEntry,
                            fileName,
                            format: extension
                        }
                    }
                }
            }
        })

        this.analysis = {
            hasConvertible: Boolean(convertibleFile),
            format: convertibleFile ? convertibleFile.format : null,
            convertibleFile,
            imageFiles,
            bibFile
        }

        return this.analysis
    }

    async getContents() {
        if (!this.analysis) {
            await this.analyze()
        }

        const contents = {
            images: {},
            bibliography: null,
            mainContent: null
        }

        // Load main content file
        if (this.analysis.hasConvertible) {
            const mainBlob =
                await this.analysis.convertibleFile.entry.async("blob")
            contents.mainContent = new File(
                [mainBlob],
                this.analysis.convertibleFile.fileName
            )
        }

        // Load images
        const imagePromises = this.analysis.imageFiles.map(
            async ({path, entry}) => {
                const blob = await entry.async("blob")
                contents.images[path] = blob
                return {filename: path, blob}
            }
        )
        await Promise.all(imagePromises)

        // Load bibliography if present
        if (this.analysis.bibFile) {
            contents.bibliography = await this.analysis.bibFile.async("text")
        }

        return contents
    }
}
