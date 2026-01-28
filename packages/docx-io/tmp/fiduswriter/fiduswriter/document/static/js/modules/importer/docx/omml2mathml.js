// Converted version of https://github.com/scienceai/omml2mathml/blob/master/index.js
// that works with our xml dom.

import {xmlDOM} from "../../exporter/tools/xml"
const MATH_NS = "http://www.w3.org/1998/Math/MathML"

// Regular expression matching mathematical operators
const oprx =
    /[\+\-\*\/\^\&\|\!\~\<\>\=\:\u2208\u2209\u220B\u220C\u2218\u2219\u221D\u2223\u2224\u2225\u2226\u2227\u2228\u2229\u222A\u222B\u222C\u222D\u2234\u2235\u2236\u2237\u2238\u2239\u223A\u223B\u223C\u223D\u223E\u223F\u2240\u2241\u2242\u2243\u2244\u2245\u2246\u2247\u2248\u2249\u224A\u224B\u224C\u224D\u224E\u224F\u2250\u2251\u2252\u2253\u2254\u2255\u2256\u2257\u2258\u2259\u225A\u225B\u225C\u225D\u225E\u225F\u2260\u2261\u2262\u2263\u2264\u2265\u2266\u2267\u2268\u2269\u226A\u226B\u226C\u226D\u226E\u226F\u2270\u2271\u2272\u2273\u2274\u2275\u2276\u2277\u2278\u2279\u227A\u227B\u227C\u227D\u227E\u227F\u2280\u2281\u2282\u2283\u2284\u2285\u2286\u2287\u2288\u2289\u228A\u228B\u228C\u228D\u228E\u228F\u2290\u2291\u2292\u2293\u2294\u2295\u2296\u2297\u2298\u2299\u229A\u229B\u229C\u229D\u229E\u229F\u22A0\u22A1\u22A2\u22A3\u22A4\u22A5\u22A6\u22A7\u22A8\u22A9\u22AA\u22AB\u22AC\u22AD\u22AE\u22AF\u22B0\u22B1\u22B2\u22B3\u22B4\u22B5\u22B6\u22B7\u22B8\u22B9\u22BA\u22BB\u22BC\u22BD\u22C0\u22C1\u22C2\u22C3\u22C4\u22C5\u22C6\u22C7\u22C8\u22C9\u22CA\u22CB\u22CC\u22CD\u22CE\u22CF\u22D0\u22D1\u22D2\u22D3\u22D4\u22D5\u22D6\u22D7\u22D8\u22D9\u22DA\u22DB\u22DC\u22DD\u22DE\u22DF\u22E0\u22E1\u22E2\u22E3\u22E4\u22E5\u22E6\u22E7\u22E8\u22E9\u22EA\u22EB\u22EC\u22ED\u22EE\u22EF\u22F0\u22F1\u22F2\u22F3\u22F4\u22F5\u22F6\u22F7\u22F8\u22F9\u22FA\u22FB\u22FC\u22FD\u22FE\u22FF]/

/**
 * Converts OMML to MathML
 * @param {XMLElement} omml - OMML XML element
 * @return {string} MathML XML string
 */
export function omml2mathml(omml) {
    // Create the root math element
    const math = xmlDOM(`<math xmlns="${MATH_NS}" display="inline"></math>`)

    // Process the OMML document
    processOMML(omml, math)

    return math
}

/**
 * Process the OMML document and convert to MathML
 * @param {XMLElement} omml - The OMML element to process
 * @param {XMLElement} math - The parent MathML element
 */
function processOMML(omml, math) {
    // Handle different OMML elements
    if (omml.tagName === "m:oMathPara") {
        math.setAttribute("display", "block")
        omml.queryAll("m:oMath").forEach(omath => {
            processOMML(omath, math)
        })
    } else if (omml.tagName === "m:oMath") {
        const mrow = createMathElement("mrow", {}, math)
        processChildren(omml, mrow)
    } else {
        processElement(omml, math)
    }
}

/**
 * Process an OMML element and create corresponding MathML
 * @param {XMLElement} element - The OMML element to process
 * @param {XMLElement} parent - The parent MathML element
 */
function processElement(element, parent) {
    if (!element || !element.tagName) {
        return
    }

    switch (element.tagName) {
        case "m:f":
            processFraction(element, parent)
            break
        case "m:r":
            processRun(element, parent)
            break
        case "m:limLow":
            processLimLow(element, parent)
            break
        case "m:limUpp":
            processLimUpp(element, parent)
            break
        case "m:sSub":
            processSubscript(element, parent)
            break
        case "m:sSup":
            processSuperscript(element, parent)
            break
        case "m:sSubSup":
            processSubSuperscript(element, parent)
            break
        case "m:sPre":
            processPreScript(element, parent)
            break
        case "m:m":
            processMatrix(element, parent)
            break
        case "m:rad":
            processRadical(element, parent)
            break
        case "m:nary":
            processNary(element, parent)
            break
        case "m:d":
            processDelimiter(element, parent)
            break
        case "m:eqArr":
            processEqArr(element, parent)
            break
        case "m:func":
            processFunction(element, parent)
            break
        case "m:acc":
            processAccent(element, parent)
            break
        case "m:groupChr":
            processGroupChar(element, parent)
            break
        case "m:borderBox":
            processBorderBox(element, parent)
            break
        case "m:bar":
            processBar(element, parent)
            break
        case "m:phant":
            processPhantom(element, parent)
            break
        case "m:e":
        case "m:den":
        case "m:num":
        case "m:lim":
        case "m:sup":
        case "m:sub":
            processArgument(element, parent)
            break
        default:
            // Process children for unhandled elements
            processChildren(element, parent)
    }
}

