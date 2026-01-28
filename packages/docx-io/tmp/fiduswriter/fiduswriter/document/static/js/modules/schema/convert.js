/* To convert to and from how the document is stored in the database to how ProseMirror expects it.
 We use the DOM import for ProseMirror as the JSON we store in the database is really jsonized HTML.
*/
import deepEqual from "fast-deep-equal"
import {
    randomFigureId,
    randomHeadingId,
    randomListId,
    randomTableId
} from "./common"

export const getSettings = pmDoc => {
    const settings = JSON.parse(JSON.stringify(pmDoc.attrs))
    return settings
}

export const updateDoc = (doc, docVersion, bibliography = false) => {
    /* This is to clean documents taking all the accepted formatting from older
       versions and outputting the current version of the doc format.
       Notice that the docVersion isn't the same as the version of the FW export
       file in Fidus Writer < 3.2 (docVersion/FW file versions versions -1.X).
       While the FW file version also says something about what files could be
       available inside the FW zip, the doc_version refers to how the data is
       stored in those files.
       In general, an update to the doc_version will likely also trigger an
       update to the version of the FW export file, the reverse is not always
       true.
    */

    switch (docVersion) {
        // Import from versions up to 3.0 no longer supported starting with Fidus Writer 3.5
        case 1: // Fidus Writer 3.1 prerelease
            doc = convertDocV1(doc)
            doc = convertDocV11(doc)
            doc = convertDocV12(doc)
            doc = convertDocV13(doc, bibliography)
            doc = convertDocV20(doc)
            doc = convertDocV21(doc)
            doc = convertDocV22(doc)
            doc = convertDocV23(doc)
            doc = convertDocV30(doc)
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 1.1: // Fidus Writer 3.1
            doc = convertDocV11(doc)
            doc = convertDocV12(doc)
            doc = convertDocV13(doc, bibliography)
            doc = convertDocV20(doc)
            doc = convertDocV21(doc)
            doc = convertDocV22(doc)
            doc = convertDocV23(doc)
            doc = convertDocV30(doc)
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 1.2: // Fidus Writer 3.2
            doc = convertDocV12(doc)
            doc = convertDocV13(doc, bibliography)
            doc = convertDocV20(doc)
            doc = convertDocV21(doc)
            doc = convertDocV22(doc)
            doc = convertDocV23(doc)
            doc = convertDocV30(doc)
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 1.3: // Fidus Writer 3.3 prerelease
            doc = convertDocV13(doc, bibliography)
            doc = convertDocV20(doc)
            doc = convertDocV21(doc)
            doc = convertDocV22(doc)
            doc = convertDocV23(doc)
            doc = convertDocV30(doc)
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 2.0: // Fidus Writer 3.3
            doc = convertDocV20(doc)
            doc = convertDocV21(doc)
            doc = convertDocV22(doc)
            doc = convertDocV23(doc)
            doc = convertDocV30(doc)
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 2.1: // Fidus Writer 3.4
            doc = convertDocV21(doc)
            doc = convertDocV22(doc)
            doc = convertDocV23(doc)
            doc = convertDocV30(doc)
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 2.2: // Fidus Writer 3.5.7
            doc = convertDocV22(doc)
            doc = convertDocV23(doc)
            doc = convertDocV30(doc)
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 2.3: // Fidus Writer 3.5.10
            doc = convertDocV23(doc)
            doc = convertDocV30(doc)
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 3.0: // Fidus Writer 3.6
            doc = convertDocV30(doc)
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 3.1: // Fidus Writer 3.7
            doc = convertDocV31(doc)
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 3.2: // Fidus Writer 3.8
            doc = convertDocV32(doc)
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 3.3: // Fidus Writer 3.9
            doc = convertDocV33(doc)
            doc = convertDocV34(doc)
            break
        case 3.4: // Fidus Writer 3.10
            doc = convertDocV34(doc)
            break
        case 3.5: // Fidus Writer 3.12
            break
    }
    return doc
}

const convertDocV1 = doc => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    convertNodeV1(returnDoc.content)
    return returnDoc
}

