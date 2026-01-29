import {descendantNodes} from "../tools/doc_content"

const DEFAULT_LISTPARAGRAPH_XML = `
    <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:uiPriority w:val="34"/>
    <w:qFormat/>
    <w:rsid w:val="006E68A6"/>
    <w:pPr>
      <w:ind w:left="720"/>
      <w:contextualSpacing/>
    </w:pPr>
    </w:style>
    `

const DEFAULT_NUMBERING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:numbering xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex" xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex" xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex" xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex" xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex" xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex" xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex" xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 w16se wp14">
    </w:numbering>`

export class DOCXExporterLists {
    constructor(docContent, xml, rels) {
        this.docContent = docContent
        this.xml = xml
        this.rels = rels
        this.useBulletList = false
        this.usedNumberedList = []
        this.styleXML = false
        this.numberingXML = false
        this.abstractNumIdCounter = -1
        this.numIdCounter = -1
        // We only need one bulletType for all bullet lists, but a new
        // numberedType for each numbered list so that the numbering starts in 1
        // each time.
        this.bulletType = false
        this.numberFormat = "decimal"
        this.numberedTypes = []
        this.styleFilePath = "word/styles.xml"
        this.numberingFilePath = "word/numbering.xml"
        this.ctFilePath = "[Content_Types].xml"
    }

    init() {
        this.findLists()
        if (this.usedNumberedList.length > 0 || this.useBulletList) {
            const p = []

            p.push(
                new Promise(resolve => {
                    this.initCt().then(() => resolve())
                })
            )

            p.push(
                new Promise(resolve => {
                    this.addNumberingXml().then(() => resolve())
                })
            )

            p.push(
                new Promise(resolve => {
                    this.addListParagraphStyle().then(() => resolve())
                })
            )
            return Promise.all(p)
        } else {
            return Promise.resolve()
        }
    }

    initCt() {
        return this.xml.getXml(this.ctFilePath).then(ctXML => {
            this.ctXML = ctXML
            this.addRelsToCt()
            return Promise.resolve()
        })
    }

    addRelsToCt() {
        const override = this.ctXML.query("Override", {
            PartName: `/${this.numberingFilePath}`
        })
        if (!override) {
            const types = this.ctXML.query("Types")
            types.appendXML(
                `<Override PartName="/${this.numberingFilePath}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>`
            )
        }
    }

    findLists() {
        descendantNodes(this.docContent).forEach(node => {
            if (node.type === "bullet_list") {
                this.useBulletList = true
            } else if (node.type === "ordered_list") {
                this.usedNumberedList.push(node.attrs.order)
            }
        })
    }

    addNumberingXml() {
        return this.xml
            .getXml(this.numberingFilePath, DEFAULT_NUMBERING_XML)
            .then(numberingXML => {
                this.numberingXML = numberingXML
                this.rels.addNumberingRel()
                this.addUsedListTypes()
                return Promise.resolve()
            })
    }

    addListParagraphStyle() {
        return this.xml.getXml(this.styleFilePath).then(styleXML => {
            this.styleXML = styleXML
            if (
                !this.styleXML.query("w:style", {"w:styleId": "ListParagraph"})
            ) {
                const stylesEl = this.styleXML.query("w:styles")
                stylesEl.appendXML(DEFAULT_LISTPARAGRAPH_XML)
            }
            return Promise.resolve()
        })
    }

    addUsedListTypes() {
        const allAbstractNum = this.numberingXML.queryAll("w:abstractNum")
        allAbstractNum.forEach(abstractNum => {
            // We check the format for the lowest level list and use the first
            // one we find  for 'bullet' or 'not bullet'
            // This means that if a list is defined using anything else than
            // bullets, it will be accepted as the format of
            // the numeric list.
            const levelZeroFormat = abstractNum
                .query("w:lvl", {"w:ilvl": "0"})
                .query("w:numFmt")
                .getAttribute("w:val")
            const abstractNumId = Number.parseInt(
                abstractNum.getAttribute("w:abstractNumId")
            )
            if (levelZeroFormat === "bullet" && !this.bulletAbstractType) {
                const numEl = this.numberingXML.query("w:abstractNumId", {
                    "w:val": abstractNumId
                }).parentElement
                const numId = Number.parseInt(numEl.getAttribute("w:numId"))
                this.bulletType = numId
            } else if (levelZeroFormat !== "bullet" && !this.numberFormat) {
                this.numberFormat = levelZeroFormat
            }
            if (this.abstractNumIdCounter < abstractNumId) {
                this.abstractNumIdCounter = abstractNumId
            }
        })
        const allNum = this.numberingXML.queryAll("w:num")
        allNum.forEach(numEl => {
            const numId = Number.parseInt(numEl.getAttribute("w:val"))
            if (this.numIdCounter < numId) {
                this.numIdCounter = numId
            }
        })

        if (!this.bulletType && this.useBulletList) {
            this.addBulletNumType(
                ++this.numIdCounter,
                ++this.abstractNumIdCounter
            )
            this.bulletType = this.numIdCounter
        }
        if (this.usedNumberedList.length > 0) {
            this.abstractNumIdCounter++

            this.numberedAbstractType = this.abstractNumIdCounter
        }
        for (let i = 0; i < this.usedNumberedList.length; i++) {
            const numId = ++this.numIdCounter
            this.addNumberedNumType(numId, this.usedNumberedList[i])
            this.numberedTypes.push(numId)
        }
    }

    getBulletType() {
        return this.bulletType
    }

    getNumberedType() {
        return this.numberedTypes.shift()
    }

    addBulletNumType(numId, abstractNumId) {
        const numberingEl = this.numberingXML.query("w:numbering")
        numberingEl.appendXML(`
            <w:abstractNum w:abstractNumId="${abstractNumId}" w15:restartNumberingAfterBreak="0">
                <w:nsid w:val="3620195A" />
                <w:multiLevelType w:val="hybridMultilevel" />
                <w:tmpl w:val="A74C9E6A" />
            </w:abstractNum>
            <w:num w:numId="${numId}">
                <w:abstractNumId w:val="${abstractNumId}" />
            </w:num>
        `)
        const newAbstractNum = this.numberingXML.query("w:abstractNum", {
            "w:abstractNumId": String(abstractNumId)
        })
        // Definition seem to always define 9 levels (0-8).
        for (let level = 0; level < 9; level++) {
            newAbstractNum.appendXML(`
                <w:lvl w:ilvl="${level}" w:tplc="04090001" w:tentative="1">
                    <w:start w:val="1" />
                    <w:numFmt w:val="bullet" />
                    <w:lvlText w:val="" />
                    <w:lvlJc w:val="left" />
                    <w:pPr>
                        <w:ind w:left="${(level + 1) * 720}" w:hanging="360" />
                    </w:pPr>
                    <w:rPr>
                        <w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default" />
                    </w:rPr>
                </w:lvl>
            `)
        }
    }

    addNumberedNumType(numId, start) {
        this.abstractNumIdCounter++
        this.addNumberedAbstractNumType(this.abstractNumIdCounter, start)
        const numberingEl = this.numberingXML.query("w:numbering")
        numberingEl.appendXML(`
            <w:num w:numId="${numId}">
                <w:abstractNumId w:val="${this.abstractNumIdCounter}" />
            </w:num>
        `)
    }

    addNumberedAbstractNumType(abstractNumId, start) {
        const numberingEl = this.numberingXML.query("w:numbering")
        numberingEl.appendXML(`
            <w:abstractNum w:abstractNumId="${abstractNumId}" w15:restartNumberingAfterBreak="0">
                <w:nsid w:val="7F6635F3" />
                <w:multiLevelType w:val="hybridMultilevel" />
                <w:tmpl w:val="BFFEF214" />
            </w:abstractNum>
        `)
        const newAbstractNum = this.numberingXML.query("w:abstractNum", {
            "w:abstractNumId": String(abstractNumId)
        })
        // Definition seem to always define 9 levels (0-8).
        for (let level = 0; level < 9; level++) {
            newAbstractNum.appendXML(`
                <w:lvl w:ilvl="${level}" w:tplc="0409000F">
                    <w:start w:val="${start}" />
                    <w:numFmt w:val="${this.numberFormat}" />
                    <w:lvlText w:val="%${level + 1}." />
                    <w:lvlJc w:val="left" />
                    <w:pPr>
                        <w:ind w:left="${(level + 1) * 720}" w:hanging="360" />
                    </w:pPr>
                </w:lvl>
            `)
        }
    }
}
