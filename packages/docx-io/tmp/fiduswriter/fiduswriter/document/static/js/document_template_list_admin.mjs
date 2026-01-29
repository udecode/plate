import {DocumentTemplateListAdmin} from "./modules/document_template/index.js"

const theDocumentTemplateListAdmin = new DocumentTemplateListAdmin()

theDocumentTemplateListAdmin.init()

window.theDocumentTemplateListAdmin = theDocumentTemplateListAdmin