/**
 * Process all children of an element
 * @param {XMLElement} element - The element whose children to process
 * @param {XMLElement} parent - The parent MathML element
 */
function processChildren(element, parent) {
    if (!element || !element.children) {
        return
    }

    element.children.forEach(child => {
        if (typeof child === "object") {
            processElement(child, parent)
        }
    })
}

/**
 * Create a MathML element with specified attributes
 * @param {string} tag - The MathML tag name
 * @param {Object} attrs - The attributes to set
 * @param {XMLElement} parent - The parent element
 * @return {XMLElement} The created element
 */
function createMathElement(tag, attrs = {}, parent = null) {
    const elem = xmlDOM(`<${tag}></${tag}>`)

    // Set attributes
    Object.entries(attrs).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            elem.setAttribute(key, value)
        }
    })

    if (parent) {
        parent.appendChild(elem)
    }

    return elem
}

/**
 * Process a fraction element
 * @param {XMLElement} element - The OMML fraction element
 * @param {XMLElement} parent - The parent MathML element
 */
function processFraction(element, parent) {
    const type = getAttr(element, "m:fPr/m:type", "m:val") || ""

    if (type.toLowerCase() === "lin") {
        const mrow = createMathElement("mrow", {}, parent)
        const numRow = createMathElement("mrow", {}, mrow)
        const num = element.query("m:num")
        if (num) {
            processElement(num, numRow)
        }
        const mo = createMathElement("mo", {}, mrow)
        mo.textContent = "/"

        const denRow = createMathElement("mrow", {}, mrow)
        const den = element.query("m:den")
        if (den) {
            processElement(den, denRow)
        }
    } else {
        const attr = getFracProps(type.toLowerCase())
        const mfrac = createMathElement("mfrac", attr, parent)

        const numRow = createMathElement("mrow", {}, mfrac)
        const num = element.query("m:num")
        if (num) {
            processElement(num, numRow)
        }
        const denRow = createMathElement("mrow", {}, mfrac)
        const den = element.query("m:den")
        if (den) {
            processElement(den, denRow)
        }
    }
}

/**
 * Process a run of text
 * @param {XMLElement} element - The OMML run element
 * @param {XMLElement} parent - The parent MathML element
 */
function processRun(element, parent) {
    const nor = forceFalse(getAttr(element, "m:rPr/m:nor", "m:val") || "false")
    if (nor) {
        const mtext = createMathElement("mtext", {}, parent)
        const textContent = element
            .queryAll("m:t")
            .map(t => t.textContent)
            .join("")
        mtext.textContent = nbsp(textContent)
    } else {
        element.queryAll("m:t").forEach(t => {
            const toParse = t.textContent
            const scr = getAttr(element, "m:rPr/m:scr", "m:val")
            const sty = getAttr(element, "m:rPr/m:sty", "m:val")
            parseMT(element, parent, {
                toParse,
                scr,
                sty,
                nor: false
            })
        })
    }
}

/**
 * Process a lower limit element
 * @param {XMLElement} element - The OMML limLow element
 * @param {XMLElement} parent - The parent MathML element
 */
function processLimLow(element, parent) {
    const munder = createMathElement("munder", {}, parent)
    const row1 = createMathElement("mrow", {}, munder)
    const row2 = createMathElement("mrow", {}, munder)

    const e = element.query("m:e")
    if (e) {
        processElement(e, row1)
    }

    const lim = element.query("m:lim")
    if (lim) {
        processElement(lim, row2)
    }
}

/**
 * Process an upper limit element
 * @param {XMLElement} element - The OMML limUpp element
 * @param {XMLElement} parent - The parent MathML element
 */
function processLimUpp(element, parent) {
    const mover = createMathElement("mover", {}, parent)
    const row1 = createMathElement("mrow", {}, mover)
    const row2 = createMathElement("mrow", {}, mover)

    const e = element.query("m:e")
    if (e) {
        processElement(e, row1)
    }

    const lim = element.query("m:lim")
    if (lim) {
        processElement(lim, row2)
    }
}

/**
 * Process a subscript element
 * @param {XMLElement} element - The OMML sSub element
 * @param {XMLElement} parent - The parent MathML element
 */
function processSubscript(element, parent) {
    const msub = createMathElement("msub", {}, parent)
    const row1 = createMathElement("mrow", {}, msub)
    const row2 = createMathElement("mrow", {}, msub)

    const e = element.query("m:e")
    if (e) {
        processElement(e, row1)
    }

    const sub = element.query("m:sub")
    if (sub) {
        processElement(sub, row2)
    }
}

/**
 * Process a superscript element
 * @param {XMLElement} element - The OMML sSup element
 * @param {XMLElement} parent - The parent MathML element
 */