const convertNodeV1 = node => {
    let prefixes, locators, ids, references
    switch (node.type) {
        case "citation":
            prefixes = node.attrs.bibBefore
                ? node.attrs.bibBefore.split(",,,")
                : []
            locators = node.attrs.bibPage ? node.attrs.bibPage.split(",,,") : []
            ids = node.attrs.bibEntry ? node.attrs.bibEntry.split(",") : []
            references = ids.map((id, index) => {
                const returnObj = {id: Number.parseInt(id)}
                if (prefixes[index] !== "") {
                    returnObj["prefix"] = prefixes[index]
                }
                if (locators[index] !== "") {
                    returnObj["locator"] = locators[index]
                }
                return returnObj
            })
            node.attrs = {
                format: node.attrs.bibFormat,
                references
            }
            break
        case "footnote":
            if (node.attrs?.footnote) {
                node.attrs.footnote.forEach(childNode => {
                    convertNodeV1(childNode)
                })
            }
            break
    }
    if (node.content) {
        node.content.forEach(childNode => {
            convertNodeV1(childNode)
        })
    }
}

const convertDocV11 = doc => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    convertNodeV11(returnDoc.content)
    return returnDoc
}

const convertNodeV11 = (node, ids = []) => {
    let blockId
    switch (node.type) {
        case "heading":
            blockId = node.attrs.id
            while (!blockId || ids.includes(blockId)) {
                blockId = randomHeadingId()
            }
            node.attrs.id = blockId
            ids.push(blockId)
            break
    }
    if (node.content) {
        node.content.forEach(childNode => {
            convertNodeV11(childNode, ids)
        })
    }
}

const convertDocV12 = doc => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    convertNodeV12(returnDoc.content)
    return returnDoc
}

const convertNodeV12 = (node, ids = []) => {
    let blockId
    switch (node.type) {
        case "figure":
            blockId = node.attrs.id
            while (!blockId || ids.includes(blockId)) {
                blockId = randomFigureId()
            }
            node.attrs.id = blockId
            ids.push(blockId)
            break
    }
    if (node.content) {
        node.content.forEach(childNode => {
            convertNodeV12(childNode, ids)
        })
    }
}

const convertDocV13 = (doc, bibliography) => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    delete returnDoc.settings
    delete returnDoc.metadata
    returnDoc.bibliography = {}
    returnDoc.imageIds = []
    convertNodeV13(
        returnDoc.content,
        returnDoc.bibliography,
        bibliography,
        returnDoc.imageIds
    )
    return returnDoc
}

const convertNodeV13 = (node, shrunkBib, fullBib, imageIds) => {
    let authorsText, keywordsText
    switch (node.type) {
        case "article":
            node.attrs.language = "en-US"
            break
        case "authors":
            authorsText = node.content
                ? node.content.reduce(
                      (text, item) =>
                          item.type === "text" ? text + item.text : text,
                      ""
                  )
                : ""
            node.content = authorsText
                .split(/[,;]/g)
                .map(authorString => {
                    const author = authorString.trim()
                    if (!author.length) {
                        return false
                    }
                    const authorParts = author.split(" ")
                    return {
                        type: "author",
                        attrs: {
                            firstname:
                                authorParts.length > 1
                                    ? authorParts.shift()
                                    : false,
                            lastname: authorParts.join(" "),
                            institution: false,
                            email: false
                        }
                    }
                })
                .filter(authorObj => authorObj)
            if (!node.content.length) {
                delete node.content
            }
            break
        case "citation":
            node.attrs.references.forEach(ref => {
                let item = fullBib[ref.id]
                if (!item) {
                    item = {
                        fields: {title: [{type: "text", text: "Deleted"}]},
                        bib_type: "misc",
                        entry_key: "FidusWriter"
                    }
                }
                item = Object.assign({}, item)
                delete item.cats
                shrunkBib[ref.id] = item
            })
            break
        case "keywords":
            keywordsText = node.content
                ? node.content.reduce(
                      (text, item) =>
                          item.type === "text" ? text + item.text : text,
                      ""
                  )
                : ""
            node.content = keywordsText
                .split(/[,;]/g)
                .map(keywordString => {
                    const keyword = keywordString.trim()
                    if (!keyword.length) {
                        return false
                    }
                    return {
                        type: "keyword",
                        attrs: {
                            keyword
                        }
                    }
                })
                .filter(keywordObj => keywordObj)
            if (!node.content.length) {
                delete node.content
            }
            break
        case "figure":
            if (isNaN(Number.parseInt(node.attrs.image))) {
                node.attrs.image = false
            } else {
                imageIds.push(Number.parseInt(node.attrs.image))
            }
            break
    }
    if (node.content) {
        node.content.forEach(childNode => {
            convertNodeV13(childNode, shrunkBib, fullBib, imageIds)
        })
    }
}

