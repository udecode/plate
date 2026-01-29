import OrderedMap from "orderedmap"
import {Schema} from "prosemirror-model"
import {marks, nodes} from "prosemirror-schema-basic"
import {
    anchor,
    annotation_tag,
    blockquote,
    bullet_list,
    citation,
    comment,
    cross_reference,
    deletion,
    equation,
    figure,
    figure_caption,
    figure_equation,
    format_change,
    heading1,
    heading2,
    heading3,
    heading4,
    heading5,
    heading6,
    horizontal_rule,
    image,
    insertion,
    link,
    list_item,
    ordered_list,
    paragraph,
    table,
    table_body,
    table_caption,
    table_cell,
    table_header,
    table_row,
    underline
} from "../common"
import {code_block, contributor, footnote, tag} from "./content"
import {
    contributors_part,
    doc,
    heading_part,
    richtext_part,
    separator_part,
    table_of_contents,
    table_part,
    tags_part,
    title
} from "./structure"

const specNodes = OrderedMap.from({
    doc,
    richtext_part,
    heading_part,
    contributors_part,
    tags_part,
    table_part,
    table_of_contents,
    separator_part,
    title,
    contributor,
    tag,
    paragraph,
    blockquote,
    horizontal_rule,
    figure,
    image,
    figure_equation,
    figure_caption,
    heading1,
    heading2,
    heading3,
    heading4,
    heading5,
    heading6,
    code_block,
    text: nodes.text,
    hard_break: nodes.hard_break,
    citation,
    equation,
    cross_reference,
    footnote,
    ordered_list,
    bullet_list,
    list_item,
    table,
    table_caption,
    table_body,
    table_row,
    table_cell,
    table_header
})

const spec = {
    nodes: specNodes,
    marks: OrderedMap.from({
        em: marks.em,
        strong: marks.strong,
        link,
        underline,
        comment,
        annotation_tag,
        anchor,
        deletion,
        insertion,
        format_change
    })
}

export const docSchema = new Schema(spec)
