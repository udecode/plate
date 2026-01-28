import {escapeText} from "../common"
import {LANGUAGES, PAPER_SIZES} from "../schema/const"

const allowedElementsTemplate = (
    {elements},
    {isFootnote = false, isTable = false} = {}
) =>
    `<div class="label">
    ${gettext("Allowed elements")}
</div>
<label>
    <input type="checkbox" class="elements" value="paragraph" ${elements.includes("paragraph") ? "checked" : ""}/>
    ${gettext("Paragraph")}
</label>
<label>
    <input type="checkbox" class="elements" value="heading1" ${elements.includes("heading1") ? "checked" : ""}/>
    ${gettext("Heading 1")}
</label>
<label>
    <input type="checkbox" class="elements" value="heading2" ${elements.includes("heading2") ? "checked" : ""}/>
    ${gettext("Heading 2")}
</label>
<label>
    <input type="checkbox" class="elements" value="heading3" ${elements.includes("heading3") ? "checked" : ""}/>
    ${gettext("Heading 3")}
</label>
<label>
    <input type="checkbox" class="elements" value="heading4" ${elements.includes("heading4") ? "checked" : ""}/>
    ${gettext("Heading 4")}
</label>
<label>
    <input type="checkbox" class="elements" value="heading5" ${elements.includes("heading5") ? "checked" : ""}/>
    ${gettext("Heading 5")}
</label>
<label>
    <input type="checkbox" class="elements" value="heading6" ${elements.includes("heading6") ? "checked" : ""}/>
    ${gettext("Heading 6")}
</label>
${
    isFootnote
        ? ""
        : `<label>
        <input type="checkbox" class="elements" value="code_block" ${elements.includes("code_block") ? "checked" : ""}/>
        ${gettext("Code block")}
    </label>`
}
<label>
    <input type="checkbox" class="elements" value="figure" ${elements.includes("figure") ? "checked" : ""}/>
    ${gettext("Figure")}
</label>
<label>
    <input type="checkbox" class="elements" value="ordered_list" ${elements.includes("ordered_list") ? "checked" : ""}/>
    ${gettext("Ordered list")}
</label>
<label>
    <input type="checkbox" class="elements" value="bullet_list" ${elements.includes("bullet_list") ? "checked" : ""}/>
    ${gettext("Bullet list")}
</label>
<label>
    <input type="checkbox" class="elements" value="horizontal_rule" ${elements.includes("horizontal_rule") ? "checked" : ""}/>
    ${gettext("Horizontal rule")}
</label>
<label>
    <input type="checkbox" class="elements" value="equation" ${elements.includes("equation") ? "checked" : ""}/>
    ${gettext("Equation")}
</label>
<label>
    <input type="checkbox" class="elements" value="citation" ${elements.includes("citation") ? "checked" : ""}/>
    ${gettext("Citation")}
</label>
<label>
    <input type="checkbox" class="elements" value="cross_reference" ${elements.includes("cross_reference") ? "checked" : ""}/>
    ${gettext("Cross reference")}
</label>
<label>
    <input type="checkbox" class="elements" value="blockquote" ${elements.includes("blockquote") ? "checked" : ""}/>
    ${gettext("Blockquote")}
</label>
${
    isFootnote
        ? ""
        : `<label>
        <input type="checkbox" class="elements" value="footnote" ${elements.includes("footnote") ? "checked" : ""}/>
        ${gettext("Footnote")}
    </label>`
}
${
    isTable
        ? ""
        : `<label>
        <input type="checkbox" class="elements" value="table" ${elements.includes("table") ? "checked" : ""}/>
        ${gettext("Table")}
    </label>`
}`

const allowedMarksTemplate = ({marks}) =>
    `<div class="label">
    ${gettext("Allowed marks")}
</div>
<label>
    <input type="checkbox" class="marks" value="strong" ${marks.includes("strong") ? "checked" : ""}/>
    ${gettext("Strong")}
</label>
<label>
    <input type="checkbox" class="marks" value="em" ${marks.includes("em") ? "checked" : ""}/>
    ${gettext("Emphasis")}
</label>
<label>
    <input type="checkbox" class="marks" value="underline" ${marks.includes("underline") ? "checked" : ""}/>
    ${gettext("Underline")}
</label>
<label>
    <input type="checkbox" class="marks" value="link" ${marks.includes("link") ? "checked" : ""}/>
    ${gettext("Link")}
</label>`

