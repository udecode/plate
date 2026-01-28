import {SchemaExport} from "./modules/schema/export.js"

const theSchemaExporter = new SchemaExport()

// We log to console to output to file through management command.
console.log(theSchemaExporter.init())
