import deepEqual from "fast-deep-equal"

export function toMiniJSON(node) {
    // Similar to the ProseMirror internal toJSON function,
    // but leaving out attributes that have default values and dealing with
    // attributes that are objects.
    // Adapted from https://github.com/ProseMirror/prosemirror-model/blob/6d970507cd0da48653d3b72f2731a71a144a364b/src/node.js#L340-L351
    const obj = {type: node.type.name}
    for (const attr in node.attrs) {
        if (!deepEqual(node.type.attrs[attr].default, node.attrs[attr])) {
            if (!obj.attrs) {
                obj.attrs = {}
            }
            obj.attrs[attr] = ["string", "number", "boolean"].includes(
                typeof node.attrs[attr]
            )
                ? node.attrs[attr]
                : JSON.parse(JSON.stringify(node.attrs[attr]))
        }
    }
    if (node.content.size) {
        obj.content = node.content.content.map(childNode =>
            toMiniJSON(childNode)
        )
    }

    if (node.marks.length) {
        obj.marks = node.marks.map(mark => toMiniMarkJSON(mark))
    }

    if (node.text) {
        obj.text = node.text
    }

    return obj
}

function toMiniMarkJSON(mark) {
    // Adapted from https://github.com/ProseMirror/prosemirror-model/blob/6d970507cd0da48653d3b72f2731a71a144a364b/src/mark.js#L76-L83
    const obj = {type: mark.type.name}
    for (const attr in mark.attrs) {
        if (!deepEqual(mark.type.attrs[attr].default, mark.attrs[attr])) {
            if (!obj.attrs) {
                obj.attrs = {}
            }
            obj.attrs[attr] = ["string", "number", "boolean"].includes(
                typeof mark.attrs[attr]
            )
                ? mark.attrs[attr]
                : JSON.parse(JSON.stringify(mark.attrs[attr]))
        }
    }
    return obj
}

export function toFullJSON(miniJson, schema) {
    if (!miniJson.type) {
        miniJson.type = "doc"
    }
    return schema.nodeFromJSON(miniJson).toJSON()
}
