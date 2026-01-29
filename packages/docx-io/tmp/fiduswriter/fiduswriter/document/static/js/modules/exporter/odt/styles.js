const GRAPHIC_STYLES = {
    Formula: `
        <style:style style:name="Formula" style:family="graphic">
            <style:graphic-properties text:anchor-type="as-char" svg:y="0in" fo:margin-left="0.0791in" fo:margin-right="0.0791in" style:vertical-pos="middle" style:vertical-rel="text"/>
        </style:style>`,
    Graphics: `
        <style:style style:name="Graphics" style:family="graphic">
            <style:graphic-properties text:anchor-type="paragraph" svg:x="0in" svg:y="0in" style:wrap="dynamic" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="false" style:vertical-pos="top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph"/>
        </style:style>`,
    Frame: `
        <style:style style:name="Frame" style:family="graphic">
            <style:graphic-properties text:anchor-type="paragraph" svg:x="0in" svg:y="0in" style:wrap="dynamic" style:number-wrapped-paragraphs="no-limit" style:wrap-contour="false" style:vertical-pos="top" style:vertical-rel="paragraph" style:horizontal-pos="center" style:horizontal-rel="paragraph"/>
        </style:style>`
}

const PAR_STYLES = {
    Bibliography_20_Heading: `<style:style style:name="Bibliography_20_Heading" style:display-name="Bibliography Heading" style:family="paragraph" style:parent-style-name="Heading" style:class="index">
        <style:paragraph-properties fo:margin-left="0in" fo:margin-right="0in" fo:text-indent="0in" style:auto-text-indent="false" text:number-lines="false" text:line-number="0"/>
        <style:text-properties fo:font-size="16pt" fo:font-weight="bold" style:font-size-asian="16pt" style:font-weight-asian="bold" style:font-size-complex="16pt" style:font-weight-complex="bold"/>
    </style:style>`,
    Caption: `<style:style style:name="Caption" style:family="paragraph" style:parent-style-name="Standard" style:class="extra">
            <style:paragraph-properties fo:margin-top="0.0835in" fo:margin-bottom="0.0835in" loext:contextual-spacing="false" text:number-lines="false" text:line-number="0" />
            <style:text-properties fo:font-style="italic" style:font-style-asian="italic" style:font-style-complex="italic" />
        </style:style>`,
    Figure: '<style:style style:name="Figure" style:family="paragraph" style:parent-style-name="Caption" style:class="extra" />',
    Standard:
        '<style:style style:name="Standard" style:family="paragraph" style:class="text" />'
}

export class ODTExporterStyles {
    constructor(xml) {
        this.xml = xml

        this.contentXml = false
        this.stylesXml = false
        this.boldStyleId = false
        this.italicStyleId = false
        this.boldItalicStyleId = false
        this.inlineStyleIds = {}
        this.tableStyleIds = {}
        this.graphicStyleIds = {}
        this.bulletListStyleId = [false, false]
        this.inlineStyleCounter = 0
        this.tableStyleCounter = 0
        this.blockStyleCounter = 0
        this.listStyleCounter = 0
        this.graphicStyleCounter = 0
    }

    init() {
        return this.xml
            .getXml("styles.xml")
            .then(stylesXml => {
                this.stylesXml = stylesXml
                return this.xml.getXml("content.xml")
            })
            .then(contentXml => {
                this.contentXml = contentXml
                this.getStyleCounters()
                return Promise.resolve()
            })
    }

