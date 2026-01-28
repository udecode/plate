import {xmlDOM} from "./xml"

import {get} from "../../common"
// Handle a zip file containing XML files. Make sure files are only opened once,
// and provide a mechanism to save the file.

export class XmlZip {
    constructor(url, mimeType) {
        this.url = url
        this.mimeType = mimeType
        this.docs = {}
        this.extraFiles = {}
        this.rawFile = false
    }

    init() {
        return import("jszip")
            .then(({default: JSZip}) => {
                this.zip = new JSZip()
                return this.downloadZip()
            })
            .then(() => this.loadZip())
    }

    downloadZip() {
        return get(this.url)
            .then(response => response.blob())
            .then(blob => (this.rawFile = blob))
    }

    loadZip() {
        return this.zip.loadAsync(this.rawFile)
    }

    // Open file at filePath from zip file and parse it as XML.
    getXml(filePath, defaultContents) {
        if (this.docs[filePath]) {
            // file has been loaded already.
            return Promise.resolve(this.docs[filePath])
        } else if (this.zip.files[filePath]) {
            return this.zip
                .file(filePath)
                .async("string")
                .then(string => {
                    this.docs[filePath] = xmlDOM(string)
                    return Promise.resolve(this.docs[filePath])
                })
        } else if (defaultContents) {
            return Promise.resolve(defaultContents).then(string => {
                this.docs[filePath] = xmlDOM(string)
                return Promise.resolve(this.docs[filePath])
            })
        } else {
            // File couldn't be found and there was no default value.
            return Promise.reject(new Error("File not found"))
        }
    }

    // Add an xml file at filepath without checking for previous version
    addXmlFile(filePath, xmlContents) {
        this.docs[filePath] = xmlContents
    }

    // Add extra file to be saved in zip later.
    addExtraFile(filePath, fileContents) {
        this.extraFiles[filePath] = fileContents
    }

    // Put all currently open XML files into zip.
    allXMLToZip() {
        for (const fileName in this.docs) {
            this.xmlToZip(fileName)
        }
    }

    // Put all extra files into zip.
    allExtraToZip() {
        for (const fileName in this.extraFiles) {
            this.zip.file(fileName, this.extraFiles[fileName])
        }
    }

    // Put the xml identified by filePath into zip.
    xmlToZip(filePath) {
        const string = this.docs[filePath].toString()
        this.zip.file(filePath, string)
    }

    prepareBlob() {
        this.allXMLToZip()
        this.allExtraToZip()

        return this.zip.generateAsync({type: "blob", mimeType: this.mimeType})
    }
}