const convertDocV20 = doc => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    delete returnDoc.added
    delete returnDoc.is_owner
    delete returnDoc.revisions
    delete returnDoc.rights
    delete returnDoc.updated
    if (returnDoc.content.attrs) {
        returnDoc.content.attrs.tracked = false
    }
    Object.values(returnDoc.comments).forEach(comment => {
        comment.username = comment.userName
        comment.isMajor = comment["review:isMajor"]
        delete comment.userAvatar
        delete comment.userName
        delete comment["review:isMajor"]
        if (comment.answers) {
            comment.answers.forEach(answer => {
                answer.username = answer.userName
                delete answer.userAvatar
                delete answer.userName
            })
        }
    })
    return returnDoc
}

const convertNodeV21 = node => {
    let commentMark
    if (
        node.marks &&
        (commentMark = node.marks.find(mark => mark.type === "comment"))
    ) {
        commentMark.attrs.id = String(commentMark.attrs.id)
    }
    if (node.content) {
        node.content.forEach(childNode => convertNodeV21(childNode))
    }
}

const convertDocV21 = doc => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    convertNodeV21(returnDoc.content)
    Object.entries(returnDoc.comment).forEach(([commentId, comment]) => {
        delete comment.id
        comment.assignedUser = false
        comment.assignedUsername = false
        comment.resolved = false
        comment.comment = comment.comment.split("\n").map(text => ({
            type: "paragraph",
            content: [{type: "text", text}]
        }))
        if (comment.answers) {
            comment.answers.forEach(answer => {
                answer.id = answer.answerId
                    ? String(answer.answerId)
                    : answer.id && String(answer.id) !== String(commentId)
                      ? String(answer.id)
                      : String(Math.floor(Math.random() * 0xffffffff))
                delete answer.answerId
                answer.answer = answer.answer.split("\n").map(text => ({
                    type: "paragraph",
                    content: [{type: "text", text}]
                }))
            })
        }
    })
    return returnDoc
}

const convertNodeV22 = (node, imageIds) => {
    switch (node.type) {
        case "figure":
            if (!isNaN(Number.parseInt(node.attrs.image))) {
                imageIds.push(Number.parseInt(node.attrs.image))
            }
            break
        default:
            break
    }
    if (node.content) {
        const deleteChildren = []
        node.content.forEach(childNode => {
            if (childNode.type === "text" && !childNode.text.length) {
                deleteChildren.push(childNode)
            } else {
                convertNodeV22(childNode, imageIds)
            }
        })
        node.content = node.content.filter(
            childNode => !deleteChildren.includes(childNode)
        )
    }
}

const convertDocV22 = doc => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    returnDoc.imageIds = []
    convertNodeV22(returnDoc.content, returnDoc.imageIds)
    Object.entries(returnDoc.comment).forEach(([_commentId, comment]) => {
        comment.comment.forEach(commentNode =>
            convertNodeV22(commentNode, returnDoc.imageIds)
        )
        if (comment.answers) {
            comment.answers.forEach(answer => {
                answer.answer.forEach(answerNode =>
                    convertNodeV22(answerNode, returnDoc.imageIds)
                )
            })
        }
    })
    return returnDoc
}

