export function parseTracks(str) {
    if (!str) {
        return []
    }
    let tracks
    try {
        tracks = JSON.parse(str)
    } catch (_error) {
        return []
    }
    if (!Array.isArray(tracks)) {
        return []
    }
    return tracks.filter(
        (
            track // ensure required fields are present
        ) =>
            track.hasOwnProperty("user") &&
            track.hasOwnProperty("username") &&
            track.hasOwnProperty("date")
    )
}

export function addTracks(node, attrs) {
    if (node.attrs.track?.length) {
        attrs["data-track"] = JSON.stringify(node.attrs.track)
    }
}

export const deletion = {
    attrs: {
        user: {
            default: 0
        },
        username: {
            default: ""
        },
        date: {
            default: 0
        }
    },
    inclusive: false,
    group: "track",
    parseDOM: [
        {
            tag: "span.deletion",
            getAttrs(dom) {
                return {
                    user: Number.parseInt(dom.dataset.user),
                    username: dom.dataset.username,
                    date: Number.parseInt(dom.dataset.date)
                }
            }
        }
    ],
    toDOM(node) {
        return [
            "span",
            {
                class: `deletion user-${node.attrs.user}`,
                "data-user": node.attrs.user,
                "data-username": node.attrs.username,
                "data-date": node.attrs.date
            }
        ]
    }
}

function parseFormatList(str) {
    if (!str) {
        return []
    }
    let formatList
    try {
        formatList = JSON.parse(str)
    } catch (_error) {
        return []
    }
    if (!Array.isArray(formatList)) {
        return []
    }
    return formatList.filter(format => typeof format === "string") // ensure there are only strings in list
}

export const format_change = {
    attrs: {
        user: {
            default: 0
        },
        username: {
            default: ""
        },
        date: {
            default: 0
        },
        before: {
            default: []
        },
        after: {
            default: []
        }
    },
    inclusive: false,
    group: "track",
    parseDOM: [
        {
            tag: "span.format-change",
            getAttrs(dom) {
                return {
                    user: Number.parseInt(dom.dataset.user),
                    username: dom.dataset.username,
                    date: Number.parseInt(dom.dataset.date),
                    before: parseFormatList(dom.dataset.before),
                    after: parseFormatList(dom.dataset.after)
                }
            }
        }
    ],
    toDOM(node) {
        return [
            "span",
            {
                class: `format-change user-${node.attrs.user}`,
                "data-user": node.attrs.user,
                "data-username": node.attrs.username,
                "data-date": node.attrs.date,
                "data-before": JSON.stringify(node.attrs.before),
                "data-after": JSON.stringify(node.attrs.after)
            }
        ]
    }
}

export const insertion = {
    attrs: {
        user: {
            default: 0
        },
        username: {
            default: ""
        },
        date: {
            default: 0
        },
        approved: {
            default: true
        }
    },
    inclusive: false,
    group: "track",
    parseDOM: [
        {
            tag: "span.insertion",
            getAttrs(dom) {
                return {
                    user: Number.parseInt(dom.dataset.user),
                    username: dom.dataset.username,
                    date: Number.parseInt(dom.dataset.date),
                    inline: true,
                    approved: false
                }
            }
        },
        {
            tag: "span.approved-insertion",
            getAttrs(dom) {
                return {
                    user: Number.parseInt(dom.dataset.user),
                    username: dom.dataset.username,
                    date: Number.parseInt(dom.dataset.date),
                    inline: true,
                    approved: true
                }
            }
        }
    ],
    toDOM(node) {
        return [
            "span",
            {
                class: node.attrs.approved
                    ? "approved-insertion"
                    : `insertion user-${node.attrs.user}`,
                "data-user": node.attrs.user,
                "data-username": node.attrs.username,
                "data-date": node.attrs.date
            }
        ]
    }
}