function processSuperscript(element, parent) {
    const msup = createMathElement("msup", {}, parent)
    const row1 = createMathElement("mrow", {}, msup)
    const row2 = createMathElement("mrow", {}, msup)

    const e = element.query("m:e")
    if (e) {
        processElement(e, row1)
    }

    const sup = element.query("m:sup")
    if (sup) {
        processElement(sup, row2)
    }
}

/**
 * Process a subscript-superscript element
 * @param {XMLElement} element - The OMML sSubSup element
 * @param {XMLElement} parent - The parent MathML element
 */
function processSubSuperscript(element, parent) {
    const msubsup = createMathElement("msubsup", {}, parent)
    const row1 = createMathElement("mrow", {}, msubsup)
    const row2 = createMathElement("mrow", {}, msubsup)
    const row3 = createMathElement("mrow", {}, msubsup)

    const e = element.query("m:e")
    if (e) {
        processElement(e, row1)
    }

    const sub = element.query("m:sub")
    if (sub) {
        processElement(sub, row2)
    }

    const sup = element.query("m:sup")
    if (sup) {
        processElement(sup, row3)
    }
}

/**
 * Process a prescripted element
 * @param {XMLElement} element - The OMML sPre element
 * @param {XMLElement} parent - The parent MathML element
 */
function processPreScript(element, parent) {
    const mmultiscripts = createMathElement("mmultiscripts", {}, parent)
    const row = createMathElement("mrow", {}, mmultiscripts)

    const e = element.query("m:e")
    if (e) {
        processElement(e, row)
    }

    createMathElement("mprescripts", {}, mmultiscripts)

    const sub = element.query("m:sub")
    outputScript(mmultiscripts, sub)

    const sup = element.query("m:sup")
    outputScript(mmultiscripts, sup)
}

/**
 * Process a matrix element
 * @param {XMLElement} element - The OMML matrix element
 * @param {XMLElement} parent - The parent MathML element
 */
function processMatrix(element, parent) {
    const mcjc = getAttr(element, "m:mPr/m:mcs/m:mc/m:mcPr/m:mcJc", "m:val")

    const attrs = {}
    if (mcjc && mcjc.toLowerCase() !== "center") {
        attrs.columnalign = mcjc.toLowerCase()
    }

    const mtable = createMathElement("mtable", attrs, parent)

    element.queryAll("m:mr").forEach(mr => {
        const mtr = createMathElement("mtr", {}, mtable)

        mr.queryAll("m:e").forEach(me => {
            const mtd = createMathElement("mtd", {}, mtr)
            processElement(me, mtd)
        })
    })
}

/**
 * Process a radical element
 * @param {XMLElement} element - The OMML radical element
 * @param {XMLElement} parent - The parent MathML element
 */
function processRadical(element, parent) {
    const degHide = forceFalse(
        getAttr(element, "m:radPr/m:degHide", "m:val") || "false"
    )

    if (degHide) {
        const msqrt = createMathElement("msqrt", {}, parent)
        const e = element.query("m:e")
        if (e) {
            processElement(e, msqrt)
        }
    } else {
        const mroot = createMathElement("mroot", {}, parent)
        const row1 = createMathElement("mrow", {}, mroot)
        const row2 = createMathElement("mrow", {}, mroot)

        const e = element.query("m:e")
        if (e) {
            processElement(e, row1)
        }

        const deg = element.query("m:deg")
        if (deg) {
            processElement(deg, row2)
        }
    }
}

/**
 * Process an n-ary operator element
 * @param {XMLElement} element - The OMML nary element
 * @param {XMLElement} parent - The parent MathML element
 */
function processNary(element, parent) {
    const subHide = forceFalse(
        getAttr(element, "m:naryPr/m:subHide", "m:val") || "false"
    )
    const supHide = forceFalse(
        getAttr(element, "m:naryPr/m:supHide", "m:val") || "false"
    )
    const limLocSubSup =
        (getAttr(element, "m:naryPr/m:limLoc", "m:val") || "").toLowerCase() ===
            "" ||
        (getAttr(element, "m:naryPr/m:limLoc", "m:val") || "").toLowerCase() ===
            "subsup"
    const grow = forceFalse(
        getAttr(element, "m:naryPr/m:grow", "m:val") || "false"
    )

    const mrow = createMathElement("mrow", {}, parent)

    if (supHide && subHide) {
        outputNAryMO(element, mrow, grow)
    } else if (subHide) {
        const outer = createMathElement(
            limLocSubSup ? "msup" : "mover",
            {},
            mrow
        )
        outputNAryMO(element, outer, grow)

        const suprow = createMathElement("mrow", {}, outer)
        const sup = element.query("m:sup")
        if (sup) {
            processElement(sup, suprow)
        }
    } else if (supHide) {
        const outer = createMathElement(
            limLocSubSup ? "msub" : "munder",
            {},
            mrow
        )
        outputNAryMO(element, outer, grow)

        const subrow = createMathElement("mrow", {}, outer)
        const sub = element.query("m:sub")
        if (sub) {
            processElement(sub, subrow)
        }
    } else {
        const outer = createMathElement(
            limLocSubSup ? "msubsup" : "munderover",
            {},
            mrow
        )
        outputNAryMO(element, outer, grow)

        const subrow1 = createMathElement("mrow", {}, outer)
        const sub = element.query("m:sub")
        if (sub) {
            processElement(sub, subrow1)
        }

        const subrow2 = createMathElement("mrow", {}, outer)
        const sup = element.query("m:sup")
        if (sup) {
            processElement(sup, subrow2)
        }
    }

    const erow = createMathElement("mrow", {}, mrow)
    const e = element.query("m:e")
    if (e) {
        processElement(e, erow)
    }
}