const headingTemplate = ({
    id = "",
    title = "",
    elements = [
        "heading1",
        "heading2",
        "heading3",
        "heading4",
        "heading5",
        "heading6"
    ],
    marks = ["strong", "em", "underline", "link"],
    locking = "false",
    optional = "false",
    language = false,
    metadata = false
}) =>
    `<div class="doc-part-block" data-type="heading_part">
    <div class="doc-part-header">
        ${gettext("Heading")}
        <ul class="object-tools right">
            <li>
                <span class="link configure">${gettext("Configure")}</span>
            </li>
        </ul>
        <div class="label">
            ${gettext("ID")} <input type="text" class="id fw-inline" value="${escapeText(id)}">
            ${gettext("Title")} <input type="text" class="title fw-inline" value="${escapeText(title)}">
        </div>
    </div>
    <div class="attrs hidden">
        <div class="label">${gettext("Metadata function")}
            <select class="metadata">
                <option value="false" ${metadata === false ? "selected" : ""}>${gettext("None")}</option>
                <option value="subtitle" ${metadata === "subtitle" ? "selected" : ""}>${gettext("Subtitle")}</option>
                <option value="title" ${metadata === "title" ? "selected" : ""}>${gettext("Title (translated)")}</option>
            </select>
        </div>
        <div class="label">${gettext("Locking")}
            <select class="locking">
                <option value="false" ${locking === "false" ? "selected" : ""}>${gettext("User can change contents")}</option>
                <option value="fixed" ${locking === "fixed" ? "selected" : ""}>${gettext("User can not change contents")}</option>
                <option value="start" ${locking === "start" ? "selected" : ""}>${gettext("User can only add content")}</option>
            </select>
        </div>
        <div class="label">${gettext("Optional")}
            <select class="optional">
                <option value="false" ${optional === "false" ? "selected" : ""}>${gettext("Obligatory field")}</option>
                <option value="shown" ${optional === "shown" ? "selected" : ""}>${gettext("Optional, shown by default")}</option>
                <option value="hidden" ${optional === "hidden" ? "selected" : ""}>${gettext("Optional, not shown by default")}</option>
            </select>
        </div>
        <div class="label">
            ${gettext("Allowed headings")}
        </div>
        <label>
            <input type="checkbox" class="elements" value="heading1" ${elements.includes("heading1") ? "checked" : ""}/>
            ${gettext("Heading 1")}
        </label>
        <label>
            <input type="checkbox" class="elements" value="heading2" ${elements.includes("heading2") ? "checked" : ""}/>
            ${gettext("Heading 2")}
        </label>
        <label>
            <input type="checkbox" class="elements" value="heading3" ${elements.includes("heading3") ? "checked" : ""}/>
            ${gettext("Heading 3")}
        </label>
        <label>
            <input type="checkbox" class="elements" value="heading4" ${elements.includes("heading4") ? "checked" : ""}/>
            ${gettext("Heading 4")}
        </label>
        <label>
            <input type="checkbox" class="elements" value="heading5" ${elements.includes("heading5") ? "checked" : ""}/>
            ${gettext("Heading 5")}
        </label>
        <label>
            <input type="checkbox" class="elements" value="heading6" ${elements.includes("heading6") ? "checked" : ""}/>
            ${gettext("Heading 6")}
        </label>
        ${allowedMarksTemplate({marks})}
        <div class="label">${gettext("Language")}
            <select class="language">
                <option value="false" ${language === false ? "selected" : ""}>${gettext("Document language")}</option>
                ${LANGUAGES.map(
                    ([code, name]) =>
                        `<option value="${code}" ${language === code ? "selected" : ""}>${name}</option>`
                ).join("")}
            </select>
        </div>
        <div>
            <div class="label">${gettext("Initial content")}</div>
            <div class="initial"></div>
        </div>
        <div>
            <div class="label">${gettext("Instructions")}</div>
            <div class="instructions"></div>
        </div>
    </div>
</div>`

