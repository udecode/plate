# docx-to-html-mathml

Convert **DOCX → HTML** with full **MathML support** (OMML & MathType).

This library is a patched and extended version of Mammoth that adds **proper math handling**:

- Word built-in equations (OMML)
- MathType equations (OLE objects)

The output is **pure HTML + MathML**, ready to render with **MathJax**.

---

## ✨ Features

- 📄 Convert DOCX to HTML
- ➗ Convert **OMML (Word Equation)** → MathML
- ➕ Convert **MathType (OLE)** → MathML (via Ruby)
- 🧠 Keeps original document structure (paragraphs, tables, images, styles)
- ⚡ Returns a simple **HTML string**
- 🟢 Node.js friendly (>= 12)

---

## 📦 Installation

```bash
npm install docx-to-html-mathml
```