    getStyleCounters() {
        const autoStylesEl = this.contentXml.query("office:automatic-styles")
        const styles = autoStylesEl.queryAll("style:style")
        styles.forEach(style => {
            const styleNumber = Number.parseInt(
                style.getAttribute("style:name").replace(/\D/g, "")
            )
            const styleFamily = style.getAttribute("style:family")
            if (styleFamily === "text") {
                if (styleNumber > this.inlineStyleCounter) {
                    this.inlineStyleCounter = styleNumber
                }
            } else if (styleFamily === "table") {
                if (styleNumber > this.tableStyleCounter) {
                    this.tableStyleCounter = styleNumber
                }
            } else if (styleFamily === "paragraph") {
                if (styleNumber > this.blockStyleCounter) {
                    this.blockStyleCounter = styleNumber
                }
            } else if (styleFamily === "graphic") {
                if (styleNumber > this.graphicStyleCounter) {
                    this.graphicStyleCounter = styleNumber
                }
            }
        })
        const listStyles = autoStylesEl.queryAll("text:list-style")
        listStyles.forEach(style => {
            const styleNumber = Number.parseInt(
                style.getAttribute("style:name").replace(/\D/g, "")
            )
            if (styleNumber > this.listStyleCounter) {
                this.listStyleCounter = styleNumber
            }
        })
    }

    /*
    attributes is a string that consists of these characters (in this order).
    Only one of super/sub possible.
    e = italic/em
    s = bold/strong
    u = underline
    c = small caps
    p = super
    b = sub
    */
    getInlineStyleId(attributes) {
        if (this.inlineStyleIds[attributes]) {
            return this.inlineStyleIds[attributes]
        }

        let styleProperties = ""
        if (attributes.includes("e")) {
            styleProperties +=
                ' fo:font-style="italic" style:font-style-asian="italic" style:font-style-complex="italic"'
        }
        if (attributes.includes("s")) {
            styleProperties +=
                ' fo:font-weight="bold" style:font-weight-asian="bold" style:font-weight-complex="bold"'
        }
        if (attributes.includes("u")) {
            styleProperties +=
                ' style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"'
        }
        if (attributes.includes("c")) {
            styleProperties += ' fo:font-variant="small-caps"'
        }
        if (attributes.includes("p")) {
            styleProperties += ' style:text-position="super 58%"'
        } else if (attributes.includes("b")) {
            styleProperties += ' style:text-position="sub 58%"'
        }
        const styleCounter = ++this.inlineStyleCounter
        this.inlineStyleIds[attributes] = styleCounter
        const autoStylesEl = this.contentXml.query("office:automatic-styles")
        autoStylesEl.appendXML(`
            <style:style style:name="T${styleCounter}" style:family="text">
                <style:text-properties${styleProperties}/>
            </style:style>
        `)
        return styleCounter
    }

    /*
    aligned: left/center/right
    width: '75'/'50'/'25' = percentage width - 100% doesn't need any style
    */
    getTableStyleId(aligned, width) {
        if (this.tableStyleIds[aligned + width]) {
            return this.tableStyleIds[aligned + width]
        }
        const styleCounter = ++this.tableStyleCounter
        this.tableStyleIds[aligned + width] = styleCounter
        const autoStylesEl = this.contentXml.query("office:automatic-styles")
        autoStylesEl.appendXML(`
            <style:style style:name="Table${styleCounter}" style:family="table">
                <style:table-properties style:rel-width="${width}%" table:align="${aligned}"/>
            </style:style>
        `)
        return styleCounter
    }

    checkParStyle(styleName) {
        const stylesParStyle = this.stylesXml.query("style:style", {
            "style:name": styleName
        })
        const contentParStyle = this.contentXml.query("style:style", {
            "style:name": styleName
        })
        if (!stylesParStyle && !contentParStyle) {
            const stylesEl = this.stylesXml.query("office:styles")
            const displayName = styleName.split("_20_").join(" ")
            stylesEl.appendXML(
                PAR_STYLES[styleName] ||
                    `<style:style style:name="${styleName}" style:display-name="${displayName}" style:family="paragraph" style:parent-style-name="Standard" style:class="text" />`
            )
        }
    }

