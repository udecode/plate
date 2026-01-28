import {recreateTransform} from "../../modules/editor/collab/merge/recreate_transform"

import {adjustDocToTemplate} from "../../modules/document_template/fix_doc"

import {Schema} from "prosemirror-model"

export class AdjustDocToTemplateWorker {
    constructor(schemaSpec, doc, template, documentStyleSlugs, sendMessage) {
        this.schema = new Schema(schemaSpec)
        this.doc = doc
        this.template = template
        this.documentStyleSlugs = documentStyleSlugs
        this.sendMessage = sendMessage
    }

    init() {
        const stateDoc = this.schema.nodeFromJSON(this.doc)
        const newStateDoc = this.schema.nodeFromJSON(
            adjustDocToTemplate(
                this.doc,
                this.template,
                this.documentStyleSlugs,
                this.schema
            )
        )
        const transform = recreateTransform(stateDoc, newStateDoc)
        const steps = []
        transform.steps.forEach(step => steps.push(step.toJSON()))
        // To test replace last line with:
        // setTimeout(() => this.sendMessage({type: 'result', steps}), 100000)
        this.sendMessage({type: "result", steps})
    }
}
