export const isActivationEvent = event => {
    if (event.type === "click") {
        return true
    }
    if (event.type === "keydown") {
        return event.key === "Enter" || event.key === " "
    }
    return false
}