    checkGraphicStyle(styleName) {
        const stylesParStyle = this.stylesXml.query("style:style", {
            "style:name": styleName
        })
        const contentParStyle = this.contentXml.query("style:style", {
            "style:name": styleName
        })
        if (!stylesParStyle && !contentParStyle) {
            const stylesEl = this.stylesXml.query("office:styles")
            stylesEl.appendXML(GRAPHIC_STYLES[styleName])
        }
    }

    /*
    styleName: Frame/Formula/Graphics
    aligned: left/center/right (not used for Formula)
    */
    getGraphicStyleId(styleName, aligned = "") {
        if (this.graphicStyleIds[styleName + aligned]) {
            return this.graphicStyleIds[styleName + aligned]
        }
        this.checkGraphicStyle(styleName)

        const styleCounter = ++this.graphicStyleCounter
        this.graphicStyleIds[styleName + aligned] = styleCounter
        const autoStylesEl = this.contentXml.query("office:automatic-styles")
        autoStylesEl.appendXML(`
            <style:style style:name="fr${styleCounter}" style:family="graphic" style:parent-style-name="${styleName}">
                ${
                    styleName === "Formula"
                        ? '<style:graphic-properties style:vertical-pos="from-top" style:horizontal-pos="from-left" style:horizontal-rel="paragraph-content" draw:ole-draw-aspect="1" />'
                        : `<style:graphic-properties fo:margin-left="0in" fo:margin-right="0in" fo:margin-top="0in" fo:margin-bottom="0in" ${aligned === "center" ? 'style:wrap="none"' : 'style:wrap="dynamic"  style:number-wrapped-paragraphs="no-limit"'} style:vertical-pos="top" style:vertical-rel="paragraph" style:horizontal-pos="${aligned}" style:horizontal-rel="paragraph" fo:padding="0in" fo:border="none" loext:rel-width-rel="paragraph" />`
                } style:number-wrapped-paragraphs="no-limit"
            </style:style>`)
        return styleCounter
    }

    addReferenceStyle(bibInfo) {
        // The style called "Bibliography_20_1" will override any previous style
        // of the same name.
        const stylesParStyle = this.stylesXml.query("style:style", {
            "style:name": "Bibliography_20_1"
        })
        if (stylesParStyle) {
            stylesParStyle.parentElement.removeChild(stylesParStyle)
        }
        const contentParStyle = this.contentXml.query("style:style", {
            "style:name": "Bibliography_20_1"
        })
        if (contentParStyle) {
            contentParStyle.parentElement.removeChild(contentParStyle)
        }

        this.checkParStyle("Index")

        const lineHeight = `${0.1665 * bibInfo.linespacing}in`
        const marginBottom = `${0.1667 * bibInfo.entryspacing}in`
        let marginLeft = "0in",
            textIndent = "0in",
            tabStops = "<style:tab-stops/>"

        if (bibInfo.hangingindent) {
            marginLeft = "0.5in"
            textIndent = "-0.5in"
        } else if (bibInfo["second-field-align"]) {
            // We calculate 0.55em as roughly equivalent to one letter width.
            const firstFieldWidth = `${(bibInfo.maxoffset + 1) * 0.55}em`
            if (bibInfo["second-field-align"] === "margin") {
                textIndent = `-${firstFieldWidth}`
                tabStops =
                    '<style:tab-stops><style:tab-stop style:position="0in"/></style:tab-stops>'
            } else {
                textIndent = `-${firstFieldWidth}`
                marginLeft = `${firstFieldWidth}`
                tabStops = `<style:tab-stops><style:tab-stop style:position="${firstFieldWidth}"/></style:tab-stops>`
            }
        }
        const styleDef = `
            <style:style style:name="Bibliography_20_1" style:display-name="Bibliography 1" style:family="paragraph" style:parent-style-name="Index" style:class="index">
                <style:paragraph-properties fo:margin-left="${marginLeft}" fo:margin-right="0in" fo:margin-top="0in" fo:margin-bottom="${marginBottom}" loext:contextual-spacing="false" fo:text-indent="${textIndent}" style:line-height-at-least="${lineHeight}" style:auto-text-indent="false">
                    ${tabStops}
                </style:paragraph-properties>
            </style:style>`
        const stylesEl = this.stylesXml.query("office:styles")
        stylesEl.appendXML(styleDef)
    }

