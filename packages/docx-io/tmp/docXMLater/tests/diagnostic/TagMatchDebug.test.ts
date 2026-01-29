import { describe, it } from '@jest/globals';
import { XMLParser } from '../../src/xml/XMLParser';

describe('Tag Match Debug', () => {
  it('should debug tag matching', () => {
    const xml = `<w:p w:rsidR="00000000"><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Text</w:t></w:r></w:p>`;

    console.log('\n=== Testing tag extraction ===');
    console.log(`XML: ${xml}`);

    // Test w:p extraction
    const tagName = 'w:p';
    const openTag = `<${tagName}`;
    console.log(`\nLooking for tag: "${tagName}"`);
    console.log(`Search string: "${openTag}"`);

    // Find all occurrences
    let pos = 0;
    let count = 0;
    while (pos < xml.length) {
      const idx = xml.indexOf(openTag, pos);
      if (idx === -1) break;

      count++;
      const charAfter = xml[idx + openTag.length];
      const charCode = charAfter ? charAfter.charCodeAt(0) : -1;
      const next10 = xml.substring(idx, idx + 20);

      console.log(`\nMatch ${count} at position ${idx}:`);
      console.log(`  Next 20 chars: "${next10}"`);
      console.log(`  Char after tag: "${charAfter}" (code: ${charCode})`);
      console.log(`  Is '>': ${charAfter === '>'}`);
      console.log(`  Is ' ': ${charAfter === ' '}`);
      console.log(`  Is '/': ${charAfter === '/'}`);

      pos = idx + openTag.length;
    }

    console.log(`\nTotal potential matches: ${count}`);

    // Now test actual extraction
    const elements = XMLParser.extractElements(xml, 'w:p');
    console.log(`\nExtractElements found: ${elements.length} elements`);
    for (let i = 0; i < elements.length; i++) {
      console.log(`Element ${i + 1}: ${elements[i]?.substring(0, 100)}`);
    }
  });
});
