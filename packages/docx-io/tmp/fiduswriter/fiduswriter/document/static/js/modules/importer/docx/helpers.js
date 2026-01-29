export const normalizeText = text => {
    if (!text) {
        return ""
    }
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim()
}