    getBulletListStyleId() {
        if (this.bulletListStyleId[0]) {
            return this.bulletListStyleId
        }
        this.bulletListStyleId[0] = ++this.listStyleCounter
        const autoStylesEl = this.contentXml.query("office:automatic-styles")
        autoStylesEl.appendXML(`
            <text:list-style style:name="L${this.bulletListStyleId[0]}">
            </text:list-style>
        `)
        const listStyleEl =
            autoStylesEl.children[autoStylesEl.children.length - 1]
        // ODT files seem to contain ten levels of lists (1-10)
        for (let level = 1; level < 11; level++) {
            listStyleEl.appendXML(`
                <text:list-level-style-bullet text:level="${level}" text:style-name="Bullet_20_Symbols" text:bullet-char="•">
                    <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
                        <style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="${(level + 1) * 0.25}in" fo:text-indent="-0.25in" fo:margin-left="${(level + 1) * 0.25}in" />
                    </style:list-level-properties>
                </text:list-level-style-bullet>
            `)
        }
        this.bulletListStyleId[1] = this.addListParStyle(
            this.bulletListStyleId[0]
        )
        return this.bulletListStyleId
    }

    getOrderedListStyleId(start) {
        const orderedListStyleId = ++this.listStyleCounter
        const autoStylesEl = this.contentXml.query("office:automatic-styles")
        autoStylesEl.appendXML(`
            <text:list-style style:name="L${orderedListStyleId}">
            </text:list-style>
        `)
        const listStyleEl =
            autoStylesEl.children[autoStylesEl.children.length - 1]
        // ODT files seem to contain ten levels of lists (1-10)
        for (let level = 1; level < 11; level++) {
            listStyleEl.appendXML(`
                <text:list-level-style-number text:level="${level}" text:style-name="Numbering_20_Symbols" style:num-suffix="." style:num-format="1"${start > 1 ? ` text:start-value="${start}"` : ""}>
                    <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
                        <style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="${(level + 1) * 0.25}in" fo:text-indent="-0.25in" fo:margin-left="${(level + 1) * 0.25}in" />
                    </style:list-level-properties>
                </text:list-level-style-number>
            `)
        }
        return [orderedListStyleId, this.addListParStyle(orderedListStyleId)]
    }

    // Add a paragraph style for either paragraph in bullet or numeric list
    addListParStyle(_listId) {
        const parStyleId = ++this.blockStyleCounter
        const autoStylesEl = this.contentXml.query("office:automatic-styles")
        autoStylesEl.appendXML(
            `<style:style style:name="P${parStyleId}" style:family="paragraph" style:parent-style-name="Standard" text:list-style-name="L1" />`
        )
        return parStyleId
    }

    addPageBreakStyle() {
        const stylesEl = this.stylesXml.query("office:styles")
        stylesEl.queryAll("style:style").forEach(style => {
            if (style.getAttribute("style:name") === "PageBreak") {
                return
            }
        })
        stylesEl.appendXML(
            '<style:style style:name="PageBreak" style:family="paragraph" style:parent-style-name="Standard" style:class="extra"><style:paragraph-properties fo:break-before="page"/></style:style>'
        )
    }

    setLanguage(langCode) {
        const langCodes = langCode.split("-"),
            [language] = langCodes

        let [, country] = langCodes

        if (!country) {
            country = "none"
        }
        const stylesEl = this.stylesXml.query("office:styles")
        stylesEl.queryAll("style:default-style").forEach(el => {
            el.queryAll("style:text-properties").forEach(el => {
                el.setAttribute("fo:language", language)
                el.setAttribute("fo:country", country)
            })
        })
    }
}
