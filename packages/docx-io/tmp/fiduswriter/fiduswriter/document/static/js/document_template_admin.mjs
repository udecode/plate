import {DocumentTemplateAdmin} from "./modules/document_template/index.js"

const theDocumentTemplateAdmin = new DocumentTemplateAdmin()

theDocumentTemplateAdmin.init()

window.theDocumentTemplateAdmin = theDocumentTemplateAdmin
