import {mml2omml} from "mathml2omml"

// Not entirely sure if we need this font here. This is included whenever Word
// itself adds a formula, but our ooml doesn't refer to the font, so it may be pointless.
const CAMBRIA_MATH_FONT_DECLARATION = `
    <w:font w:name="Cambria Math">
        <w:panose1 w:val="02040503050406030204" />
        <w:charset w:val="00" />
        <w:family w:val="roman" />
        <w:pitch w:val="variable" />
        <w:sig w:usb0="E00002FF" w:usb1="420024FF" w:usb2="00000000" w:usb3="00000000" w:csb0="0000019F" w:csb1="00000000" />
    </w:font>`

export class DOCXExporterMath {
    constructor(xml) {
        this.xml = xml
        this.fontTableXML = false
        this.addedCambriaMath = false
        this.domParser = new DOMParser()
    }

    init() {
        return this.xml
            .getXml("word/fontTable.xml")
            .then(fontTablesXML => {
                this.fontTablesXML = fontTablesXML
                return import("mathlive")
            })
            .then(MathLive => (this.mathLive = MathLive))
    }

    latexToMathML(latex) {
        return this.mathLive.convertLatexToMathMl(latex)
    }

    getOmml(latex) {
        if (!this.addedCambriaMath) {
            const fontsEl = this.fontTablesXML.query("w:fonts")
            fontsEl.appendXML(CAMBRIA_MATH_FONT_DECLARATION)
            this.addedCambriaMath = true
        }
        const mathmlString = `<math xmlns="http://www.w3.org/1998/Math/MathML"><semantics>${this.latexToMathML(latex)}</semantics></math>`
        const ommlString = mml2omml(mathmlString)
        return ommlString
    }
}
