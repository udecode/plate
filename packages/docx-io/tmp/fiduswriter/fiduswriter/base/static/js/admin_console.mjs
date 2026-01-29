import {AdminConsole} from "./modules/admin_console/index.js"

const theAdminConsole = new AdminConsole()

theAdminConsole.init()

window.theAdminConsole = theAdminConsole
