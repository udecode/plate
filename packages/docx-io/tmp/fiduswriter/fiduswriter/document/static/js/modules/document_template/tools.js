import {randomHeadingId} from "../schema/common"

// from https://codeburst.io/throttling-and-debouncing-in-javascript-646d076d0a44
export function debounced(delay, fn) {
    let timerId
    return (...args) => {
        if (timerId) {
            clearTimeout(timerId)
        }
        timerId = setTimeout(() => {
            fn(...args)
            timerId = null
        }, delay)
    }
}

export function noTrack(node) {
    if (node.attrs?.track) {
        delete node.attrs.track
        if (!Object.keys(node.attrs).length) {
            delete node.attrs
        }
    }
    if (node.content) {
        node.content.forEach(child => noTrack(child))
    }
    return node
}

export function addHeadingIds(oldState, newState, editors) {
    const newHeadings = [],
        usedHeadingIds = []

    editors.forEach(([_el, view]) => {
        if (view.state === oldState) {
            return
        }
        view.state.doc.descendants(node => {
            if (node.type.groups.includes("heading")) {
                usedHeadingIds.push(node.attrs.id)
            }
        })
    })
    newState.doc.descendants((node, pos) => {
        if (node.type.groups.includes("heading")) {
            if (
                node.attrs.id === false ||
                usedHeadingIds.includes(node.attrs.id)
            ) {
                newHeadings.push({pos, node})
            } else {
                usedHeadingIds.push(node.attrs.id)
            }
        }
    })
    if (!newHeadings.length) {
        return null
    }
    const newTr = newState.tr
    newHeadings.forEach(newHeading => {
        let id
        while (!id || usedHeadingIds.includes(id)) {
            id = randomHeadingId()
        }
        usedHeadingIds.push(id)
        newTr.setNodeMarkup(
            newHeading.pos,
            null,
            Object.assign({}, newHeading.node.attrs, {id})
        )
    })
    return newTr
}
