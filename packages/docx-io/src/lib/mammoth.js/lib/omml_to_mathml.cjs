// lib/omml_to_mathml.cjs
const fs = require("fs");
const path = require("path");
const { Xslt, XmlParser } = require("xslt-processor");

function createOmmlConverter(opts = {}) {
  const xsltPath =
    opts.xsltPath || path.join(__dirname, "..", "OMML2MML.XSL");

  if (!fs.existsSync(xsltPath)) {
    throw new Error(`Missing OMML2MML.XSL: ${xsltPath}`);
  }

  const xslt = new Xslt();
  const xmlParser = new XmlParser();

  const xslText = fs.readFileSync(xsltPath, "utf8");
  const xslDoc = xmlParser.xmlParse(xslText); // parse 1 lần

  function wrapOmml(ommlXml) {
    const s = (ommlXml || "").trim();
    if (!s) return "";

    const looksLikeOmml =
      /<\s*m:oMath\b/i.test(s) || /<\s*m:oMathPara\b/i.test(s);

    const inner = looksLikeOmml ? s : `<m:oMath>${s}</m:oMath>`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">
  <w:body>
    ${inner}
  </w:body>
</w:document>`;
  }

  async function ommlToMathml(ommlXml) {
    const wrapped = wrapOmml(ommlXml);

    if (!wrapped) return "";

    const doc = xmlParser.xmlParse(wrapped);
    const out = await xslt.xsltProcess(doc, xslDoc);
    return out;
  }

  return { ommlToMathml, wrapOmml, xsltPath };
}

module.exports = { createOmmlConverter };