const v23ExtraAttrs = {
    languages: [
        "af-ZA",
        "sq-AL",
        "ar",
        "ast",
        "be",
        "br",
        "bg",
        "ca",
        "ca-ES-Valencia",
        "zh-CN",
        "da",
        "nl",
        "en-AU",
        "en-CA",
        "en-NZ",
        "en-ZA",
        "en-GB",
        "en-US",
        "eo",
        "fr",
        "gl",
        "de-DE",
        "de-AU",
        "de-CH",
        "el",
        "he",
        "is",
        "it",
        "ja",
        "km",
        "lt",
        "ml",
        "nb-NO",
        "nn-NO",
        "fa",
        "pl",
        "pt-BR",
        "pt-PT",
        "ro",
        "ru",
        "tr",
        "sr-SP-Cy",
        "sr-SP-Lt",
        "sk",
        "sl",
        "es",
        "sv",
        "ta",
        "tl",
        "uk"
    ],
    papersizes: ["A4", "US Letter"],
    footnote_marks: ["strong", "em", "link", "anchor"],
    footnote_elements: [
        "paragraph",
        "heading1",
        "heading2",
        "heading3",
        "heading4",
        "heading5",
        "heading6",
        "figure",
        "ordered_list",
        "bullet_list",
        "horizontal_rule",
        "equation",
        "citation",
        "blockquote",
        "table"
    ],
    template: "Standard Article"
}

const convertNodeV23 = node => {
    switch (node.type) {
        case "article":
            node.attrs = Object.assign({}, node.attrs, v23ExtraAttrs)
            break
        case "title":
            node.attrs = {
                title: "Title",
                id: "title"
            }
            break
        case "subtitle":
            node.type = "heading_part"
            node.attrs = {
                title: "Subtitle",
                id: "subtitle",
                locking: false,
                language: false,
                optional: "hidden",
                hidden: node.attrs.hidden,
                help: false,
                deleted: false,
                elements: ["heading1"],
                marks: ["strong", "em", "link", "anchor"]
            }
            node.content = [
                {
                    type: "heading1",
                    attrs: {
                        id: "H5302207",
                        track: []
                    },
                    content: node.content
                }
            ]
            break
        case "authors":
            node.type = "contributors_part"
            node.attrs = {
                title: "Authors",
                id: "authors",
                locking: false,
                language: false,
                optional: "hidden",
                hidden: node.attrs.hidden,
                help: false,
                deleted: false,
                item_title: "Author"
            }
            break
        case "author":
            node.type = "contributor"
            break
        case "abstract":
            node.type = "richtext_part"
            node.attrs = {
                title: "Abstract",
                id: "abstract",
                locking: false,
                language: false,
                optional: "hidden",
                hidden: node.attrs.hidden,
                help: false,
                deleted: false,
                elements: [
                    "paragraph",
                    "heading1",
                    "heading2",
                    "heading3",
                    "heading4",
                    "heading5",
                    "heading6",
                    "figure",
                    "ordered_list",
                    "bullet_list",
                    "horizontal_rule",
                    "equation",
                    "citation",
                    "blockquote",
                    "footnote",
                    "table"
                ],
                marks: ["strong", "em", "link", "anchor"]
            }
            break
        case "keywords":
            node.type = "tags_part"
            node.attrs = {
                title: "Keywords",
                id: "keywords",
                locking: false,
                language: false,
                optional: "hidden",
                hidden: node.attrs.hidden,
                help: false,
                deleted: false,
                item_title: "Keyword"
            }
            break
        case "keyword":
            node.type = "tag"
            node.attrs = {
                tag: node.attrs.keyword
            }
            break
        case "body":
            node.type = "richtext_part"
            node.attrs = {
                title: "Body",
                id: "body",
                locking: false,
                language: false,
                optional: false,
                hidden: false,
                help: false,
                deleted: false,
                elements: [
                    "paragraph",
                    "heading1",
                    "heading2",
                    "heading3",
                    "heading4",
                    "heading5",
                    "heading6",
                    "figure",
                    "ordered_list",
                    "bullet_list",
                    "horizontal_rule",
                    "equation",
                    "citation",
                    "blockquote",
                    "footnote",
                    "table"
                ],
                marks: ["strong", "em", "link", "anchor"]
            }
            break
        case "heading":
            node.type = `heading${node.attrs.level}`
            delete node.attrs.level
            break
        default:
            break
    }
    if (node.content) {
        node.content.forEach(childNode => {
            convertNodeV23(childNode)
        })
    }
}