const contributorsTemplate = ({
    id = "",
    title = "",
    item_title = "",
    locking = "false",
    optional = "false",
    metadata = false
}) =>
    `<div class="doc-part-block" data-type="contributors_part">
    <div class="doc-part-header">
        ${gettext("Namelist")}
        <ul class="object-tools right">
            <li>
                <span class="link configure">${gettext("Configure")}</span>
            </li>
        </ul>
        <div class="label">
            ${gettext("ID")} <input type="text" class="id fw-inline" value="${escapeText(id)}">
            ${gettext("Title")} <input type="text" class="title fw-inline" value="${escapeText(title)}">
        </div>
    </div>
    <div class="attrs hidden">
        <div class="label">${gettext("Item title")} <input type="text" class="item_title fw-inline" value="${escapeText(item_title)}"></div>
        <div class="label">${gettext("Metadata function")}
            <select class="metadata">
                <option value="false" ${metadata === false ? "selected" : ""}>${gettext("None")}</option>
                <option value="authors" ${metadata === "authors" ? "selected" : ""}>${gettext("Authors")}</option>
                <option value="editors" ${metadata === "editors" ? "selected" : ""}>${gettext("Editors")}</option>
            </select>
        </div>
        <div class="label">${gettext("Locking")}
            <select class="locking">
                <option value="false" ${locking === "false" ? "selected" : ""}>${gettext("User can change contents")}</option>
                <option value="fixed" ${locking === "fixed" ? "selected" : ""}>${gettext("User can not change contents")}</option>
                <option value="start" ${locking === "start" ? "selected" : ""}>${gettext("User can only add content")}</option>
            </select>
        </div>
        <div class="label">${gettext("Optional")}
            <select class="optional">
                <option value="false" ${optional === "false" ? "selected" : ""}>${gettext("Obligatory field")}</option>
                <option value="shown" ${optional === "shown" ? "selected" : ""}>${gettext("Optional, shown by default")}</option>
                <option value="hidden" ${optional === "hidden" ? "selected" : ""}>${gettext("Optional, not shown by default")}</option>
            </select>
        </div>
        <div>
            <div class="label">${gettext("Initial content")}</div>
            <div class="initial"></div>
        </div>
        <div>
            <div class="label">${gettext("Instructions")}</div>
            <div class="instructions"></div>
        </div>
    </div>
</div>`

