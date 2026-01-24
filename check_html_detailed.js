const mammoth = require('./packages/docx-io/src/lib/mammoth.js');
const fs = require('fs');
const { Window } = require('happy-dom');

async function analyzeHTML(filename) {
  const filepath = `./packages/docx-io/src/lib/mammoth.js/test/test-data/${filename}`;
  if (!fs.existsSync(filepath)) {
    console.log('File not found:', filepath);
    return;
  }

  const buffer = fs.readFileSync(filepath);
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;

  console.log('=== Analyzing', filename, '===');
  console.log('Raw HTML:', JSON.stringify(html));
  console.log('');

  // Parse with DOMParser (simulate browser behavior)
  const window = new Window();
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  console.log('Body children count:', body.childNodes.length);
  console.log('Body children:');
  Array.from(body.childNodes).forEach((node, i) => {
    const content = node.textContent ? node.textContent.substring(0, 100) : '';
    console.log(
      '  [' +
        i +
        '] Type: ' +
        node.nodeType +
        ' (' +
        node.nodeName +
        '), Content: ' +
        JSON.stringify(content)
    );
  });

  // Check for whitespace text nodes
  const textNodes = Array.from(body.childNodes).filter((n) => n.nodeType === 3);
  console.log('Text nodes at body level:', textNodes.length);
  textNodes.forEach((n, i) => {
    console.log('  Text[' + i + ']: ' + JSON.stringify(n.textContent));
  });

  console.log('\n');
}

(async () => {
  await analyzeHTML('comments.docx');
  await analyzeHTML('single-paragraph.docx');
})();
