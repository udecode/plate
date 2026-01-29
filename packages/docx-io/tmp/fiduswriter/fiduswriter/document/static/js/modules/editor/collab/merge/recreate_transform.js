// See https://gitlab.com/mpapp-public/prosemirror-recreate-steps/blob/master/src/recreate.js
// We only need this file from the prosemirror-recreate-steps (apache) project, so it's copied
// in here.

import {diffChars, diffWordsWithSpace} from "diff"
import {ReplaceStep, Transform} from "prosemirror-transform"
import {applyPatch, createPatch} from "rfc6902"

function getReplaceStep(fromDoc, toDoc) {
    let start = toDoc.content.findDiffStart(fromDoc.content)
    if (start === null) {
        return false
    }
    let {a: endA, b: endB} = toDoc.content.findDiffEnd(fromDoc.content)
    const overlap = start - Math.min(endA, endB)
    if (overlap > 0) {
        if (
            // If there is an overlap, there is some freedom of choise in how to calculate the start/end boundary.
            // for an inserted/removed slice. We choose the extreme with the lowest depth value.
            fromDoc.resolve(start - overlap).depth <
            toDoc.resolve(endA + overlap).depth
        ) {
            start -= overlap
        } else {
            endA += overlap
            endB += overlap
        }
    }
    return new ReplaceStep(start, endB, toDoc.slice(start, endA))
}

class RecreateTransform {
    constructor(fromDoc, toDoc, complexSteps, wordDiffs) {
        this.fromDoc = fromDoc
        this.toDoc = toDoc
        this.complexSteps = complexSteps // Whether to return steps other than ReplaceSteps
        this.wordDiffs = wordDiffs // Whether to make text diffs cover entire words
        this.schema = fromDoc.type.schema
        this.tr = new Transform(fromDoc)
    }

    init() {
        if (this.complexSteps) {
            // For First steps: we create versions of the documents without marks as
            // these will only confuse the diffing mechanism and marks won't cause
            // any mapping changes anyway.
            this.currentJSON = this.marklessDoc(this.fromDoc).toJSON()
            this.finalJSON = this.marklessDoc(this.toDoc).toJSON()
            this.ops = createPatch(this.currentJSON, this.finalJSON)
            this.recreateChangeContentSteps()
            this.recreateChangeMarkSteps()
        } else {
            // We don't differentiate between mark changes and other changes.
            this.currentJSON = this.fromDoc.toJSON()
            this.finalJSON = this.toDoc.toJSON()
            this.ops = createPatch(this.currentJSON, this.finalJSON)
            this.recreateChangeContentSteps()
        }

        this.simplifyTr()

        return this.tr
    }

    recreateChangeContentSteps() {
        // First step: find content changing steps.
        let ops = [],
            afterStepJSON = JSON.parse(JSON.stringify(this.currentJSON))
        while (this.ops.length) {
            let op = this.ops.shift(),
                toDoc = false
            const pathParts = op.path.split("/")
            ops.push(op)
            while (!toDoc) {
                applyPatch(afterStepJSON, [op])
                try {
                    toDoc = this.schema.nodeFromJSON(afterStepJSON)
                    toDoc.check()
                } catch (error) {
                    toDoc = false
                    if (this.ops.length) {
                        op = this.ops.shift()
                        ops.push(op)
                    } else {
                        throw error
                    }
                }
            }

            if (
                this.complexSteps &&
                ops.length === 1 &&
                (pathParts.includes("attrs") || pathParts.includes("type"))
            ) {
                // Node markup is changing
                this.addSetNodeMarkup()
                ops = []
                afterStepJSON = JSON.parse(JSON.stringify(this.currentJSON))
            } else if (
                ops.length === 1 &&
                op.op === "replace" &&
                pathParts[pathParts.length - 1] === "text"
            ) {
                // Text is being replaced, we apply text diffing to find the smallest possible diffs.
                this.addReplaceTextSteps(op, afterStepJSON)
                ops = []
                afterStepJSON = JSON.parse(JSON.stringify(this.currentJSON))
            } else {
                if (this.addReplaceStep(toDoc, afterStepJSON)) {
                    ops = []
                    afterStepJSON = JSON.parse(JSON.stringify(this.currentJSON))
                }
            }
        }
    }

    recreateChangeMarkSteps() {
        // Now the documents should be the same, except their marks, so everything should map 1:1.
        // Second step: Iterate through the toDoc and make sure all marks are the same in tr.doc
        this.toDoc.descendants((tNode, tPos) => {
            if (!tNode.isInline) {
                return true
            }

            this.tr.doc.nodesBetween(
                tPos,
                tPos + tNode.nodeSize,
                (fNode, fPos) => {
                    if (!fNode.isInline) {
                        return true
                    }
                    const from = Math.max(tPos, fPos),
                        to = Math.min(
                            tPos + tNode.nodeSize,
                            fPos + fNode.nodeSize
                        )
                    fNode.marks.forEach(nodeMark => {
                        if (!nodeMark.isInSet(tNode.marks)) {
                            this.tr.removeMark(from, to, nodeMark)
                        }
                    })
                    tNode.marks.forEach(nodeMark => {
                        if (!nodeMark.isInSet(fNode.marks)) {
                            this.tr.addMark(from, to, nodeMark)
                        }
                    })
                }
            )
        })
    }

