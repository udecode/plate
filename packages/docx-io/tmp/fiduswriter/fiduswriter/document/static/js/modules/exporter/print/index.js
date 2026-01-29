import {printHTML} from "@vivliostyle/print"
import {addAlert, shortFileTitle} from "../../common"
import {PAPER_SIZES} from "../../schema/const"
import {HTMLExporter} from "../html"
import {HTMLExporterConvert} from "../html/convert"
import {removeHidden} from "../tools/doc_content"

export class PrintExporter extends HTMLExporter {
    constructor(doc, bibDB, imageDB, csl, updated, documentStyles) {
        super(doc, bibDB, imageDB, csl, updated, documentStyles, {
            relativeUrls: false
        })
    }

    async init() {
        addAlert(
            "info",
            `${shortFileTitle(this.doc.title, this.doc.path)}: ${gettext("Printing has been initiated.")}`
        )
        this.docContent = removeHidden(this.doc.content)

        const styleSheets = [
            {url: staticUrl("css/document.css")},
            {
                contents: `a.footnote, a.affiliation {
                    -adapt-template: url(data:application/xml,${encodeURI(
                        '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:s="http://www.pyroxy.com/ns/shadow"><head><style>.footnote-content{float:footnote}</style></head><body><s:template id="footnote"><s:content/><s:include class="footnote-content"/></s:template></body></html>#footnote'
                    )});
                    text-decoration: none;
                    color: inherit;
                    vertical-align: baseline;
                    font-size: 70%;
                    position: relative;
                    top: -0.3em;
                }
                aside.footnote label:first-child, aside.footnote *:nth-child(2),
                aside.affiliation label:first-child, aside.affiliation *:nth-child(2) {
                    display: inline;
                }
                aside.footnote label:first-child:after,
                aside.affiliation label:first-child:after  {
                    content: '. '
                }

                body, section[role=doc-footnotes] {
                    counter-reset: cat-figure cat-equation cat-photo cat-table footnote-counter footnote-marker-counter;
                }
                section#affiliations, section#footnotes  {
                    display: none;
                }
                section:footnote-content {
                    display: block;
                    font-size: small;
                    font-style: normal;
                    font-weight: normal;
                    text-decoration: none;
                    text-indent: 0;
                    text-align: initial;
                }
                .table-of-contents a {
                	display: inline-flex;
                	width: 100%;
                	text-decoration: none;
                	color: currentColor;
                	break-inside: avoid;
                	align-items: baseline;
                }
                .table-of-contents a::before {
                	margin-left: 1px;
                	margin-right: 1px;
                	border-bottom: solid 1px lightgray;
                	content: "";
                	order: 1;
                	flex: auto;
                }
                .table-of-contents a::after {
                	text-align: right;
                	content: target-counter(attr(href, url), page);
                	align-self: flex-end;
                	flex: none;
                	order: 2;
                }
                body {
                    background-color: white;
                }
                @page {
                    size: ${PAPER_SIZES.find(size => size[0] === this.doc.settings.papersize)[1]};
                    @top-center {
                        content: env(doc-title);
                    }
                    @bottom-center {
                        content: counter(page);
                    }
                }`
            }
        ]

        const docStyle = this.getDocStyle(this.doc)

        if (docStyle) {
            styleSheets.push(docStyle)
        }

        await Promise.all(
            styleSheets.map(async sheet => await this.loadStyle(sheet))
        )

        this.converter = new HTMLExporterConvert(
            this.docTitle,
            this.doc.settings,
            this.docContent,
            this.htmlExportTemplate,
            this.imageDB,
            this.bibDB,
            this.csl,
            styleSheets,
            {
                relativeUrls: false
            }
        )

        const {html, metaData} = await this.converter.init()

        const config = {title: metaData.title}

        if (navigator.userAgent.includes("Gecko/")) {
            // Firefox has issues printing images when in iframe. This workaround can be
            // removed once that has been fixed. TODO: Add gecko bug number if there is one.
            config.printCallback = iframeWin => {
                const oldBody = document.body
                document.body.parentElement.dataset.vivliostylePaginated = true
                document.body = iframeWin.document.body
                document.body
                    .querySelectorAll("figure, table")
                    .forEach(el => delete el.dataset.category)
                iframeWin.document
                    .querySelectorAll("style")
                    .forEach(el => document.body.appendChild(el))
                const backgroundStyle = document.createElement("style")
                backgroundStyle.innerHTML = "body {background-color: white;}"
                document.body.appendChild(backgroundStyle)
                window.print()
                document.body = oldBody
                delete document.body.parentElement.dataset.vivliostylePaginated
            }
        }
        return printHTML(html, config)
    }

    getDocStyle(doc) {
        // Override the default as we need to use the original URLs in print.
        const docStyle = this.documentStyles.find(
            docStyle => docStyle.slug === doc.settings.documentstyle
        )
        if (!docStyle) {
            return
        }

        let contents = docStyle.contents
        docStyle.documentstylefile_set.forEach(
            ([url, filename]) =>
                (contents = contents.replace(
                    new RegExp(filename, "g"),
                    new URL(url, window.location).href
                ))
        )
        return {contents}
    }

    loadStyle(sheet) {
        if (sheet.url) {
            sheet.filename = sheet.url
            delete sheet.url
        }
        return Promise.resolve()
    }
}
