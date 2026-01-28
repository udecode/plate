import {Schema} from "prosemirror-model"
import {marks} from "prosemirror-schema-basic"
import {url, enquote, smallcaps, sub, sup, text, variable} from "./common"

const longliteral = {
    content: "inline*",
    marks: "_",
    code: true,
    defining: true,
    parseDOM: [{tag: "pre.long-literal"}],
    toDOM(_node) {
        return [
            "pre",
            {
                class: "long-literal"
            },
            0
        ]
    }
}

const doc = {
    content: "longliteral"
}

export const longLitSchema = new Schema({
    nodes: {
        doc,
        longliteral,
        text,
        variable
    },
    marks: {
        em: marks.em,
        enquote,
        smallcaps,
        strong: marks.strong,
        sup,
        sub,
        url
    }
})
