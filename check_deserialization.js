// Simulate what happens during DOCX import deserialization
const { Window } = require('happy-dom');

// Token cleanup pattern (same as in importDocx.ts)
const TRACKING_TOKEN_PATTERN = /\[\[DOCX_(INS|DEL|CMT)_(START|END):[^\]]+\]\]/g;

// Simulated HTML from mammoth with comments
const htmlWithComments =
  '<p>[[DOCX_CMT_START:%7B%22id%22%3A%220%22%7D]]Ouch[[DOCX_CMT_END:0]].</p>';

// What happens if we have comments spanning multiple paragraphs?
// In that case, the structure would be different
const htmlWithSpanningComment = `
[[DOCX_CMT_START:%7B%22id%22%3A%220%22%7D]]
<p>First paragraph</p>
<p>Second paragraph</p>
[[DOCX_CMT_END:0]]
`;

// Let's also test what happens with tracked changes
const htmlWithTrackedChanges = `
<p>Normal text [[DOCX_INS_START:%7B%22id%22%3A%221%22%2C%22author%22%3A%22Test%22%7D]]inserted[[DOCX_INS_END:1]] more text.</p>
`;

function analyzeHTML(name, html) {
  console.log('=== ' + name + ' ===');
  console.log('Input HTML:', JSON.stringify(html));

  const window = new Window();
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  console.log('\nBody children (' + body.childNodes.length + '):');
  Array.from(body.childNodes).forEach((node, i) => {
    const isText = node.nodeType === 3;
    const content = node.textContent || '';
    const trimmedContent = content.replace(TRACKING_TOKEN_PATTERN, '').trim();
    console.log(
      '  [' +
        i +
        '] ' +
        (isText ? 'TEXT' : node.nodeName) +
        ' | Content: ' +
        JSON.stringify(content.substring(0, 80)) +
        (isText
          ? ' | After token removal: ' + JSON.stringify(trimmedContent)
          : '')
    );
  });

  // Count body-level text nodes that would be cleaned
  const textNodes = Array.from(body.childNodes).filter((n) => n.nodeType === 3);
  const tokenOnlyNodes = textNodes.filter((n) => {
    const text = n.textContent || '';
    const withoutTokens = text.replace(TRACKING_TOKEN_PATTERN, '').trim();
    return withoutTokens === '';
  });

  console.log('\nToken-only text nodes at body level:', tokenOnlyNodes.length);
  console.log('\n');
}

// Test various HTML structures
analyzeHTML('Comments inside paragraph', htmlWithComments);
analyzeHTML('Spanning comment (body-level tokens)', htmlWithSpanningComment);
analyzeHTML('Tracked changes', htmlWithTrackedChanges);

// Also test what happens with empty p at beginning
const htmlWithEmptyP = '<p></p><p>Content</p>';
analyzeHTML('Empty paragraph at start', htmlWithEmptyP);

// Test with whitespace
const htmlWithWhitespace = '\n<p>Content</p>\n';
analyzeHTML('Whitespace around paragraph', htmlWithWhitespace);
