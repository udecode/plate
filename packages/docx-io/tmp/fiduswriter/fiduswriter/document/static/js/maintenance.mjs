import {DocMaintenance} from "./modules/maintenance/index.js"

const theMaintainer = new DocMaintenance()

theMaintainer.init()

window.theMaintainer = theMaintainer