const richtextTemplate = ({
    id = "",
    title = "",
    elements = [
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
        "cross_reference",
        "blockquote",
        "footnote"
    ],
    marks = ["strong", "em", "underline", "link"],
    locking = "false",
    optional = "false",
    language = false,
    metadata = false
}) => `<div class="doc-part-block" data-type="richtext_part">
    <div class="doc-part-header">
        ${gettext("Richtext")}
        <ul class="object-tools right">
            <li>
                <span class="link configure">${gettext("Configure")}</span>
            </li>
        </ul>
        <div class="label">
            ${gettext("ID")} <input type="text" class="id fw-inline" value="${escapeText(id)}">
            ${gettext("Title")} <input type="text" class="title fw-inline" value="${escapeText(title)}">
        </div>
    </div>
    <div class="attrs hidden">
        <div class="label">${gettext("Metadata function")}
            <select class="metadata">
                <option value="false" ${metadata === false ? "selected" : ""}>${gettext("None")}</option>
                <option value="abstract" ${metadata === "abstract" ? "selected" : ""}>${gettext("Abstract")}</option>
                <option value="cases" ${metadata === "cases" ? "selected" : ""}>${gettext("Cases/Case Reports")}</option>
                <option value="conclusions" ${metadata === "conclusions" ? "selected" : ""}>${gettext("Conclusions/Comment")}</option>
                <option value="discussion" ${metadata === "discussion" ? "selected" : ""}>${gettext("Discussion/Interpretation")}</option>
                <option value="intro" ${metadata === "intro" ? "selected" : ""}>${gettext("Introduction/Synopsis")}</option>
                <option value="materials" ${metadata === "materials" ? "selected" : ""}>${gettext("Materials")}</option>
                <option value="methods" ${metadata === "methods" ? "selected" : ""}>${gettext("Methods/Methodology/Procedures")}</option>
                <option value="results" ${metadata === "results" ? "selected" : ""}>${gettext("Results/Statement of Findings")}</option>
                <option value="subjects" ${metadata === "subjects" ? "selected" : ""}>${gettext("Subjects/Participants/Patients")}</option>
                <option value="supplementary-material" ${metadata === "supplementary-material" ? "selected" : ""}>${gettext("Supplementary materials")}</option>
            </select>
        </div>
        <div class="label">${gettext("Locking")}
            <select class="locking">
                <option value="false" ${locking === "false" ? "selected" : ""}>${gettext("User can change contents")}</option>
                <option value="fixed" ${locking === "fixed" ? "selected" : ""}>${gettext("User can not change contents")}</option>
                <option value="start" ${locking === "start" ? "selected" : ""}>${gettext("User can only add content")}</option>
            </select>
        </div>
        <div class="label">${gettext("Optional")}
            <select class="optional">
                <option value="false" ${optional === "false" ? "selected" : ""}>${gettext("Obligatory field")}</option>
                <option value="shown" ${optional === "shown" ? "selected" : ""}>${gettext("Optional, shown by default")}</option>
                <option value="hidden" ${optional === "hidden" ? "selected" : ""}>${gettext("Optional, not shown by default")}</option>
            </select>
        </div>
        ${allowedElementsTemplate({elements})}
        ${allowedMarksTemplate({marks})}
        <div class="label">${gettext("Language")}
            <select class="language">
                <option value="false" ${language === false ? "selected" : ""}>${gettext("Document language")}</option>
                ${LANGUAGES.map(
                    ([code, name]) =>
                        `<option value="${code}" ${language === code ? "selected" : ""}>${name}</option>`
                ).join("")}
            </select>
        </div>
        <div>
            <div class="label">${gettext("Initial content")}</div>
            <div class="initial"></div>
        </div>
        <div>
            <div class="label">${gettext("Instructions")}</div>
            <div class="instructions"></div>
        </div>
    </div>
</div>`

const separatorTemplate = ({id = ""}) =>
    `<div class="doc-part-block" data-type="separator_part">
    <div class="doc-part-header">
        ${gettext("Separator")}
        <div class="label">
            ${gettext("ID")} <input type="text" class="id fw-inline" value="${escapeText(id)}">
        </div>
    </div>
</div>`

const tagsTemplate = ({
    id = "",
    title = "",
    item_title = "",
    locking = "false",
    optional = "false",
    metadata = false
}) =>
    `<div class="doc-part-block" data-type="tags_part">
    <div class="doc-part-header">
        ${gettext("Tags")}
        <ul class="object-tools right">
            <li>
                <span class="link configure">${gettext("Configure")}</span>
            </li>
        </ul>
        <div class="label">
            ${gettext("ID")} <input type="text" class="id fw-inline" value="${escapeText(id)}">
            ${gettext("Title")} <input type="text" class="title fw-inline" value="${escapeText(title)}">
        </div>
    </div>
    <div class="attrs hidden">
        <div class="label">${gettext("Item title")} <input type="text fw-inline" class="item_title" value="${escapeText(item_title)}"></div>
        <div class="label">${gettext("Metadata function")}
            <select class="metadata">
                <option value="false" ${metadata === false ? "selected" : ""}>${gettext("None")}</option>
                <option value="keywords" ${metadata === "keywords" ? "selected" : ""}>${gettext("Keywords")}</option>
            </select>
        </div>
        <div class="label">${gettext("Locking")}
            <select class="locking">
                <option value="false" ${locking === "false" ? "selected" : ""}>${gettext("User can change contents")}</option>
                <option value="fixed" ${locking === "fixed" ? "selected" : ""}>${gettext("User can not change contents")}</option>
                <option value="start" ${locking === "start" ? "selected" : ""}>${gettext("User can only add content")}</option>
            </select>
        </div>
        <div class="label">${gettext("Optional")}
            <select class="optional">
                <option value="false" ${optional === "false" ? "selected" : ""}>${gettext("Obligatory field")}</option>
                <option value="shown" ${optional === "shown" ? "selected" : ""}>${gettext("Optional, shown by default")}</option>
                <option value="hidden" ${optional === "hidden" ? "selected" : ""}>${gettext("Optional, not shown by default")}</option>
            </select>
        </div>
        <div>
            <div class="label">${gettext("Initial content")}</div>
            <div class="initial"></div>
        </div>
        <div>
            <div class="label">${gettext("Instructions")}</div>
            <div class="instructions"></div>
        </div>
    </div>
</div>`

