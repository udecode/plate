import {Schema} from "prosemirror-model"
import {marks} from "prosemirror-schema-basic"
import {
    url,
    enquote,
    literal,
    smallcaps,
    sub,
    sup,
    text,
    variable
} from "./common"

const nocase = {
    parseDOM: [{tag: "span.nocase"}],
    toDOM() {
        return ["span", {class: "nocase"}]
    }
}

const doc = {
    content: "literal"
}

export const titleSchema = new Schema({
    nodes: {
        doc,
        literal,
        text,
        variable
    },
    marks: {
        em: marks.em,
        enquote,
        nocase,
        smallcaps,
        strong: marks.strong,
        sup,
        sub,
        url
    }
})