const convertDocV23 = doc => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    convertNodeV23(returnDoc.content)
    returnDoc.settings = Object.assign({}, returnDoc.settings, v23ExtraAttrs)
    return returnDoc
}

const convertNodeV30 = node => {
    if (node.attrs?.marks && node.attrs.marks.filter) {
        node.attrs.marks = node.attrs.marks.filter(mark => mark !== "anchor")
    }
    if (node.attrs?.footnote_marks) {
        node.attrs.footnote_marks = node.attrs.footnote_marks.filter(
            mark => mark !== "anchor"
        )
    }
    let attrs
    switch (node.type) {
        case "article":
            attrs = {
                documentstyle: "",
                tracked: false,
                citationstyle: "apa",
                language: "en-US",
                languages: [
                    "af-ZA",
                    "sq-AL",
                    "ar",
                    "ast",
                    "be",
                    "br",
                    "bg",
                    "ca",
                    "ca-ES-Valencia",
                    "zh-CN",
                    "da",
                    "nl",
                    "en-AU",
                    "en-CA",
                    "en-NZ",
                    "en-ZA",
                    "en-GB",
                    "en-US",
                    "eo",
                    "fr",
                    "gl",
                    "de-DE",
                    "de-AU",
                    "de-CH",
                    "el",
                    "he",
                    "is",
                    "it",
                    "ja",
                    "km",
                    "lt",
                    "ml",
                    "nb-NO",
                    "nn-NO",
                    "fa",
                    "pl",
                    "pt-BR",
                    "pt-PT",
                    "ro",
                    "ru",
                    "tr",
                    "sr-SP-Cy",
                    "sr-SP-Lt",
                    "sk",
                    "sl",
                    "es",
                    "sv",
                    "ta",
                    "tl",
                    "uk"
                ],
                papersize: "A4",
                papersizes: ["A4", "US Letter"],
                footnote_marks: ["strong", "em", "link"],
                footnote_elements: [
                    "paragraph",
                    "heading1",
                    "heading2",
                    "heading3",
                    "heading4",
                    "heading5",
                    "heading6",
                    "figure",
                    "ordered_list",
                    "bullet_list",
                    "horizontal_rule",
                    "equation",
                    "citation",
                    "blockquote",
                    "table"
                ]
            }
            break
        case "richtext_part":
            attrs = {
                title: "",
                id: "",
                locking: false,
                language: false,
                optional: false,
                hidden: false,
                help: false,
                initial: false,
                deleted: false,
                elements: [
                    "paragraph",
                    "heading1",
                    "heading2",
                    "heading3",
                    "heading4",
                    "heading5",
                    "heading6",
                    "figure",
                    "ordered_list",
                    "bullet_list",
                    "horizontal_rule",
                    "equation",
                    "citation",
                    "blockquote",
                    "footnote",
                    "table"
                ],
                marks: ["strong", "em", "link"],
                metadata: false
            }
            break
        case "heading_part":
            attrs = {
                title: "",
                id: "",
                locking: false,
                language: false,
                optional: false,
                hidden: false,
                help: false,
                initial: false,
                deleted: false,
                elements: ["heading1"],
                marks: ["strong", "em", "link"],
                metadata: false
            }
            break
        case "contributors_part":
            attrs = {
                title: "",
                id: "",
                locking: false,
                language: false,
                optional: false,
                hidden: false,
                help: false,
                initial: false,
                deleted: false,
                item_title: "Contributor",
                metadata: false
            }
            break
        case "tags_part":
            attrs = {
                title: "",
                id: "",
                locking: false,
                language: false,
                optional: false,
                hidden: false,
                help: false,
                initial: false,
                deleted: false,
                item_title: "Tag",
                metadata: false
            }
            break
        case "table_part":
            attrs = {
                title: "",
                id: "",
                locking: false,
                language: false,
                optional: false,
                hidden: false,
                help: false,
                initial: false,
                deleted: false,
                elements: [
                    "paragraph",
                    "heading1",
                    "heading2",
                    "heading3",
                    "heading4",
                    "heading5",
                    "heading6",
                    "figure",
                    "ordered_list",
                    "bullet_list",
                    "horizontal_rule",
                    "equation",
                    "citation",
                    "blockquote",
                    "footnote"
                ],
                marks: ["strong", "em", "link"],
                metadata: false
            }
            break
        case "table_of_contents":
            attrs = {
                title: "Table of Contents",
                id: "toc",
                optional: false,
                hidden: false
            }
            break
        case "separator_part":
            attrs = {
                id: "separator"
            }
            break
        case "title":
            attrs = {
                id: "title"
            }
            break
        case "contributor":
            attrs = {
                firstname: false,
                lastname: false,
                email: false,
                institution: false
            }
            break
        case "tag":
            attrs = {
                tag: ""
            }
            break
        case "footnote":
            attrs = {
                footnote: [
                    {
                        type: "paragraph"
                    }
                ]
            }
            break
        case "code_block":
        case "paragraph":
        case "blockquote":
        case "horizontal_rule":
        case "bullet_list":
        case "list_item":
            attrs = {
                track: []
            }
            break
        case "ordered_list":
            attrs = {
                order: 1,
                track: []
            }
            break
        case "citation":
            attrs = {
                format: "autocite",
                references: []
            }
            break
        case "equation":
            attrs = {
                equation: ""
            }
            break
        case "figure":
            attrs = {
                equation: "",
                image: false,
                figureCategory: "",
                caption: "",
                id: false,
                track: [],
                aligned: "center",
                width: "100"
            }
            break
        case "heading1":
        case "heading2":
        case "heading3":
        case "heading4":
        case "heading5":
        case "heading6":
            attrs = {
                id: false,
                track: []
            }
            break
        default:
            break
    }

    if (attrs && node.attrs) {
        for (const attr in attrs) {
            if (
                attr in node.attrs &&
                deepEqual(node.attrs[attr], attrs[attr])
            ) {
                delete node.attrs[attr]
            }
        }
        switch (node.type) {
            case "article": {
                if (node.attrs.language === "") {
                    delete node.attrs.language
                }
                const template = node.attrs.template || "default"
                node.attrs.import_id = template
                    .normalize("NFKC")
                    .replace(/[^\w\s-]/g, "")
                    .toLowerCase()
                    .trim()
                    .replace(/[-\s]+/g, "-")
                switch (node.attrs.citationstyle) {
                    case "harvard1":
                        node.attrs.citationstyle = "harvard-cite-them-right"
                        break
                    case "mla":
                        node.attrs.citationstyle = "modern-language-association"
                        break
                    case "american-anthropological-association":
                    case "chicago-author-date":
                    case "chicago-note-bibliography":
                    case "oxford-university-press-humsoc":
                    case "nature":
                        break
                    default:
                        delete node.attrs.citationstyle
                }
                break
            }
            case "title":
                delete node.attrs.title
                break
            default:
                break
        }
    }

    if (node.marks) {
        for (const mark in node.marks) {
            let attrs
            switch (mark.type) {
                case "comment":
                    attrs = {
                        id: false
                    }
                    break
                case "annotation_tag":
                    attrs = {
                        type: "",
                        key: "",
                        value: ""
                    }
                    break
                case "anchor":
                    attrs = {
                        id: false
                    }
                    break
                case "deletion":
                    attrs = {
                        user: 0,
                        username: "",
                        date: 0
                    }
                    break
                case "insertion":
                    attrs = {
                        user: 0,
                        username: "",
                        date: 0,
                        approved: true
                    }
                    break
                case "format_change":
                    attrs = {
                        user: 0,
                        username: "",
                        date: 0,
                        before: [],
                        after: []
                    }
                    break
            }
            if (attrs && mark.attrs) {
                for (const attr in attrs) {
                    if (
                        attr in mark.attrs &&
                        deepEqual(mark.attrs[attr], attrs[attr])
                    ) {
                        delete mark.attrs[attr]
                    }
                }
            }
        }
    }

    if (node.content) {
        node.content.forEach(childNode => {
            convertNodeV30(childNode)
        })
    }
}