const tableTemplate = ({
    id = "",
    title = "",
    elements = [
        "paragraph",
        "heading1",
        "heading2",
        "heading3",
        "heading4",
        "heading5",
        "heading6",
        "code_block",
        "figure",
        "ordered_list",
        "bullet_list",
        "horizontal_rule",
        "equation",
        "citation",
        "cross_reference",
        "blockquote",
        "footnote"
    ],
    marks = ["strong", "em", "underline", "link"],
    locking = "false",
    optional = "false",
    language = false
}) =>
    `<div class="doc-part-block" data-type="table_part">
    <div class="doc-part-header">
        ${gettext("Table")}
        <ul class="object-tools right">
            <li>
                <span class="link configure">${gettext("Configure")}</span>
            </li>
        </ul>
        <div class="label">
            ${gettext("ID")} <input type="text" class="id fw-inline" value="${escapeText(id)}">
            ${gettext("Title")} <input type="text" class="title fw-inline" value="${escapeText(title)}">
        </div>
    </div>
    <div class="attrs hidden">
        <div class="label">${gettext("Locking")}
            <select class="locking">
                <option value="false" ${locking === "false" ? "selected" : ""}>${gettext("User can change contents")}</option>
                <option value="fixed" ${locking === "fixed" ? "selected" : ""}>${gettext("User can not change contents")}</option>
                <option value="header" ${locking === "header" ? "selected" : ""}>${gettext("User can not change first row")}</option>
            </select>
        </div>
        <div class="label">${gettext("Optional")}
            <select class="optional">
                <option value="false" ${optional === "false" ? "selected" : ""}>${gettext("Obligatory field")}</option>
                <option value="shown" ${optional === "shown" ? "selected" : ""}>${gettext("Optional, shown by default")}</option>
                <option value="hidden" ${optional === "hidden" ? "selected" : ""}>${gettext("Optional, not shown by default")}</option>
            </select>
        </div>
        ${allowedElementsTemplate({elements}, {isTable: true})}
        ${allowedMarksTemplate({marks})}
        <div class="label">${gettext("Language")}
            <select class="language">
                <option value="false" ${language === false ? "selected" : ""}>${gettext("Document language")}</option>
                ${LANGUAGES.map(
                    ([code, name]) =>
                        `<option value="${code}" ${language === code ? "selected" : ""}>${name}</option>`
                ).join("")}
            </select>
        </div>
        <div>
            <div class="label">${gettext("Initial content")}</div>
            <div class="initial"></div>
        </div>
        <div>
            <div class="label">${gettext("Instructions")}</div>
            <div class="instructions"></div>
        </div>
    </div>
</div>`

const tocTemplate = ({id = "", title = "", optional = "false"}) =>
    `<div class="doc-part-block" data-type="table_of_contents">
    <div class="doc-part-header">
        ${gettext("Table of Contents")}
        <ul class="object-tools right">
            <li>
                <span class="link configure">${gettext("Configure")}</span>
            </li>
        </ul>
        <div class="label">
            ${gettext("ID")} <input type="text" class="id fw-inline" value="${escapeText(id)}">
            ${gettext("Title")} <input type="text" class="title fw-inline" value="${escapeText(title)}">
        </div>
    </div>
    <div class="attrs hidden">
        <div class="label">${gettext("Optional")}
            <select class="optional">
                <option value="false" ${optional === "false" ? "selected" : ""}>${gettext("Obligatory field")}</option>
                <option value="shown" ${optional === "shown" ? "selected" : ""}>${gettext("Optional, shown by default")}</option>
                <option value="hidden" ${optional === "hidden" ? "selected" : ""}>${gettext("Optional, not shown by default")}</option>
            </select>
        </div>
    </div>
</div>`

