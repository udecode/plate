// Test how DOMParser handles whitespace in different positions
const { Window } = require('happy-dom');

function testHTML(name, html) {
  const window = new Window();
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  console.log('=== ' + name + ' ===');
  console.log('Input:', JSON.stringify(html));
  console.log('Body children:', body.childNodes.length);
  Array.from(body.childNodes).forEach((node, i) => {
    const type = node.nodeType === 3 ? 'TEXT' : node.nodeName;
    const content = JSON.stringify(node.textContent);
    console.log('  [' + i + '] ' + type + ': ' + content);
  });
  console.log('');
}

// Test various whitespace scenarios
testHTML('Leading newline', '\n<p>Content</p>');
testHTML('Trailing newline', '<p>Content</p>\n');
testHTML('Both newlines', '\n<p>Content</p>\n');
testHTML('Whitespace only', '   \n   ');
testHTML('Leading spaces', '   <p>Content</p>');
testHTML('Leading tab', '\t<p>Content</p>');
testHTML('Leading token', '[[TOKEN]]<p>Content</p>');
testHTML(
  'Multiple paragraphs with newlines',
  '\n<p>First</p>\n<p>Second</p>\n'
);
testHTML(
  'Multiple paragraphs with newlines between',
  '<p>First</p>\n\n\n<p>Second</p>'
);
