import {escapeText} from "../../common"
import {BIBLIOGRAPHY_HEADERS} from "../../schema/i18n"
import {textContent} from "../tools/doc_content"
import {xmlDOM} from "../tools/xml"

export class DOCXExporterRender {
    constructor(xml) {
        this.xml = xml

        this.filePath = false // "word/document.xml" or "word/document2.xml" in some cases
        this.ctXML = false
        this.text = false
    }

    init() {
        return this.xml
            .getXml("[Content_Types].xml")
            .then(ctXML => {
                this.ctXML = ctXML
                const documentOverride = this.ctXML.query("Override", {
                    ContentType:
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"
                })
                this.filePath = documentOverride
                    .getAttribute("PartName")
                    .slice(1)
                return this.xml.getXml(this.filePath)
            })
            .then(xml => {
                this.text = xml
                // Ensure we support the three latest docx feature sets:
                // wp14 (drawing 2010), w14 (word 2010), w15 (word 2012)
                const documentEl = this.text.query("w:document")
                if (!documentEl.getAttribute("xmlns:wp14")) {
                    documentEl.setAttribute(
                        "xmlns:wp14",
                        "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
                    )
                }
                if (!documentEl.getAttribute("xmlns:w14")) {
                    documentEl.setAttribute(
                        "xmlns:w14",
                        "http://schemas.microsoft.com/office/word/2010/wordml"
                    )
                }
                if (!documentEl.getAttribute("xmlns:w15")) {
                    documentEl.setAttribute(
                        "xmlns:w15",
                        "http://schemas.microsoft.com/office/word/2012/wordml"
                    )
                }
                const ignorable = [
                    ...new Set(
                        ["w14", "wp14", "w15"].concat(
                            documentEl
                                .getAttribute("mc:Ignorable", "")
                                .split(" ")
                                .filter(item => item.length)
                        )
                    )
                ]
                documentEl.setAttribute("mc:Ignorable", ignorable.join(" "))
                return Promise.resolve()
            })
    }

    // Define the tags that are to be looked for in the document
    getTagData(docContent, pmBib, settings) {
        const tags = docContent.content.map(node => {
            const tag = {}
            switch (node.type) {
                case "title":
                    tag.title = "title"
                    tag.content = textContent(node)
                    break
                case "heading_part":
                    tag.title = node.attrs.id
                    tag.content = textContent(node)
                    break
                case "table_part":
                case "richtext_part":
                    tag.title = `@${node.attrs.id}`
                    tag.content = node.content
                    break
                case "contributors_part":
                    tag.title = node.attrs.id
                    // TODO: This is a very basic reduction of the author info into
                    // a simple string. We should expand the templating system so
                    // that one can specify more about the output.
                    tag.content = node.content
                        ? node.content
                              .map(node => {
                                  const contributor = node.attrs,
                                      nameParts = []
                                  let affiliation = false
                                  if (contributor.firstname) {
                                      nameParts.push(contributor.firstname)
                                  }
                                  if (contributor.lastname) {
                                      nameParts.push(contributor.lastname)
                                  }
                                  if (contributor.institution) {
                                      if (nameParts.length) {
                                          affiliation = contributor.institution
                                      } else {
                                          // We have an institution but no names. Use institution as name.
                                          nameParts.push(
                                              contributor.institution
                                          )
                                      }
                                  }
                                  const parts = [nameParts.join(" ")]
                                  if (affiliation) {
                                      parts.push(affiliation)
                                  }
                                  if (contributor.email) {
                                      parts.push(contributor.email)
                                  }
                                  return parts.join(", ")
                              })
                              .join("; ")
                        : ""
                    break
                case "tags_part":
                    tag.title = node.attrs.id
                    tag.content = node.content
                        ? node.content.map(node => node.attrs.tag).join(", ")
                        : ""
                    break
            }
            return tag
        })
        const bibliographyHeader =
            settings.bibliography_header[settings.language] ||
            BIBLIOGRAPHY_HEADERS[settings.language]
        tags.push({
            title: "@bibliography", // The '@' triggers handling as block
            content: pmBib
                ? [
                      {
                          type: "bibliography_heading",
                          content: [{type: "text", text: bibliographyHeader}]
                      }
                  ].concat(pmBib.content)
                : [{type: "paragraph", content: [{type: "text", text: " "}]}]
        })
        tags.push({
            title: "@copyright", // The '@' triggers handling as block
            content:
                settings.copyright && settings.copyright.holder
                    ? [
                          {
                              type: "paragraph",
                              content: [
                                  {
                                      type: "text",
                                      text: `© ${settings.copyright.year ? settings.copyright.year : new Date().getFullYear()} ${settings.copyright.holder}`
                                  }
                              ]
                          }
                      ]
                    : [
                          {
                              type: "paragraph",
                              content: [{type: "text", text: " "}]
                          }
                      ]
        })
        tags.push({
            title: "@licenses", // The '@' triggers handling as block
            content:
                settings.copyright && settings.copyright.licenses.length
                    ? settings.copyright.licenses.map(license => ({
                          type: "paragraph",
                          content: [
                              {
                                  type: "text",
                                  marks: [
                                      {
                                          type: "link",
                                          attrs: {
                                              href: license.url,
                                              title: license.title
                                          }
                                      }
                                  ],
                                  text: license.title
                              },
                              {
                                  type: "text",
                                  text: license.start
                                      ? ` (${license.start})`
                                      : ""
                              }
                          ]
                      }))
                    : [
                          {
                              type: "paragraph",
                              content: [{type: "text", text: " "}]
                          }
                      ]
        })

        return tags
    }