const footnoteTemplate = ({
    footnote_elements = [
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
        "cross_reference",
        "blockquote",
        "table"
    ],
    footnote_marks = ["strong", "em", "underline", "link"]
}) =>
    `<div class="doc-part-block attrs">${allowedElementsTemplate({elements: footnote_elements}, {isFootnote: true})}${allowedMarksTemplate({marks: footnote_marks})}</div>`

const citationstylesTemplate = (
    {citationstyles = ["apa"]},
    allCitationStyles
) =>
    `<select multiple size=5>
${Object.entries(allCitationStyles)
    .map(
        ([key, value]) =>
            `<option value="${key}"${citationstyles.includes(key) ? " selected" : ""}>${value}</option>`
    )
    .join("")}
</select>`

export const citationstyleTemplate = (
    {citationstyle = "apa", citationstyles = ["apa"]},
    allCitationStyles
) => {
    if (!citationstyles.includes(citationstyle)) {
        citationstyle = citationstyles[0]
    }
    return `<select>
        ${citationstyles
            .map(
                key =>
                    `<option value="${key}"${citationstyle === key ? " selected" : ""}>${
                        allCitationStyles[key]
                    }</option>`
            )
            .join("")}
    </select>`
}

const languagesTemplate = ({languages = LANGUAGES.map(lang => lang[0])}) =>
    `<select multiple size=5>
${LANGUAGES.map(lang => `<option value="${lang[0]}"${languages.includes(lang[0]) ? " selected" : ""}>${lang[1]}</option>`).join("")}
</select>`

export const languageTemplate = ({
    language = "en-US",
    languages = LANGUAGES.map(lang => lang[0])
}) => {
    if (!languages.includes(language)) {
        language = languages[0]
    }
    return `<select>
        ${LANGUAGES.filter(lang => languages.includes(lang[0]))
            .map(
                lang =>
                    `<option value="${lang[0]}"${language === lang[0] ? " selected" : ""}>${lang[1]}</option>`
            )
            .join("")}
    </select>`
}

const papersizesTemplate = ({papersizes = PAPER_SIZES.map(size => size[0])}) =>
    `<select multiple size=5>
${PAPER_SIZES.map(size => `<option value="${size[0]}"${papersizes.includes(size[0]) ? " selected" : ""}>${size[0]}</option>`).join("")}
</select>`

const languageSelector = language =>
    `<select>
${LANGUAGES.map(lang => `<option value="${lang[0]}"${language === lang[0] ? " selected" : ""}>${lang[1]}</option>`).join("")}
</select>`

export const bibliographyHeaderTemplate = ({
    bibliography_header = {zzz: ""}
}) => {
    let translations = Object.entries(bibliography_header)
    if (!translations.length) {
        translations = [["zzz", ""]]
    }
    return `<table class="fw-dialog-table fw-small input-list-wrapper">${translations
        .map(
            translation =>
                `<tr>
                    <td>${languageSelector(translation[0])}</td>
                    <td>
                        <input type="text" value="${escapeText(translation[1])}" >
                    </td>
                    <td class="input-field-list-ctrl">
                        <span class="fa fa-minus-circle" tabindex="0"></span>&nbsp;<span class="fa fa-plus-circle" tabindex="0"></span>
                    </td>
                </tr>`
        )
        .join("")}</table>`
}

const templateEditorValueTemplate = ({content}) =>
    content
        .map(docPart => {
            switch (docPart.type) {
                case "heading_part":
                    return headingTemplate(docPart.attrs)
                case "contributors_part":
                    return contributorsTemplate(docPart.attrs)
                case "richtext_part":
                    return richtextTemplate(docPart.attrs)
                case "tags_part":
                    return tagsTemplate(docPart.attrs)
                case "table_part":
                    return tableTemplate(docPart.attrs)
                case "table_of_contents":
                    return tocTemplate(docPart.attrs)
                case "separator_part":
                    return separatorTemplate(docPart.attrs)
                default:
                    return ""
            }
        })
        .join("")

