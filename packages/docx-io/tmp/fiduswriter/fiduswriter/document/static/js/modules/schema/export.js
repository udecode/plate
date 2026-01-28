import * as plugins from "../../plugins/schema_export"
import {docSchema} from "./document"

export class SchemaExport {
    constructor() {
        this.schema = docSchema
    }

    init() {
        this.activateFidusPlugins()
        const spec = {
            nodes: {},
            marks: {}
        }
        this.schema.spec.nodes.forEach(
            (key, value) => (spec.nodes[key] = value)
        )
        this.schema.spec.marks.forEach(
            (key, value) => (spec.marks[key] = value)
        )
        return JSON.stringify(spec)
    }

    activateFidusPlugins() {
        // Add plugins.
        this.plugins = {}

        Object.keys(plugins).forEach(plugin => {
            if (typeof plugins[plugin] === "function") {
                this.plugins[plugin] = new plugins[plugin](this)
                this.plugins[plugin].init()
            }
        })
    }
}
