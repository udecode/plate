import {escapeText} from "../../common"

export class ODTExporterTracks {
    constructor(xml) {
        this.xml = xml

        this.contentXml = false
        this.trackChangesSection = false
        this.counter = 0
    }

    init() {
        return this.xml.getXml("content.xml").then(contentXml => {
            this.contentXml = contentXml
        })
    }

    checkTrackedChangesSection() {
        if (this.trackChangesSection) {
            return
        }
        const trackChangesSection = this.contentXml.query(
            "text:tracked-changes"
        )
        if (trackChangesSection) {
            this.trackChangesSection = trackChangesSection
        } else {
            const textElement = this.contentXml.query("office:text")
            if (!textElement) {
                throw new Error("No text element found in content.xml")
            }
            textElement.prependXML(
                "<text:tracked-changes></text:tracked-changes>"
            )
            this.trackChangesSection = textElement.firstElementChild
        }
    }

    addChange(trackInfo, deletionString = "") {
        if (!this.trackChangesSection) {
            this.checkTrackedChangesSection()
        }
        const trackId = `ct${Date.now() + this.counter++}`
        const changeXml = `
        <text:changed-region xml:id="${trackId}" text:id="${trackId}">
            ${
                trackInfo.type === "deletion"
                    ? `<text:deletion>
                    <office:change-info>
                        <dc:creator>${escapeText(trackInfo.username)}</dc:creator>
                        <dc:date>${new Date(trackInfo.date * 60000).toISOString().slice(0, 19)}</dc:date>
                    </office:change-info>
                    ${deletionString}
                </text:deletion>`
                    : trackInfo.type === "insertion"
                      ? `<text:insertion>
        <office:change-info>
            <dc:creator>${escapeText(trackInfo.username)}</dc:creator>
            <dc:date>${new Date(trackInfo.date * 60000).toISOString().slice(0, 19)}</dc:date>
        </office:change-info>
    </text:insertion>`
                      : ""
            }
        </text:changed-region>`
        this.trackChangesSection.appendXML(changeXml)
        return trackId
    }
}