    marklessDoc(doc) {
        const tr = new Transform(doc)
        tr.removeMark(0, doc.nodeSize - 2)
        return tr.doc
    }

    // From http://prosemirror.net/examples/footnote/
    addReplaceStep(toDoc, afterStepJSON) {
        const fromDoc = this.schema.nodeFromJSON(this.currentJSON),
            step = getReplaceStep(fromDoc, toDoc)
        if (!step) {
            return false
        } else if (!this.tr.maybeStep(step).failed) {
            this.currentJSON = afterStepJSON
            return true
        } else {
            throw new Error("No valid step found.")
        }
    }

    addSetNodeMarkup() {
        const fromDoc = this.schema.nodeFromJSON(this.currentJSON),
            toDoc = this.schema.nodeFromJSON(this.finalJSON)
        let updatedSettings = false
        Object.entries(fromDoc.attrs).forEach(([key, value]) => {
            if (toDoc.attrs[key] !== value) {
                this.tr.setDocAttribute(key, toDoc.attrs[key])
                updatedSettings = true
            }
        })
        if (updatedSettings) {
            this.currentJSON = this.marklessDoc(this.tr.doc).toJSON()
            this.ops = createPatch(this.currentJSON, this.finalJSON)
        }
        const start = toDoc.content.findDiffStart(fromDoc.content)
        if (start !== null) {
            const fromNode = fromDoc.nodeAt(start),
                toNode = toDoc.nodeAt(start)
            try {
                this.tr.setNodeMarkup(
                    start,
                    fromNode.type === toNode.type ? null : toNode.type,
                    toNode.attrs,
                    toNode.marks
                )
            } catch (_error) {
                return
            }
            this.currentJSON = this.marklessDoc(this.tr.doc).toJSON()
            // Setting the node markup may have invalidated more ops, so we calculate them again.
            this.ops = createPatch(this.currentJSON, this.finalJSON)
        }
    }

    addReplaceTextSteps(op, afterStepJSON) {
        // We find the position number of the first character in the string
        const op1 = Object.assign({}, op, {value: "xx"}),
            op2 = Object.assign({}, op, {value: "yy"})

        const afterOP1JSON = JSON.parse(JSON.stringify(this.currentJSON)),
            afterOP2JSON = JSON.parse(JSON.stringify(this.currentJSON)),
            pathParts = op.path.split("/")

        let obj = this.currentJSON

        applyPatch(afterOP1JSON, [op1])
        applyPatch(afterOP2JSON, [op2])

        const op1Doc = this.schema.nodeFromJSON(afterOP1JSON),
            op2Doc = this.schema.nodeFromJSON(afterOP2JSON)

        let offset = op1Doc.content.findDiffStart(op2Doc.content)
        const marks = op1Doc.resolve(offset + 1).marks()

        pathParts.shift()

        while (pathParts.length) {
            const pathPart = pathParts.shift()
            obj = obj[pathPart]
        }

        const finalText = op.value,
            currentText = obj

        const textDiffs = this.wordDiffs
            ? diffWordsWithSpace(currentText, finalText)
            : diffChars(currentText, finalText)

        while (textDiffs.length) {
            const diff = textDiffs.shift()
            if (diff.added) {
                if (textDiffs[0]?.removed) {
                    const nextDiff = textDiffs.shift()
                    this.tr.replaceWith(
                        offset,
                        offset + nextDiff.value.length,
                        this.schema
                            .nodeFromJSON({type: "text", text: diff.value})
                            .mark(marks)
                    )
                } else {
                    this.tr.insert(
                        offset,
                        this.schema
                            .nodeFromJSON({type: "text", text: diff.value})
                            .mark(marks)
                    )
                }
                offset += diff.value.length
            } else if (diff.removed) {
                if (textDiffs[0]?.added) {
                    const nextDiff = textDiffs.shift()
                    this.tr.replaceWith(
                        offset,
                        offset + diff.value.length,
                        this.schema
                            .nodeFromJSON({type: "text", text: nextDiff.value})
                            .mark(marks)
                    )
                    offset += nextDiff.value.length
                } else {
                    this.tr.delete(offset, offset + diff.value.length)
                }
            } else {
                offset += diff.value.length
            }
        }
        this.currentJSON = afterStepJSON
    }

    // join adjacent ReplaceSteps
    simplifyTr() {
        if (!this.tr.steps.length) {
            return
        }

        const newTr = new Transform(this.tr.docs[0]),
            oldSteps = this.tr.steps.slice()
        while (oldSteps.length) {
            let step = oldSteps.shift()
            while (oldSteps.length && step.merge(oldSteps[0])) {
                const addedStep = oldSteps.shift()
                if (
                    step instanceof ReplaceStep &&
                    addedStep instanceof ReplaceStep
                ) {
                    step =
                        getReplaceStep(
                            newTr.doc,
                            addedStep.apply(step.apply(newTr.doc).doc).doc
                        ) || step.merge(addedStep)
                } else {
                    step = step.merge(addedStep)
                }
            }
            newTr.step(step)
        }
        this.tr = newTr
    }
}

export function recreateTransform(
    fromDoc,
    toDoc,
    complexSteps = true,
    wordDiffs = true
) {
    const recreator = new RecreateTransform(
        fromDoc,
        toDoc,
        complexSteps,
        wordDiffs
    )
    return recreator.init()
}
