// End-to-end test of the cleanBodyLevelTokenNodes fix
const { Window } = require('happy-dom');

// Exact pattern from importDocx.ts
const TRACKING_TOKEN_PATTERN = /\[\[DOCX_(INS|DEL|CMT)_(START|END):[^\]]+\]\]/g;

// Exact function from importDocx.ts
function cleanBodyLevelTokenNodes(body) {
  const nodesToRemove = [];
  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType === 3) {
      // Node.TEXT_NODE
      const text = node.textContent || '';
      const withoutTokens = text.replace(TRACKING_TOKEN_PATTERN, '').trim();
      if (withoutTokens === '') {
        nodesToRemove.push(node);
      }
    }
  }
  console.log('Nodes to remove:', nodesToRemove.length);
  for (const node of nodesToRemove) {
    node.parentNode?.removeChild(node);
  }
}

// Simulate Plate's deserialization behavior
// When body has text nodes at body level, they become paragraphs
function simulatePlateDeserialize(body) {
  const nodes = [];
  Array.from(body.childNodes).forEach((child) => {
    if (child.nodeType === 3) {
      // TEXT_NODE
      const text = child.textContent || '';
      if (text.trim()) {
        nodes.push({ type: 'p', children: [{ text }] });
      }
    } else if (child.nodeName === 'P') {
      const text = child.textContent || '';
      nodes.push({ type: 'p', children: [{ text }] });
    }
  });
  // Slate normalization: ensure at least one paragraph
  if (nodes.length === 0) {
    nodes.push({ type: 'p', children: [{ text: '' }] });
  }
  return nodes;
}

function testCase(name, html) {
  console.log('\n=== ' + name + ' ===');
  console.log('Input HTML:', JSON.stringify(html));

  const window = new Window();
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  console.log('Before cleanup - body children:', body.childNodes.length);

  // Apply the fix
  cleanBodyLevelTokenNodes(body);

  console.log('After cleanup - body children:', body.childNodes.length);

  // Simulate deserialization
  const nodes = simulatePlateDeserialize(body);
  console.log('Resulting Plate nodes:', nodes.length);
  nodes.forEach((n, i) => {
    const text = n.children.map((c) => c.text).join('');
    console.log(
      '  [' + i + '] ' + n.type + ': ' + JSON.stringify(text.substring(0, 50))
    );
  });
}

// Test cases
testCase('Normal paragraph', '<p>Hello world</p>');

testCase(
  'Paragraph with inline token',
  '<p>[[DOCX_CMT_START:%7B%22id%22%3A%220%22%7D]]Hello[[DOCX_CMT_END:0]]</p>'
);

testCase(
  'Body-level token at start',
  '[[DOCX_CMT_START:%7B%22id%22%3A%220%22%7D]]<p>Hello</p>[[DOCX_CMT_END:0]]'
);

testCase(
  'Body-level token with newlines',
  '\n[[DOCX_CMT_START:%7B%22id%22%3A%220%22%7D]]\n<p>Hello</p>\n[[DOCX_CMT_END:0]]\n'
);

testCase(
  'Multiple paragraphs with spanning comment',
  '[[DOCX_CMT_START:%7B%22id%22%3A%220%22%7D]]\n<p>First</p>\n<p>Second</p>\n[[DOCX_CMT_END:0]]'
);

// Simulate what mammoth might produce for a real docx with tracked changes
testCase(
  'Tracked changes',
  '<p>Normal text [[DOCX_INS_START:%7B%22id%22%3A%221%22%7D]]inserted[[DOCX_INS_END:1]] more.</p>'
);

// What if there are multiple body-level elements before content?
testCase(
  'Multiple body-level tokens before content',
  '[[DOCX_INS_START:%7B%22id%22%3A%221%22%7D]][[DOCX_DEL_START:%7B%22id%22%3A%222%22%7D]]\n<p>Content</p>[[DOCX_INS_END:1]][[DOCX_DEL_END:2]]'
);
