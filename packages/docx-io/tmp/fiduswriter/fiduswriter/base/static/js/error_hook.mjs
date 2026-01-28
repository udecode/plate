import {ErrorHook} from "./modules/error_hook/index.js"

const theErrorHook = new ErrorHook()
theErrorHook.init()
window.theErrorHook = theErrorHook
