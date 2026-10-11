export const DOCX_EXPORT_STYLES = `
body {
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #000;
  margin: 0;
  padding: 20px;
}
h1 { font-size: 24pt; font-weight: bold; margin: 0 0 12pt 0; }
h2 { font-size: 18pt; font-weight: bold; margin: 0 0 10pt 0; }
h3 { font-size: 14pt; font-weight: bold; margin: 0 0 8pt 0; }
h4 { font-size: 12pt; font-weight: bold; margin: 0 0 6pt 0; }
h5 { font-size: 11pt; font-weight: bold; margin: 0 0 6pt 0; }
h6 { font-size: 10pt; font-weight: bold; margin: 0 0 6pt 0; }
p { margin: 0 0 8pt 0; }
ul, ol { margin: 0 0 8pt 0; padding-left: 20pt; }
li { margin: 0 0 4pt 0; }
strong, b { font-weight: bold; }
em, i { font-style: italic; }
u { text-decoration: underline; }
s, strike, del { text-decoration: line-through; }
code {
  font-family: 'Courier New', Consolas, monospace;
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
}
pre {
  font-family: 'Courier New', Consolas, monospace;
  background-color: #f5f5f5;
  padding: 10px;
  margin: 0 0 8pt 0;
  white-space: pre-wrap;
  border-radius: 4px;
}
.hljs-addition, .hljs-name, .hljs-quote, .hljs-selector-pseudo, .hljs-selector-tag { color: #22863a; }
.hljs-attr, .hljs-attribute, .hljs-literal, .hljs-meta, .hljs-number, .hljs-operator,
.hljs-section, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-id, .hljs-variable { color: #005cc5; }
.hljs-built_in, .hljs-symbol { color: #e36209; }
.hljs-bullet { color: #735c0f; }
.hljs-comment, .hljs-formula { color: #6a737d; }
.hljs-deletion { color: #b31d28; }
.hljs-doctag, .hljs-keyword, .hljs-template-tag, .hljs-template-variable, .hljs-type { color: #d73a49; }
.hljs-regexp, .hljs-string { color: #032f62; }
.hljs-title { color: #6f42c1; }
.hljs-emphasis { font-style: italic; }
.hljs-section, .hljs-strong { font-weight: bold; }
blockquote {
  border-left: 3px solid #ccc;
  margin: 0 0 8pt 0;
  padding-left: 10pt;
  color: #666;
  font-style: italic;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin: 0 0 8pt 0;
}
th, td {
  border: 1px solid #ccc;
  padding: 6pt;
  text-align: left;
}
th {
  background-color: #f5f5f5;
  font-weight: bold;
}
a {
  color: #0066cc;
  text-decoration: underline;
}
img {
  max-width: 100%;
  height: auto;
}
hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 12pt 0;
}
sup { vertical-align: super; font-size: 8pt; }
sub { vertical-align: sub; font-size: 8pt; }
mark { background-color: #ffff00; }
.editor-callout > table > tbody > tr > td { background-color: #f4f4f5; }
.editor-callout > table > tbody > tr > td:first-child {
  font-family: "Apple Color Emoji", "Segoe UI Emoji", NotoColorEmoji, "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", EmojiSymbols;
  font-size: 18px;
}
.editor-codeBlock > [data-docx-preserve-whitespace] {
  background-color: #f5f5f5;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 10pt;
}
.editor-equation [data-empty],
.editor-inlineEquation [data-empty] { color: #888; }
.editor-toc [data-empty] { color: #666; font-size: 10pt; }
`.trim();