/**
 * Process a delimiter element
 * @param {XMLElement} element - The OMML delimiter element
 * @param {XMLElement} parent - The parent MathML element
 */
function processDelimiter(element, parent) {
    const begChr = getAttr(element, "m:dPr/m:begChr", "m:val")
    const endChr = getAttr(element, "m:dPr/m:endChr", "m:val")
    const sepChr = getAttr(element, "m:dPr/m:sepChr", "m:val") || "|"

    const attr = {}
    if (begChr !== undefined && begChr !== "(") {
        attr.open = begChr
    }
    if (endChr !== undefined && endChr !== ")") {
        attr.close = endChr
    }
    if (sepChr !== ",") {
        attr.separators = sepChr
    }

    const mfenced = createMathElement("mfenced", attr, parent)

    element.queryAll("m:e").forEach(me => {
        const row = createMathElement("mrow", {}, mfenced)
        processElement(me, row)
    })
}

/**
 * Process an equation array element
 * @param {XMLElement} element - The OMML eqArr element
 * @param {XMLElement} parent - The parent MathML element
 */
function processEqArr(element, parent) {
    const mtable = createMathElement("mtable", {}, parent)

    element.queryAll("m:e").forEach(me => {
        const mtr = createMathElement("mtr", {}, mtable)
        const mtd = createMathElement("mtd", {}, mtr)

        const scrLvl = getAttr(me, "m:argPr/m:scrLvl", "m:val")
        const outer =
            scrLvl !== "0" && scrLvl
                ? createMathElement("mrow", {}, mtd)
                : createMathElement("mstyle", {scriptlevel: scrLvl}, mtd)

        createMathElement("maligngroup", {}, outer)

        const firstChild = me.children[0]
        if (firstChild) {
            createEqArrRow(outer, element, firstChild, 1)
        }
    })
}

/**
 * Process a function element
 * @param {XMLElement} element - The OMML function element
 * @param {XMLElement} parent - The parent MathML element
 */
function processFunction(element, parent) {
    const outer = createMathElement("mrow", {}, parent)
    const row1 = createMathElement("mrow", {}, outer)

    element.queryAll("m:fName").forEach(fn => {
        processElement(fn, row1)
    })

    const mo = createMathElement("mo", {}, outer)
    mo.textContent = "\u2061" // Function application

    const row2 = createMathElement("mrow", {}, outer)
    const e = element.query("m:e")
    if (e) {
        processElement(e, row2)
    }
}

/**
 * Process an accent element
 * @param {XMLElement} element - The OMML accent element
 * @param {XMLElement} parent - The parent MathML element
 */
function processAccent(element, parent) {
    const mover = createMathElement("mover", {accent: "true"}, parent)
    const row = createMathElement("mrow", {}, mover)

    const e = element.query("m:e")
    if (e) {
        processElement(e, row)
    }

    const acc = (getAttr(element, "m:accPr/m:chr", "m:val") || "\u0302").substr(
        0,
        1
    )
    const nonComb = toNonCombining(acc)

    if (acc.length === 0) {
        createMathElement("mo", {}, mover)
    } else {
        const nor = forceFalse(
            getAttr(element, "m:rPr/m:nor", "m:val") || "false"
        )
        parseMT(element, mover, {
            toParse: nonComb,
            scr: getAttr(element, "m:e/*/m:rPr/m:scr", "m:val"),
            sty: getAttr(element, "m:e/*/m:rPr/m:sty", "m:val"),
            nor
        })
    }
}

/**
 * Process a group character element
 * @param {XMLElement} element - The OMML groupChr element
 * @param {XMLElement} parent - The parent MathML element
 */
function processGroupChar(element, parent) {
    const lastGroupChrPr = element.query("m:groupChrPr")
    if (!lastGroupChrPr) {
        return
    }

    const pos = (getAttr(lastGroupChrPr, "m:pos", "m:val") || "").toLowerCase()
    const vertJc = (
        getAttr(lastGroupChrPr, "m:vertJc", "m:val") || ""
    ).toLowerCase()
    const chr = getAttr(lastGroupChrPr, "m:chr", "m:val") || "\u23DF"

    const mkMrow = parent => {
        const mrow = createMathElement("mrow", {}, parent)
        const e = element.query("m:e")
        if (e) {
            processElement(e, mrow)
        }
        return mrow
    }

    const mkMo = parent => {
        const mo = createMathElement("mo", {}, parent)
        mo.textContent = chr.substr(0, 1)
        return mo
    }

    if (pos === "top") {
        if (vertJc === "bot") {
            const outer = createMathElement("mover", {accent: "false"}, parent)
            mkMrow(outer)
            mkMo(outer)
        } else {
            const outer = createMathElement(
                "munder",
                {accentunder: "false"},
                parent
            )
            mkMo(outer)
            mkMrow(outer)
        }
    } else {
        if (vertJc === "bot") {
            const outer = createMathElement("mover", {accent: "false"}, parent)
            mkMo(outer)
            mkMrow(outer)
        } else {
            const outer = createMathElement(
                "munder",
                {accentunder: "false"},
                parent
            )
            mkMrow(outer)
            mkMo(outer)
        }
    }
}

