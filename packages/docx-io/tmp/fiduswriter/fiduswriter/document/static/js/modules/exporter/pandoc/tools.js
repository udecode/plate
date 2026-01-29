export const convertText = text => {
    const textContent = []
    if (!text.length) {
        return []
    }
    const words = text.split(" ")
    words.forEach((c, index) => {
        if (c) {
            textContent.push({
                t: "Str",
                c
            })
        }
        if (index < words.length - 1) {
            textContent.push({
                t: "Space"
            })
        }
    })
    return textContent
}

export const convertContributor = contributor => {
    const contributorContent = []
    if (contributor.firstname || contributor.lastname) {
        const nameParts = []
        if (contributor.lastname) {
            nameParts.push(contributor.lastname)
        }
        if (contributor.firstname) {
            nameParts.push(contributor.firstname)
        }
        contributorContent.push(...convertText(nameParts.join(" ")))
    } else if (contributor.institution) {
        contributorContent.push(...convertText(contributor.institution))
    }
    if (contributor.email) {
        contributorContent.push({
            t: "Note",
            c: [
                {
                    t: "Para",
                    c: convertText(contributor.email)
                }
            ]
        })
    }
    return contributorContent.length
        ? {t: "MetaInlines", c: contributorContent}
        : false
}
