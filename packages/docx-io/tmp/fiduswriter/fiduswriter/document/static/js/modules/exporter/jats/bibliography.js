import {escapeText} from "../../common"
import {convertTexts} from "./text"

// This list is based on values listed at https://jats.nlm.nih.gov/archiving/tag-library/1.2/attribute/publication-type.html
// And the advice given here: https://jats4r.org/citations/#recommendation
const PUBLICATION_TYPES = {
    article: "journal",
    "article-journal": "journal",
    "article-magazine": "journal",
    "article-newspaper": "journal",
    book: "book",
    bookinbook: "book",
    booklet: "book",
    chapter: "book",
    collection: "standard",
    dataset: "dataset",
    "entry-dictionary": "standard",
    "entry-encyclopedia": "standard",
    inbook: "book",
    incollection: "book",
    inproceedings: "standard",
    inreference: "standard",
    manual: "book",
    misc: "standard",
    mvbook: "book",
    mvcollection: "standard",
    mvproceedings: "book",
    mvreference: "standard",
    online: "standard",
    patent: "patent",
    periodical: "book",
    post: "standards",
    "post-weblog": "standard",
    proceedings: "book",
    reference: "standard",
    report: "report",
    review: "review",
    suppbook: "book",
    suppcollection: "book",
    suppperiodical: "journal",
    thesis: "standard",
    unpublished: "standard"
}

export function jatsBib(bib, id) {
    let start = "",
        end = ""
    start += `<ref id="ref-${id}">`
    end = "</ref>" + end
    // Type
    const publicationType = PUBLICATION_TYPES[bib.bib_type] ?? "standard"
    start += `<element-citation publication-type="${publicationType}">`
    end = "</element-citation>" + end

    // authors
    if (bib.fields.author && bib.fields.author.length) {
        start += `<person-group person-group-type="author">${bib.fields.author
            .map(author => {
                if (author.literal) {
                    return `<collab>${convertTexts(author.literal)}</collab>`
                }
                let nameStart = `<name><surname>${convertTexts(author.family)}</surname> <given-names>${convertTexts(author.given)}</given-names>`
                if (author.prefix && author.prefix.length) {
                    nameStart += ` <prefix>${convertTexts(author.prefix)}</prefix>`
                }
                if (author.suffix && author.suffix.length) {
                    nameStart += ` <suffix>${convertTexts(author.suffix)}</suffix>`
                }
                const nameEnd = "</name>"
                return nameStart + nameEnd
            })
            .join(", ")}</person-group>`
    }

    // title && container title
    if (bib.fields.title) {
        if (
            bib.fields.shortjournal ||
            bib.fields.booktitle ||
            bib.fields.journaltitle
        ) {
            start += `<source>${convertTexts(bib.fields.shortjournal || bib.fields.booktitle || bib.fields.journaltitle)}</source>`
            start += `<article-title>${convertTexts(bib.fields.title)}</article-title>`
        } else {
            start += `<source>${convertTexts(bib.fields.title)}</source>`
        }
    }

    // editors
    if (bib.fields.editor && bib.fields.editor.length) {
        start += `<person-group person-group-type="editor">${bib.fields.editor
            .map(editor => {
                if (editor.literal) {
                    return `<collab>${convertTexts(editor.literal)}</collab>`
                }
                let nameStart = `<name><surname>${convertTexts(editor.family)}</surname> <given-names>${convertTexts(editor.given)}</given-names>`
                const nameEnd = "</name>"
                if (editor.prefix && editor.prefix.length) {
                    nameStart = `<prefix>${convertTexts(editor.prefix)}</prefix>`
                }
                if (editor.suffix && editor.suffix.length) {
                    nameStart = `<suffix>${convertTexts(editor.suffix)}</suffix>`
                }
                return nameStart + nameEnd
            })
            .join(", ")}</person-group>`
    }

    // publisher
    if (bib.fields.publisher && bib.fields.publisher.length) {
        start += bib.fields.publisher
            .map(
                publisher =>
                    `<publisher-name>${convertTexts(publisher)}</publisher-name>`
            )
            .join("")
    }

    // location
    if (bib.fields.location && bib.fields.location.length) {
        start += bib.fields.location
            .map(
                location =>
                    `<publisher-loc>${convertTexts(location)}</publisher-loc>`
            )
            .join("")
    }

    // date
    if (bib.fields.date && bib.fields.date.length) {
        const date = bib.fields.date
        const dateParts = date.split("-")
        start += `<date iso-8601-date="${date}" date-type="published">${
            dateParts.length > 2 ? `<day>${dateParts[2]}</day>` : ""
        }${
            dateParts.length > 1 ? `<month>${dateParts[1]}</month>` : ""
        }<year>${dateParts[0]}</year></date>`
    }

    // volume
    if (bib.fields.volume && bib.fields.volume.length) {
        start += `<volume>${convertTexts(bib.fields.volume)}</volume>`
    }

    // issue
    if (bib.fields.issue && bib.fields.issue.length) {
        start += `<issue>${convertTexts(bib.fields.issue)}</issue>`
    }

    // pages
    if (bib.fields.pages && bib.fields.pages.length) {
        start += `<fpage>${convertTexts(bib.fields.pages[0][0])}</fpage>`
        start += `<lpage>${convertTexts(bib.fields.pages.slice(-1)[0].slice(-1)[0])}</lpage>`
        if (bib.fields.pages.length > 1) {
            start += `<page-range>${bib.fields.pages
                .map(pages => pages.map(page => convertTexts(page)).join("-"))
                .join(", ")}</page-range>`
        }
    }

    // doi
    if (bib.fields.doi && bib.fields.doi.length) {
        start += `<pub-id pub-id-type="doi">${escapeText(bib.fields.doi)}</pub-id>`
    }

    // url
    if (bib.fields.url && bib.fields.url.length) {
        start += `<ext-link ext-link-type="web" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${escapeText(bib.fields.url)}"/>`
    }

    // url date
    if (bib.fields.urldate && bib.fields.urldate.length) {
        const date = bib.fields.urldate
        const dateParts = date.split("-")
        start += `<date-in-citation content-type="access-date" iso-8601-date="${date}">${
            dateParts.length > 2 ? `<day>${dateParts[2]}</day>` : ""
        }${
            dateParts.length > 1 ? `<month>${dateParts[1]}</month>` : ""
        }<year>${dateParts[0]}</year></date-in-citation>`
    }

    return start + end
}