/**
 * Process a border box element
 * @param {XMLElement} element - The OMML borderBox element
 * @param {XMLElement} parent - The parent MathML element
 */
function processBorderBox(element, parent) {
    const hideTop = forceTrue(
        getAttr(element, "m:borderBoxPr/m:hideTop", "m:val") || "false"
    )
    const hideBot = forceTrue(
        getAttr(element, "m:borderBoxPr/m:hideBot", "m:val") || "false"
    )
    const hideLeft = forceTrue(
        getAttr(element, "m:borderBoxPr/m:hideLeft", "m:val") || "false"
    )
    const hideRight = forceTrue(
        getAttr(element, "m:borderBoxPr/m:hideRight", "m:val") || "false"
    )
    const strikeH = forceTrue(
        getAttr(element, "m:borderBoxPr/m:strikeH", "m:val") || "false"
    )
    const strikeV = forceTrue(
        getAttr(element, "m:borderBoxPr/m:strikeV", "m:val") || "false"
    )
    const strikeBLTR = forceTrue(
        getAttr(element, "m:borderBoxPr/m:strikeBLTR", "m:val") || "false"
    )
    const strikeTLBR = forceTrue(
        getAttr(element, "m:borderBoxPr/m:strikeTLBR", "m:val") || "false"
    )

    let outer

    if (
        hideTop &&
        hideBot &&
        hideLeft &&
        hideRight &&
        !strikeH &&
        !strikeV &&
        !strikeBLTR &&
        !strikeTLBR
    ) {
        outer = createMathElement("mrow", {}, parent)
    } else {
        const notation = createMEnclodeNotation({
            hideTop,
            hideBot,
            hideLeft,
            hideRight,
            strikeH,
            strikeV,
            strikeBLTR,
            strikeTLBR
        })
        outer = createMathElement("menclose", notation, parent)
    }

    const e = element.query("m:e")
    if (e) {
        processElement(e, outer)
    }
}

/**
 * Process a bar element
 * @param {XMLElement} element - The OMML bar element
 * @param {XMLElement} parent - The parent MathML element
 */
function processBar(element, parent) {
    const pos = (getAttr(element, "m:barPr/m:pos", "m:val") || "").toLowerCase()

    if (pos === "top") {
        const outer = createMathElement("mover", {accent: "false"}, parent)
        const row = createMathElement("mrow", {}, outer)
        const mo = createMathElement("mo", {}, outer)

        const e = element.query("m:e")
        if (e) {
            processElement(e, row)
        }

        mo.textContent = "\u00af" // Macron
    } else {
        const outer = createMathElement(
            "munder",
            {underaccent: "false"},
            parent
        )
        const row = createMathElement("mrow", {}, outer)
        const mo = createMathElement("mo", {}, outer)

        const e = element.query("m:e")
        if (e) {
            processElement(e, row)
        }

        mo.textContent = "\u005f" // Underscore
    }
}

/**
 * Process a phantom element
 * @param {XMLElement} element - The OMML phantom element
 * @param {XMLElement} parent - The parent MathML element
 */
function processPhantom(element, parent) {
    const zeroWid = forceFalse(
        getAttr(element, "m:phantPr/m:zeroWid", "m:val") || "false"
    )
    const zeroAsc = forceFalse(
        getAttr(element, "m:phantPr/m:zeroAsc", "m:val") || "false"
    )
    const zeroDesc = forceFalse(
        getAttr(element, "m:phantPr/m:zeroDesc", "m:val") || "false"
    )
    const showVal = forceFalse(
        getAttr(element, "m:phantPr/m:show", "m:val") || "false"
    )

    let container

    if (showVal) {
        container = createMathElement(
            "mpadded",
            createMPaddedAttr({zeroWid, zeroAsc, zeroDesc}),
            parent
        )
    } else if (!zeroWid && !zeroAsc && !zeroDesc) {
        container = createMathElement("mphantom", {}, parent)
    } else {
        const phant = createMathElement("mphantom", {}, parent)
        container = createMathElement(
            "mpadded",
            createMPaddedAttr({zeroWid, zeroAsc, zeroDesc}),
            phant
        )
    }

    const row = createMathElement("mrow", {}, container)
    const e = element.query("m:e")
    if (e) {
        processElement(e, row)
    }
}

/**
 * Process an argument element
 * @param {XMLElement} element - The OMML argument element
 * @param {XMLElement} parent - The parent MathML element
 */
function processArgument(element, parent) {
    const scriptlevel = getAttr(element, "m:argPr/m:scrLvl", "m:val")

    if (!scriptlevel) {
        processChildren(element, parent)
    } else {
        const style = createMathElement("mstyle", {scriptlevel}, parent)
        processChildren(element, style)
    }
}

