import {post} from "./network"

export const setLanguage = (_config, language) =>
    post("/api/i18n/setlang/", {language}).then(() => {
        // We delete the network cache as this contains the JS
        // translations.
        caches.keys().then(names => {
            for (const name of names) {
                caches.delete(name)
            }
            window.location.reload()
        })
    })

const COLOR_CACHE = {}

const userColor = string => {
    // Source https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
    if (string.length === 0) {
        return "rgb(0,0,0)"
    } else if (COLOR_CACHE[string]) {
        return COLOR_CACHE[string]
    }
    let hash = 0
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash)
        hash = hash & hash
    }
    const rgb = [0, 0, 0]
    for (let i = 0; i < 3; i++) {
        rgb[i] = (hash >> (i * 8)) & 255
    }
    COLOR_CACHE[string] = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    return COLOR_CACHE[string]
}

/** A template for the default round avatar view. */
export const avatarTemplate = ({user}) => {
    const name = user.username || user.name || "A"
    if (user.avatar) {
        return `<img class="fw-avatar" src="${user.avatar}" alt="${name}">`
    } else {
        const color = userColor(name)
        return `<span class="fw-string-avatar" style="background-color: ${color};"><span>${name[0]}</span></span>`
    }
}