    // go through document.xml looking for tags and replace them with the given
    // replacements.
    render(docContent, pmBib, settings, richtext, citations) {
        const tags = this.getTagData(docContent, pmBib, settings)

        // Including global page definition at end
        const blocks = this.text.queryAll(["w:p", "w:sectPr"])

        const currentTags = []
        blocks.forEach(block => {
            // Assuming there is nothing outside of <w:t>...</w:t>
            const text = block.textContent
            tags.forEach(tag => {
                const tagString = tag.title
                if (text.includes(`{${tagString}}`)) {
                    currentTags.push(tag)
                    tag.block = block
                    // We don't worry about the same tag appearing twice in the document,
                    // as that would make no sense.
                }
            })
            const pageSize = block.query("w:pgSz")
            const pageMargins = block.query("w:pgMar")
            const cols = block.query("w:cols")
            if (pageSize && pageMargins) {
                // Not sure if these all need to come together
                let width =
                    Number.parseInt(pageSize.getAttribute("w:w")) -
                    Number.parseInt(pageMargins.getAttribute("w:right")) -
                    Number.parseInt(pageMargins.getAttribute("w:left"))
                const height =
                    Number.parseInt(pageSize.getAttribute("w:h")) -
                    Number.parseInt(pageMargins.getAttribute("w:bottom")) -
                    Number.parseInt(pageMargins.getAttribute("w:top")) -
                    Number.parseInt(pageMargins.getAttribute("w:header")) -
                    Number.parseInt(pageMargins.getAttribute("w:footer"))

                const colCount = cols
                    ? Number.parseInt(cols.getAttribute("w:num"))
                    : 1
                if (colCount > 1) {
                    const colSpace = Number.parseInt(
                        cols.getAttribute("w:space")
                    )
                    width = width - colSpace * (colCount - 1)
                    width = width / colCount
                }
                while (currentTags.length) {
                    const tag = currentTags.pop()
                    tag.dimensions = {
                        width: width * 635, // convert to EMU
                        height: height * 635 // convert to EMU
                    }
                }
            }
        })
        tags.forEach(tag => {
            if (!tag.title) {
                return
            } else if (tag.title[0] === "@") {
                this.blockRender(tag, citations, richtext)
            } else {
                this.inlineRender(tag)
            }
        })
    }

    // Render Tags that only exchange inline content
    inlineRender(tag) {
        if (!tag.block) {
            return
        }
        const texts = tag.block.textContent.split(`{${tag.title}}`)
        const fullText = texts[0] + escapeText(tag.content) + texts[1]
        const rs = tag.block.queryAll("w:r").reverse()
        let lastR
        // Remove all <w:r> with text in them (<w:t>).
        // Exclude <w:r> used for other things, like page breaks.
        rs.forEach(r => {
            if (r.query("w:t")) {
                if (lastR) {
                    r.parentElement.removeChild(r)
                } else {
                    lastR = r
                }
            }
        })
        if (!lastR) {
            // This should not be possible. Error.
            return
        }
        if (fullText.length) {
            let textAttr = ""
            if (fullText[0] === " " || fullText[fullText.length - 1] === " ") {
                textAttr += 'xml:space="preserve"'
            }
            lastR.innerXML = `<w:t ${textAttr}>${fullText}</w:t>`
        } else {
            lastR.parentElement.removeChild(lastR)
        }
    }

    // Render tags that exchange paragraphs
    blockRender(tag, citations, richtext) {
        if (!tag.block) {
            return
        }
        const pStyle = tag.block.query("w:pStyle")
        const options = {
            dimensions: tag.dimensions,
            citationType: citations.citFm.citationType,
            section: pStyle ? pStyle.getAttribute("w:val") : "Normal",
            tag: tag.title.slice(1)
        }
        const outXML = tag.content
            ? tag.content
                  .map((content, i) =>
                      richtext.run(content, options, tag.content[i + 1])
                  )
                  .join("")
            : ""
        if (!outXML.length) {
            // If there is no content, we need to put in a space to prevent the
            // tag from being removed.
            tag.block.innerXML = '<w:r><w:t xml:space="preserve"> </w:t></w:r>'
            return
        }
        const parentElement = tag.block.parentElement
        const dom = xmlDOM(outXML)
        const domPars = dom.node["#document"]?.slice() || [dom]
        domPars.forEach(node => parentElement.insertBefore(node, tag.block))
        // sectPr contains information about columns, etc. We need to move this
        // to the last paragraph we will be adding.
        const sectPr = tag.block.query("w:sectPr")
        if (sectPr) {
            const pPr = tag.block.previousSibling.query("w:pPr")
            pPr.appendChild(sectPr)
        }
        parentElement.removeChild(tag.block)
    }
}