/**
 * Get attribute value from an element using a simplified XPath-like path
 * @param {XMLElement} element - The element to query
 * @param {string} path - The simplified path to the attribute
 * @param {string} attrName - The attribute name
 * @return {string} The attribute value or empty string
 */
function getAttr(element, path, attrName) {
    if (!element) {
        return ""
    }

    const parts = path.split("/")
    let current = element

    for (let i = 0; i < parts.length; i++) {
        if (!current) {
            return ""
        }

        const part = parts[i]
        if (part.includes("[last()]")) {
            const tagName = part.replace("[last()]", "")
            const elements = current.queryAll(tagName)
            current = elements.length ? elements[elements.length - 1] : null
        } else if (part.includes("[")) {
            const match = part.match(/([^[]+)\[(\d+)\]/)
            if (match) {
                const tagName = match[1]
                const index = parseInt(match[2], 10) - 1
                const elements = current.queryAll(tagName)
                current = elements[index] || null
            } else {
                current = current.query(part) || null
            }
        } else {
            current = current.query(part) || null
        }
    }

    return current ? current.getAttribute(attrName) || "" : ""
}

/**
 * Output a script element, or "none" if not provided
 * @param {XMLElement} parent - The parent element
 * @param {XMLElement} element - The script element to output
 */
function outputScript(parent, element) {
    if (element) {
        const row = createMathElement("mrow", {}, parent)
        processElement(element, row)
    } else {
        createMathElement("none", {}, parent)
    }
}

/**
 * Output an n-ary operator
 * @param {XMLElement} element - The OMML nary element
 * @param {XMLElement} parent - The parent MathML element
 * @param {boolean} grow - Whether the operator should stretch
 */
function outputNAryMO(element, parent, grow = false) {
    const mo = createMathElement(
        "mo",
        {stretchy: grow ? "true" : "false"},
        parent
    )
    const val = getAttr(element, "m:naryPr/m:chr", "m:val")
    mo.textContent = val || "\u222b" // Integral symbol by default
}

/**
 * Create an equation array row
 * @param {XMLElement} parent - The parent MathML element
 * @param {XMLElement} src - The source OMML element
 * @param {XMLElement} cur - The current OMML element
 * @param {number} align - Alignment indicator
 */
function createEqArrRow(parent, src, cur, align) {
    if (!cur) {
        return
    }

    if (cur.tagName === "m:r") {
        const allMt = cur
            .queryAll("m:t")
            .map(t => t.textContent)
            .join("")
        const nor = forceFalse(getAttr(cur, "m:rPr/m:nor", "m:val") || "false")

        parseEqArrMr(parent, {
            toParse: allMt,
            scr: getAttr(cur, "m:rPr/m:scr", "m:val"),
            sty: getAttr(cur, "m:rPr/m:sty", "m:val"),
            nor,
            align
        })
    } else {
        processElement(cur, parent)
    }

    // Get the next sibling if available
    const siblings = cur.parentElement ? cur.parentElement.children : []
    const index = siblings.indexOf(cur)
    const nextSibling = index < siblings.length - 1 ? siblings[index + 1] : null

    if (nextSibling) {
        const allMt = cur
            .queryAll("m:t")
            .map(t => t.textContent)
            .join("")
        const amp = countAmp(allMt)
        createEqArrRow(parent, src, nextSibling, (align + (amp % 2)) % 2)
    }
}

/**
 * Parse equation array run text
 * @param {XMLElement} parent - The parent MathML element
 * @param {Object} options - Parsing options
 */
function parseEqArrMr(parent, {toParse = "", scr, sty, nor, align}) {
    if (!toParse.length) {
        return
    }

    if (toParse[0] === "&") {
        createMathElement(align ? "malignmark" : "maligngroup", {}, parent)
        parseEqArrMr(parent, {
            toParse: toParse.substr(1),
            align: !align,
            scr,
            sty,
            nor
        })
    } else {
        const firstOper = rxIndexOf(toParse, oprx)
        const firstNum = rxIndexOf(toParse, /\d/)
        const startsWithOper = firstOper === 1
        const startsWithNum = firstNum === 1

        if (!startsWithOper && !startsWithNum) {
            if (!nor) {
                const mi = createMathElement(
                    "mi",
                    tokenAttributes({
                        scr,
                        sty,
                        nor,
                        charToPrint: 1,
                        tokenType: "mi"
                    }),
                    parent
                )
                mi.textContent = nbsp(toParse.substr(0, 1))
            } else {
                const mt = createMathElement("mtext", {}, parent)
                mt.textContent = nbsp(toParse.substr(0, 1))
            }
            parseEqArrMr(parent, {
                toParse: toParse.substr(1),
                scr,
                sty,
                nor,
                align
            })
        } else if (startsWithOper) {
            if (!nor) {
                const mo = createMathElement(
                    "mo",
                    tokenAttributes({
                        nor,
                        charToPrint: 1,
                        tokenType: "mo"
                    }),
                    parent
                )
                mo.textContent = toParse.substr(0, 1)
            } else {
                const mt = createMathElement("mtext", {}, parent)
                mt.textContent = toParse.substr(0, 1)
            }
            parseEqArrMr(parent, {
                toParse: toParse.substr(1),
                scr,
                sty,
                nor,
                align
            })
        } else {
            const num = numStart(toParse)
            if (!nor) {
                const mn = createMathElement(
                    "mn",
                    tokenAttributes({
                        sty: "p",
                        nor,
                        charToPrint: 1,
                        tokenType: "mn"
                    }),
                    parent
                )
                mn.textContent = num
            } else {
                const mt = createMathElement("mtext", {}, parent)
                mt.textContent = num
            }
            parseEqArrMr(parent, {
                toParse: toParse.substr(num.length),
                scr,
                sty,
                nor,
                align
            })
        }
    }
}

/**
 * Parse math text
 * @param {XMLElement} ctx - The context OMML element
 * @param {XMLElement} parent - The parent MathML element
 * @param {Object} options - Parsing options
 */
function parseMT(ctx, parent, {toParse = "", scr, sty, nor}) {
    if (!toParse.length) {
        return
    }
    const firstOper = rxIndexOf(toParse, oprx)
    const firstNum = rxIndexOf(toParse, /\d/)
    const startsWithOper = firstOper === 1
    const startsWithNum = firstNum === 1
    if (!startsWithOper && !startsWithNum) {
        let charToPrint = 1
        // Check if we're in a function name
        const inFuncName = ctx.closest("m:fName") !== null
        if (inFuncName) {
            if (!firstOper && !firstNum) {
                charToPrint = toParse.length
            } else {
                charToPrint =
                    Math.min(
                        firstOper || Number.MAX_VALUE,
                        firstNum || Number.MAX_VALUE
                    ) - 1
            }
        }
        const mi = createMathElement(
            "mi",
            tokenAttributes({
                scr,
                sty,
                nor,
                charToPrint,
                tokenType: "mi"
            }),
            parent
        )
        mi.textContent = nbsp(toParse.substr(0, charToPrint))
        parseMT(ctx, parent, {
            toParse: toParse.substr(charToPrint),
            scr,
            sty,
            nor
        })
    } else if (startsWithOper) {
        const mo = createMathElement(
            "mo",
            tokenAttributes({
                nor,
                tokenType: "mo"
            }),
            parent
        )
        mo.textContent = toParse.substr(0, 1)

        parseMT(ctx, parent, {
            toParse: toParse.substr(1),
            scr,
            sty,
            nor
        })
    } else {
        const num = numStart(toParse)
        const mn = createMathElement(
            "mn",
            tokenAttributes({
                scr,
                sty: "p",
                nor,
                tokenType: "mn"
            }),
            parent
        )
        mn.textContent = num

        parseMT(ctx, parent, {
            toParse: toParse.substr(num.length),
            scr,
            sty,
            nor
        })
    }
}

/**
 * Find the index of a regex match in a string
 * @param {string} str - The string to search
 * @param {RegExp} rx - The regex to match
 * @return {number} The match index + 1, or 0 if no match
 */
function rxIndexOf(str, rx) {
    const re = rx.exec(str)
    if (!re) {
        return 0
    }
    return re.index + 1
}

/**
 * Get the start of a number in a string
 * @param {string} str - The string to check
 * @return {string} The number at the start of the string
 */
function numStart(str) {
    if (!str) {
        return ""
    }
    const match = str.match(/^(\d+)/)
    return match ? match[1] : ""
}

/**
 * Count ampersands in a string
 * @param {string} str - The string to check
 * @return {number} The number of ampersands
 */
function countAmp(str) {
    return ((str || "").match(/&/g) || []).length
}

/**
 * Convert a combining character to its non-combining equivalent
 * @param {string} ch - The character to convert
 * @return {string} The non-combining equivalent
 */
function toNonCombining(ch) {
    const combiMap = {
        "\u0306": "\u02D8", // breve
        "\u032e": "\u02D8", // breve below
        "\u0312": "\u00B8", // cedilla
        "\u0327": "\u00B8", // cedilla
        "\u0300": "\u0060", // grave
        "\u0316": "\u0060", // grave below
        "\u0305": "\u002D", // macron/overbar
        "\u0332": "\u002D", // macron/underbar
        "\u0323": "\u002E", // dot below
        "\u0307": "\u02D9", // dot above
        "\u030B": "\u02DD", // double acute
        "\u0317": "\u00B4", // acute below
        "\u0301": "\u00B4", // acute
        "\u0330": "\u007E", // tilde below
        "\u0303": "\u007E", // tilde
        "\u0324": "\u00A8", // diaeresis below
        "\u0308": "\u00A8", // diaeresis
        "\u032C": "\u02C7", // caron below
        "\u030C": "\u02C7", // caron
        "\u0302": "\u005E", // circumflex
        "\u032D": "\u005E", // circumflex below
        "\u20D7": "\u2192", // vector/right arrow
        "\u20EF": "\u2192", // vector/right arrow below
        "\u20D6": "\u2190", // left arrow
        "\u20EE": "\u2190" // left arrow below
    }
    return combiMap[ch] || ch
}

/**
 * Create MathML token attributes based on token settings
 * @param {Object} options - Token options
 * @return {Object} Attribute object
 */
function tokenAttributes({scr, sty, nor, charToPrint = 0, tokenType}) {
    const attr = {}

    if (nor) {
        attr.mathvariant = "normal"
    } else {
        let mathvariant
        const fontweight = sty === "b" || sty === "bi" ? "bold" : "normal"
        const fontstyle = sty === "b" || sty === "p" ? "normal" : "italic"

        if (tokenType !== "mn") {
            if (scr === "monospace") {
                mathvariant = "monospace"
            } else if (scr === "sans-serif" && sty === "i") {
                mathvariant = "sans-serif-italic"
            } else if (scr === "sans-serif" && sty === "b") {
                mathvariant = "bold-sans-serif"
            } else if (scr === "sans-serif" && sty === "bi") {
                mathvariant = "sans-serif-bold-italic"
            } else if (scr === "sans-serif") {
                mathvariant = "sans-serif"
            } else if (scr === "fraktur" && (sty === "b" || sty === "i")) {
                mathvariant = "bold-fraktur"
            } else if (scr === "fraktur") {
                mathvariant = "fraktur"
            } else if (scr === "double-struck") {
                mathvariant = "double-struck"
            } else if (scr === "script" && (sty === "b" || sty === "i")) {
                mathvariant = "bold-script"
            } else if (scr === "script") {
                mathvariant = "script"
            } else if (scr === "roman" || !scr) {
                if (sty === "b") {
                    mathvariant = "bold"
                } else if (sty === "i") {
                    mathvariant = "italic"
                } else if (sty === "p") {
                    mathvariant = "normal"
                } else if (sty === "bi") {
                    mathvariant = "bold-italic"
                }
            }
        }

        if (tokenType === "mo" && mathvariant !== "normal") {
            return attr
        }

        if (
            tokenType === "mi" &&
            charToPrint === 1 &&
            (mathvariant === "italic" || !mathvariant)
        ) {
            return attr
        }

        if (
            tokenType === "mi" &&
            charToPrint > 1 &&
            (mathvariant === "italic" || !mathvariant)
        ) {
            attr.mathvariant = "italic"
        } else if (mathvariant && mathvariant !== "italic") {
            attr.mathvariant = mathvariant
        } else {
            if (
                fontstyle === "italic" &&
                !(tokenType === "mi" && charToPrint === 1)
            ) {
                attr.fontstyle = "italic"
            }
            if (fontweight === "bold") {
                attr.fontweight = "bold"
            }
        }
    }

    return attr
}

/**
 * Create menclose notation attribute value
 * @param {Object} options - Notation options
 * @return {Object} The notation attributes
 */
function createMEnclodeNotation({
    hideTop,
    hideBot,
    hideLeft,
    hideRight,
    strikeH,
    strikeV,
    strikeBLTR,
    strikeTLBR
}) {
    const notation = []

    if (!hideTop && !hideBot && !hideLeft && !hideRight) {
        notation.push("box")
    } else {
        if (!hideTop) {
            notation.push("top")
        }
        if (!hideBot) {
            notation.push("bottom")
        }
        if (!hideLeft) {
            notation.push("left")
        }
        if (!hideRight) {
            notation.push("right")
        }
    }

    if (strikeH) {
        notation.push("horizontalstrike")
    }
    if (strikeV) {
        notation.push("verticalstrike")
    }
    if (strikeBLTR) {
        notation.push("updiagonalstrike")
    }
    if (strikeTLBR) {
        notation.push("downdiagonalstrike")
    }

    return {notation: notation.join(" ")}
}

/**
 * Create mpadded attributes
 * @param {Object} options - Padding options
 * @return {Object} The padding attributes
 */
function createMPaddedAttr({zeroWid, zeroAsc, zeroDesc}) {
    const attr = {}

    if (zeroWid) {
        attr.width = "0in"
    }
    if (zeroAsc) {
        attr.height = "0in"
    }
    if (zeroDesc) {
        attr.depth = "0in"
    }

    return attr
}

/**
 * Get fraction properties
 * @param {string} type - Fraction type
 * @return {Object} Fraction attributes
 */
function getFracProps(type) {
    if (type === "skw" || type === "lin") {
        return {bevelled: "true"}
    }
    if (type === "nobar") {
        return {linethickness: "0pt"}
    }
    return {}
}

/**
 * Replace spaces with non-breaking spaces
 * @param {string} str - The string to process
 * @return {string} String with non-breaking spaces
 */
function nbsp(str) {
    if (!str) {
        return ""
    }
    return str.replace(/\s/g, "\u00a0")
}

/**
 * Parse a boolean value
 * @param {string} str - The string to parse
 * @return {boolean|undefined} The parsed boolean or undefined
 */
function tf(str) {
    if (str == null) {
        return
    }
    str = str.toLowerCase()
    if (str === "on" || str === "1" || str === "true") {
        return true
    }
    if (str === "off" || str === "0" || str === "false") {
        return false
    }
}

/**
 * Force a value to be true unless explicitly false
 * @param {string} str - The string to parse
 * @return {boolean} True unless the string is explicitly false
 */
function forceFalse(str) {
    const res = tf(str)
    if (res === false) {
        return false
    }
    return true
}

/**
 * Force a value to be false unless explicitly true
 * @param {string} str - The string to parse
 * @return {boolean} False unless the string is explicitly true
 */
function forceTrue(str) {
    return tf(str) || false
}
