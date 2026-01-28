import {escapeText} from "../../common"

/** A template for HTML export of a document. */
export const htmlExportTemplate = ({
    head,
    body,
    back,
    settings,
    lang,
    xhtml,
    epub
}) =>
    `${xhtml ? '<?xml version="1.0" encoding="UTF-8"?>' : "<!DOCTYPE html>"}
    <html ${xhtml ? `xmlns="http://www.w3.org/1999/xhtml" ${epub ? 'xmlns:epub="http://www.idpf.org/2007/ops"' : ""}` : ""} lang="${lang}"${xhtml ? ` xml:lang="${lang}"` : ""}>
    <head>
        <meta charset="UTF-8"${xhtml ? " /" : ""}>
        ${settings.copyright && settings.copyright.holder ? `<meta name="copyright" content="© ${settings.copyright.year ? settings.copyright.year : new Date().getFullYear()} ${escapeText(settings.copyright.holder)}"${xhtml ? " /" : ""}>` : ""}
        ${head}
    </head>
    <body class="doc user-contents">
        ${body}
        ${back}
        ${
            settings.copyright && settings.copyright.holder
                ? `<div>© ${settings.copyright.year ? settings.copyright.year : new Date().getFullYear()} ${settings.copyright.holder}</div>`
                : ""
        }
        ${
            settings.copyright && settings.copyright.licenses.length
                ? `<div>${settings.copyright.licenses.map(license => `<a rel="license" href="${escapeText(license.url)}">${escapeText(license.title)}${license.start ? ` (${license.start})` : ""}</a>`).join("</div><div>")}</div>`
                : ""
        }
    </body>
</html>`
