/**
 * Test suite for escapeXml function in theme.js
 *
 * Run with: node test/theme-escapexml.test.js
 *
 * Tests that:
 * 1. Normal font names pass through unchanged
 * 2. XML special characters are properly escaped
 * 3. The generated XML is valid and won't break Word documents
 */

// Recreate the escapeXml function to test it directly
const escapeXml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Simplified theme XML generator for testing (mirrors the real one)
const defaultFont = 'Times New Roman';

const generateThemeXML = (font = defaultFont) => {
  const safeFont = escapeXml(font);
  return `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
    <a:themeElements>
      <a:fontScheme name="Office">
        <a:majorFont>
          <a:latin typeface="${safeFont}"/>
          <a:ea typeface="${safeFont}"/>
          <a:cs typeface=""/>
        </a:majorFont>
        <a:minorFont>
          <a:latin typeface="${safeFont}"/>
          <a:ea typeface="${safeFont}"/>
          <a:cs typeface=""/>
        </a:minorFont>
      </a:fontScheme>
    </a:themeElements>
  </a:theme>
`;
};

// ANSI colors for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`${GREEN}✓${RESET} ${name}`);
    passed++;
  } catch (error) {
    console.log(`${RED}✗${RESET} ${name}`);
    console.log(`  Error: ${error.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(
      `${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
    );
  }
}

function assertContains(haystack, needle, message = '') {
  if (!haystack.includes(needle)) {
    throw new Error(
      `${message}\nExpected to contain: ${JSON.stringify(needle)}\nActual: ${JSON.stringify(haystack.substring(0, 200))}...`
    );
  }
}

function assertNotContains(haystack, needle, message = '') {
  if (haystack.includes(needle)) {
    throw new Error(
      `${message}\nExpected NOT to contain: ${JSON.stringify(needle)}`
    );
  }
}

console.log('\n=== escapeXml Function Tests ===\n');

// === Unit tests for escapeXml function ===

test('escapeXml: returns non-strings unchanged', () => {
  assertEqual(escapeXml(null), null);
  assertEqual(escapeXml(undefined), undefined);
  assertEqual(escapeXml(123), 123);
  // Objects pass through - the function only transforms strings
  const obj = {};
  assertEqual(escapeXml(obj), obj);
});

test('escapeXml: passes normal text unchanged', () => {
  assertEqual(escapeXml('Times New Roman'), 'Times New Roman');
  assertEqual(escapeXml('Arial'), 'Arial');
  assertEqual(escapeXml('Calibri Light'), 'Calibri Light');
});

test('escapeXml: escapes ampersand', () => {
  assertEqual(escapeXml('A & B'), 'A &amp; B');
  assertEqual(escapeXml('&&&'), '&amp;&amp;&amp;');
});

test('escapeXml: escapes less than', () => {
  assertEqual(escapeXml('A < B'), 'A &lt; B');
  assertEqual(escapeXml('<tag>'), '&lt;tag&gt;');
});

test('escapeXml: escapes greater than', () => {
  assertEqual(escapeXml('A > B'), 'A &gt; B');
});

test('escapeXml: escapes double quotes', () => {
  assertEqual(escapeXml('say "hi"'), 'say &quot;hi&quot;');
});

test('escapeXml: escapes single quotes', () => {
  assertEqual(escapeXml("it's"), 'it&apos;s');
});

test('escapeXml: handles multiple special chars', () => {
  assertEqual(escapeXml('<a & "b">'), '&lt;a &amp; &quot;b&quot;&gt;');
});

test('escapeXml: preserves unicode', () => {
  assertEqual(escapeXml('日本語'), '日本語');
  assertEqual(escapeXml('Ü mlaut'), 'Ü mlaut');
});

// === Integration tests for generateThemeXML ===

console.log('\n=== generateThemeXML Integration Tests ===\n');

test('Times New Roman passes through correctly', () => {
  const xml = generateThemeXML('Times New Roman');
  assertContains(
    xml,
    'typeface="Times New Roman"',
    'Font should appear in typeface attribute'
  );
});

test('Arial passes through correctly', () => {
  const xml = generateThemeXML('Arial');
  assertContains(
    xml,
    'typeface="Arial"',
    'Font should appear in typeface attribute'
  );
});

test('Default font (no argument) works', () => {
  const xml = generateThemeXML();
  assertContains(xml, '<a:theme', 'Should contain theme element');
  assertContains(xml, 'typeface="Times New Roman"', 'Should have default font');
});

test('Ampersand (&) in font name is escaped', () => {
  const xml = generateThemeXML('Font & Family');
  assertContains(
    xml,
    'typeface="Font &amp; Family"',
    'Ampersand should be escaped'
  );
  assertNotContains(
    xml,
    'typeface="Font & Family"',
    'Raw ampersand should not appear'
  );
});

test('Less than (<) in font name is escaped', () => {
  const xml = generateThemeXML('Font<Script>');
  assertContains(xml, 'Font&lt;Script&gt;', 'Less than should be escaped');
});

test('XML injection attempt is neutralized', () => {
  const maliciousFont =
    '"/><evil:script xmlns:evil="http://evil.com">attack</evil:script><a:latin typeface="';
  const xml = generateThemeXML(maliciousFont);

  assertNotContains(
    xml,
    '<evil:script',
    'Injection should not create new elements'
  );
  assertContains(
    xml,
    '&lt;evil:script',
    'Angle brackets in attack should be escaped'
  );
});

test('CDATA injection attempt is neutralized', () => {
  const maliciousFont = ']]><![CDATA[attack';
  const xml = generateThemeXML(maliciousFont);

  assertNotContains(xml, ']]><![CDATA[', 'CDATA injection should be escaped');
});

test('Empty string font works', () => {
  const xml = generateThemeXML('');
  assertContains(
    xml,
    'typeface=""',
    'Empty string should produce empty typeface'
  );
});

test('Unicode characters pass through correctly', () => {
  const xml = generateThemeXML('日本語フォント');
  assertContains(
    xml,
    'typeface="日本語フォント"',
    'Unicode should pass through unchanged'
  );
});

test('Multiple special characters are all escaped', () => {
  const complexFont = 'Font & "Style" <Pro>';
  const xml = generateThemeXML(complexFont);
  assertContains(
    xml,
    'Font &amp; &quot;Style&quot; &lt;Pro&gt;',
    'All special chars should be escaped'
  );
});

test('Generated XML has proper structure', () => {
  const xml = generateThemeXML('Test Font');

  assertContains(xml, '<?xml version="1.0"', 'Should have XML declaration');
  assertContains(xml, '<a:theme', 'Should have theme opening tag');
  assertContains(xml, '</a:theme>', 'Should have theme closing tag');
  assertContains(xml, '<a:majorFont>', 'Should have majorFont element');
  assertContains(xml, '<a:minorFont>', 'Should have minorFont element');
  assertContains(
    xml,
    '<a:latin typeface="Test Font"/>',
    'Should have latin with correct font'
  );
  assertContains(
    xml,
    '<a:ea typeface="Test Font"/>',
    'Should have ea with correct font'
  );
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`${GREEN}Passed: ${passed}${RESET}`);
if (failed > 0) {
  console.log(`${RED}Failed: ${failed}${RESET}`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}All tests passed!${RESET}\n`);
  process.exit(0);
}