export const documentStylesTemplate = ({documentStyles}) => `${documentStyles
    .map(
        style => `<button class="fw-green fw-small fw-button ui-button document-style" data-id="${style.pk}">
        ${escapeText(style.fields.title)}
    </button>`
    )
    .join("")}
<button class="fw-green fw-small fw-button ui-button document-style" data-id="0">
    <i class="fas fa-plus-circle"></i>
    ${gettext("Add new document style")}
</button>`

export const exportTemplatesTemplate = ({exportTemplates}) => `${exportTemplates
    .map(
        template => `<button class="fw-green fw-small fw-button ui-button export-template" data-id="${template.pk}">
        ${escapeText(template.fields.title)}
    </button>`
    )
    .join("")}
<button class="fw-green fw-small fw-button ui-button export-template" data-id="0">
    <i class="fas fa-plus-circle"></i>
    ${gettext("Add new export template")}
</button>`

export const documentDesignerTemplate = ({
    id,
    value,
    title,
    documentStyles,
    exportTemplates,
    citationStyles
}) =>
    `<table class="title-id"><tbody>
    <tr><td>${gettext("Title")}</td><td><input type="text" class="title vTextField fw-inline" value="${escapeText(title)}"></td></tr>
    <tr><td>${gettext("ID")}</td><td><input type="text" class="import-id vTextField fw-inline" value="${escapeText(value.attrs.import_id || "")}"></td></tr>
    </tbody></table>
    <table>
        <thead>
            <tr>
                <th>${gettext("Element types")}</th>
                <th>${gettext("Document structure")}</th>
                <th>${gettext("Delete")}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="from-container">
                    ${headingTemplate({})}
                    ${contributorsTemplate({})}
                    ${richtextTemplate({})}
                    ${tagsTemplate({})}
                    ${tableTemplate({})}
                    ${tocTemplate({})}
                    ${separatorTemplate({})}
                </td>
                <td class="to-column">
                    <div class="doc-part-block fixed" data-type="initial">${gettext("Title")}</div>
                    <div class="to-container">${templateEditorValueTemplate({content: value.content || []})}</div>
                </td>
                <td class="trash">
                </td>
            </tr>
        </tbody>
    </table>
    <table class="fw-data-table">
        <thead>
            <tr>
                <th>${gettext("Setting")}</th>
                <th>${gettext("Value")}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    ${gettext("Footnote specifications")}
                </td>
                <td class="footnote-value">
                    ${footnoteTemplate(value.attrs || {})}
                </td>
            </tr>
            <tr>
                <td>
                    ${gettext("Available languages")}
                </td>
                <td class="languages-value">
                    ${languagesTemplate(value.attrs || {})}
                </td>
            </tr>
            <tr>
                <td>
                    ${gettext("Default language")}
                </td>
                <td class="language-value">
                    ${languageTemplate(value.attrs || {})}
                </td>
            </tr>
            <tr>
                <td>
                    ${gettext("Permitted paper sizes")}
                </td>
                <td class="papersizes-value">
                    ${papersizesTemplate(value.attrs || {})}
                </td>
            </tr>
            <tr>
                <td>
                    ${gettext("Custom bibliography header")}
                </td>
                <td class="bibliography-header-value">
                    ${bibliographyHeaderTemplate(value.attrs || {})}
                </td>
            </tr>
            <tr>
                <td>
                    ${gettext("Available citation styles")}
                </td>
                <td class="citationstyles-value">
                    ${citationstylesTemplate(value.attrs || {}, citationStyles)}
                </td>
            </tr>
            <tr>
                <td>
                    ${gettext("Default citation style")}
                </td>
                <td class="citationstyle-value">
                    ${citationstyleTemplate(value.attrs || {}, citationStyles)}
                </td>
            </tr>
            ${
                id
                    ? `<tr>
                    <td>
                        ${gettext("Document styles")}
                    </td>
                    <td>
                        <div class="ui-dialog-buttonset document-styles">
                                ${documentStylesTemplate({documentStyles})}
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        ${gettext("Export templates")}
                    </td>
                    <td>
                        <div class="ui-dialog-buttonset export-templates">
                                ${exportTemplatesTemplate({exportTemplates})}
                        </div>
                    </td>
                </tr>`
                    : ""
            }
        </tbody>
    </table>`