const convertDocV30 = doc => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    convertNodeV30(returnDoc.content)
    return returnDoc
}

const convertDocV31 = doc => {
    // Conversion adds no new requirements. Version update is required so that
    // users don't try to open file in a previous FW file. That won't work as
    // additional syntax has been added (copyright + cross references).
    const returnDoc = JSON.parse(JSON.stringify(doc))
    return returnDoc
}

const convertNodeV32 = (node, ids = []) => {
    let blockId, attrs
    switch (node.type) {
        case "table":
            attrs = node.attrs || {}
            blockId = attrs.id
            while (!blockId || ids.includes(blockId)) {
                blockId = randomTableId()
            }
            attrs.id = blockId
            attrs.caption = false
            node.attrs = attrs
            ids.push(blockId)
            node.content = [
                {type: "table_caption"},
                {
                    type: "table_body",
                    content: node.content
                }
            ]
            break
        case "table_cell":
            if (!node.content || !node.content.length) {
                node.content = [{type: "paragraph"}]
            }
            break
        case "table_header":
            if (!node.content || !node.content.length) {
                node.content = [{type: "paragraph"}]
            }
            break
        case "bullet_list":
        case "ordered_list":
            attrs = node.attrs || {}
            blockId = attrs.id
            while (!blockId || ids.includes(blockId)) {
                blockId = randomListId()
            }
            attrs.id = blockId
            node.attrs = attrs
            ids.push(blockId)
            break
        case "figure": {
            attrs = node.attrs || {}
            if (attrs.figureCategory) {
                attrs.category = attrs.figureCategory
                delete attrs.figureCategory
            }
            node.content = []
            if (attrs.image) {
                node.content.push({type: "image", attrs: {image: attrs.image}})
            } else {
                node.content.push({
                    type: "figure_equation",
                    attrs: {equation: attrs.equation || ""}
                })
            }
            delete attrs.image
            delete attrs.equation

            const caption = {type: "figure_caption"}
            if (attrs.caption) {
                if (attrs.caption.length) {
                    caption.content = [{type: "text", text: attrs.caption}]
                    attrs.caption = true
                } else {
                    attrs.caption = false
                }
            } else {
                attrs.caption = false
            }
            if (attrs.category === "table") {
                node.content.unshift(caption)
            } else {
                node.content.push(caption)
            }
            node.attrs = attrs
            break
        }
        case "footnote":
            if (node.attrs?.footnote) {
                node.attrs.footnote.forEach(childNode => {
                    convertNodeV32(childNode, ids)
                })
            }
            break
    }
    if (node.content) {
        node.content.forEach(childNode => {
            convertNodeV32(childNode, ids)
        })
    }
    if (node.attrs?.initial) {
        node.attrs.initial.forEach(childNode => {
            convertNodeV32(childNode, ids)
        })
    }
}

const convertDocV32 = doc => {
    const returnDoc = JSON.parse(JSON.stringify(doc))
    convertNodeV32(returnDoc.content)
    return returnDoc
}

const convertDocV33 = doc => {
    // We just need to increase the version number so that documents cannot
    // be moved from a 3.10 to an 3.9 system, but 3.3 files should be readable
    // as 3.4 files.
    return JSON.parse(JSON.stringify(doc))
}

const convertDocV34 = doc => {
    // The top node needs to be changed from "article" to "doc".
    const returnDoc = JSON.parse(JSON.stringify(doc))
    returnDoc.content.type = "doc"
    return returnDoc
}
