export const createSlug = str => {
    if (str === "") {
        str = gettext("Untitled")
    }
    str = str.replace(/[^a-zA-Z0-9\s]/g, "")
    str = str.toLowerCase()
    str = str.replace(/\s/g, "-")
    return str
}
