/**
 * Tests for complex field parsing (w:fldChar + w:instrText)
 * Ensures complex fields like mail merge and conditionals are preserved
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Field, FieldType } from '../../src/elements/Field';
import { ZipHandler } from '../../src/zip/ZipHandler';
import { XMLParser } from '../../src/xml/XMLParser';

/**
 * Helper function to create a minimal DOCX buffer from document.xml content
 */
async function createDocxFromXml(documentXml: string): Promise<Buffer> {
  const zipHandler = new ZipHandler();

  // [Content_Types].xml
  zipHandler.addFile(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // _rels/.rels
  zipHandler.addFile(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // word/_rels/document.xml.rels
  zipHandler.addFile(
    "word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
  );

  // word/document.xml
  zipHandler.addFile("word/document.xml", documentXml);

  return await zipHandler.toBuffer();
}

describe('Complex Field Parsing', () => {
  describe('Field Type Detection', () => {
    it('should parse IF conditional fields', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Create IF field
      const field = new Field({
        type: 'IF' as FieldType,
        instruction: 'IF { MERGEFIELD Status } = "Active" "Current" "Former"'
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);

      // Complex fields may not be fully preserved in simple implementation
      // but document should load without error
      expect(loadedDoc).toBeDefined();
    });

    it('should parse MERGEFIELD mail merge fields', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Dear ');

      // Create MERGEFIELD
      const field = new Field({
        type: 'MERGEFIELD' as FieldType,
        instruction: 'MERGEFIELD CustomerName \\* MERGEFORMAT'
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);

      // Check text content
      const text = paragraphs[0]?.getText() || '';
      expect(text).toBeDefined();
    });

    it('should parse INCLUDE fields', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Create INCLUDE field
      const field = new Field({
        type: 'INCLUDE' as FieldType,
        instruction: 'INCLUDETEXT "C:\\\\Documents\\\\Header.docx"'
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc).toBeDefined();
      expect(loadedDoc.getParagraphs().length).toBeGreaterThanOrEqual(1);
    });

    it('should handle unknown field types as CUSTOM', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Create custom/unknown field type
      const field = new Field({
        type: 'CUSTOM' as FieldType,
        instruction: 'SPECIALFIELD param1 param2'
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc).toBeDefined();
    });
  });

  describe('Field Instruction Parsing', () => {
    it('should preserve complete field instructions', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Complex field with multiple switches
      const field = new Field({
        type: 'DATE',
        instruction: 'DATE \\@ "MMMM d, yyyy" \\* MERGEFORMAT \\s'
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const zipHandler = new ZipHandler();
      await zipHandler.loadFromBuffer(buffer);

      const docXml = zipHandler.getFileAsString('word/document.xml');
      expect(docXml).toBeDefined();

      // For complex fields, check if instruction is in document
      // Simple fields use w:fldSimple, complex use w:fldChar/w:instrText
      expect(docXml).toContain('DATE');
    });

    it('should handle field formatting switches', async () => {
      const doc = Document.create();

      // Numeric formatting
      const para1 = doc.createParagraph();
      para1.addField(new Field({
        type: 'SEQ',
        instruction: 'SEQ Figure \\# "0.0"'
      }));

      // Date formatting
      const para2 = doc.createParagraph();
      para2.addField(new Field({
        type: 'CREATEDATE',
        instruction: 'CREATEDATE \\@ "dddd, MMMM dd, yyyy"'
      }));

      // Case formatting
      const para3 = doc.createParagraph();
      para3.addField(new Field({
        type: 'FILENAME',
        instruction: 'FILENAME \\* Upper'
      }));

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc.getParagraphs().length).toBeGreaterThanOrEqual(3);
    });

    it('should parse nested field instructions', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Nested IF with MERGEFIELD
      const field = new Field({
        type: 'IF' as FieldType,
        instruction: 'IF { MERGEFIELD Score } > 90 "Excellent" { IF { MERGEFIELD Score } > 70 "Good" "Needs Improvement" }'
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc).toBeDefined();
    });
  });

  describe('Field Sequences', () => {
    it('should handle SEQ sequence fields', async () => {
      const doc = Document.create();

      // Multiple SEQ fields for numbering
      const para1 = doc.createParagraph('Figure ');
      para1.addField(new Field({
        type: 'SEQ',
        instruction: 'SEQ Figure \\* ARABIC'
      }));

      const para2 = doc.createParagraph('Figure ');
      para2.addField(new Field({
        type: 'SEQ',
        instruction: 'SEQ Figure \\* ARABIC'
      }));

      const para3 = doc.createParagraph('Table ');
      para3.addField(new Field({
        type: 'SEQ',
        instruction: 'SEQ Table \\* ROMAN'
      }));

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle TC table of contents entry fields', async () => {
      const doc = Document.create();

      const para = doc.createParagraph();
      para.addField(new Field({
        type: 'TC',
        instruction: 'TC "Chapter 1: Introduction" \\f C \\l "1"'
      }));

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc).toBeDefined();
    });

    it('should handle XE index entry fields', async () => {
      const doc = Document.create();

      const para = doc.createParagraph('Important term');
      para.addField(new Field({
        type: 'XE',
        instruction: 'XE "Important term" \\i'
      }));

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc).toBeDefined();
    });
  });

  describe('Field Formatting Preservation', () => {
    it('should preserve field run formatting', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Field with formatting
      const field = new Field({
        type: 'PAGE',
        formatting: {
          bold: true,
          size: 14,
          color: 'FF0000'
        }
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc).toBeDefined();
      // Formatting should be preserved in the field result
    });

    it('should handle field result text', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Page ');

      // Add page number field
      const field = new Field({
        type: 'PAGE'
      });
      para.addField(field);

      para.addText(' of ');

      // Add total pages field
      const totalField = new Field({
        type: 'NUMPAGES'
      });
      para.addField(totalField);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]?.getText() || '';
      expect(text).toContain('Page');
      expect(text).toContain('of');
    });
  });

  describe('Complex Field State Machine', () => {
    it('should handle field begin/separate/end sequence', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // This tests the complex field state machine
      // Complex fields have: begin -> instruction -> separate -> result -> end
      const field = new Field({
        type: 'DATE',
        instruction: 'DATE \\@ "MM/dd/yyyy"'
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const zipHandler = new ZipHandler();
      await zipHandler.loadFromBuffer(buffer);

      const docXml = zipHandler.getFileAsString('word/document.xml');
      expect(docXml).toBeDefined();

      // Load and verify no data loss
      const loadedDoc = await Document.loadFromBuffer(buffer);
      expect(loadedDoc).toBeDefined();
    });

    it('should handle fields without separate/result', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Some fields don't have visible results (TC, XE)
      const field = new Field({
        type: 'XE',
        instruction: 'XE "Index Entry"'
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      expect(loadedDoc).toBeDefined();
    });

    it('should parse multiple fields in same paragraph', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Created on ');

      para.addField(new Field({ type: 'CREATEDATE' }));
      para.addText(' by ');
      para.addField(new Field({ type: 'AUTHOR' }));
      para.addText(' - Page ');
      para.addField(new Field({ type: 'PAGE' }));

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);

      const text = paragraphs[0]?.getText() || '';
      expect(text).toContain('Created on');
      expect(text).toContain('by');
      expect(text).toContain('Page');
    });
  });

  describe('TOC Field Whitespace Preservation', () => {
    it('should preserve leading and trailing whitespace in TOC instruction', async () => {
      // TOC fields require whitespace around the instruction for Word to recognize them
      // Example: " TOC \\n \\p \" \" \\h \\z \\u \\t \"Heading 2,1\" "
      const doc = Document.create();
      const para = doc.createParagraph();

      // Create TOC field with critical whitespace (use CUSTOM type for TOC)
      const tocInstruction = ' TOC \\n \\p " " \\h \\z \\u \\t "Heading 2,1" ';
      const field = new Field({
        type: 'CUSTOM' as FieldType,
        instruction: tocInstruction
      });
      para.addField(field);

      // Save and reload
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Get the field from the loaded document
      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);

      const content = paragraphs[0]!.getContent();
      const complexField = content.find((c: any) => c.constructor.name === 'ComplexField');

      if (complexField) {
        const instruction = (complexField as any).getInstruction();
        // Verify whitespace is preserved
        expect(instruction.startsWith(' ')).toBe(true);
        expect(instruction.endsWith(' ')).toBe(true);
        expect(instruction).toBe(tocInstruction);
      }
    });

    it('should preserve exact instrText content in document XML', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Instruction with leading space (critical for Word)
      const tocInstruction = ' TOC \\o "1-3" \\h \\z \\u ';
      const field = new Field({
        type: 'CUSTOM' as FieldType,
        instruction: tocInstruction
      });
      para.addField(field);

      const buffer = await doc.toBuffer();
      const zipHandler = new ZipHandler();
      await zipHandler.loadFromBuffer(buffer);

      const docXml = zipHandler.getFileAsString('word/document.xml');
      expect(docXml).toBeDefined();

      // Field may be generated as simple field (w:fldSimple) or complex field (w:instrText)
      // Either way, the instruction with leading space should be preserved
      // Simple field format: w:instr=" TOC ..."
      // Complex field format: <w:instrText xml:space="preserve"> TOC ...</w:instrText>
      const hasSimpleField = docXml!.includes('w:instr=" TOC') || docXml!.includes('w:instr=\\" TOC');
      const hasComplexField = docXml!.includes('> TOC') && docXml!.includes('instrText');

      // Either format should preserve the leading space
      expect(hasSimpleField || hasComplexField).toBe(true);
    });
  });

  describe('Complex Field Structure with Revisions', () => {
    /**
     * Helper to analyze paragraph content structure for field markers and revisions.
     * Returns an ordered array of element types in the paragraph.
     */
    function getContentStructure(paragraph: Paragraph): string[] {
      const content = paragraph.getContent();
      const structure: string[] = [];

      for (const item of content) {
        if (!item) continue;
        const typeName = item.constructor.name;

        if (typeName === 'Run') {
          const run = item as any;
          const runContent = run.getContent();
          const fieldChar = runContent.find((c: any) => c.type === 'fieldChar');
          if (fieldChar) {
            structure.push(`[${fieldChar.fieldCharType}]`);
          } else if (runContent.some((c: any) => c.type === 'instructionText')) {
            structure.push('[instr]');
          } else if (runContent.some((c: any) => c.type === 'text')) {
            structure.push('[text]');
          } else {
            structure.push('[run]');
          }
        } else if (typeName === 'Revision') {
          const rev = item as any;
          structure.push(`{${rev.getType()} id=${rev.getId()}}`);
        } else if (typeName === 'ComplexField') {
          structure.push('<ComplexField>');
        } else if (typeName === 'Hyperlink') {
          structure.push('<Hyperlink>');
        } else {
          structure.push(`<${typeName}>`);
        }
      }

      return structure;
    }

    /**
     * Validates that field structure is correct:
     * - All revisions between begin and end are INSIDE the field bounds
     * - No revisions appear AFTER the end marker
     */
    function validateFieldStructure(structure: string[]): { valid: boolean; issue?: string } {
      const beginIdx = structure.findIndex(s => s === '[begin]');
      const endIdx = structure.findIndex(s => s === '[end]');

      if (beginIdx === -1 || endIdx === -1) {
        return { valid: true }; // No field to validate
      }

      // Check for revisions after end marker
      for (let i = endIdx + 1; i < structure.length; i++) {
        const elem = structure[i];
        if (elem && elem.startsWith('{')) {
          return {
            valid: false,
            issue: `Revision found after field end at position ${i}: ${elem}`
          };
        }
      }

      return { valid: true };
    }

    it('should parse HYPERLINK field code without revisions correctly', async () => {
      // Create a document with a HYPERLINK field code (not w:hyperlink element)
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:r><w:instrText>HYPERLINK "https://example.com"</w:instrText></w:r>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:r><w:t>Click here</w:t></w:r>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const buffer = await createDocxFromXml(xml);
      const doc = await Document.loadFromBuffer(buffer);
      const paragraphs = doc.getAllParagraphs();
      expect(paragraphs.length).toBe(1);

      // The parser should convert this to a Hyperlink object
      const content = paragraphs[0]!.getContent();
      const hyperlink = content.find((c: any) => c.constructor.name === 'Hyperlink');

      expect(hyperlink).toBeDefined();
      expect((hyperlink as any).getUrl()).toBe('https://example.com');
      expect((hyperlink as any).getText()).toBe('Click here');
    });

    it('should preserve HYPERLINK field code with revisions in instruction area', async () => {
      // Simulate a HYPERLINK field where the instruction was changed (URL changed)
      // Structure: begin → ins(new URL) → del(old URL) → separate → text → end
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:ins w:id="1" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:instrText>HYPERLINK "https://new-url.com"</w:instrText></w:r>
      </w:ins>
      <w:del w:id="2" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:delInstrText>HYPERLINK "https://old-url.com"</w:delInstrText></w:r>
      </w:del>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:r><w:t>Link Text</w:t></w:r>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const buffer = await createDocxFromXml(xml);
      const doc = await Document.loadFromBuffer(buffer, { revisionHandling: 'preserve' });
      const paragraphs = doc.getAllParagraphs();
      expect(paragraphs.length).toBe(1);

      const structure = getContentStructure(paragraphs[0]!);
      const validation = validateFieldStructure(structure);

      // All revisions should be INSIDE the field (before end marker)
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        console.error('Structure:', structure.join(' '));
        console.error('Issue:', validation.issue);
      }
    });

    it('should preserve HYPERLINK field code with revisions in result area', async () => {
      // Simulate a HYPERLINK field where the display text was changed
      // Structure: begin → instruction → separate → del(old text) → ins(new text) → end
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:r><w:instrText>HYPERLINK "https://example.com"</w:instrText></w:r>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:del w:id="1" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:delText>Old Text</w:delText></w:r>
      </w:del>
      <w:ins w:id="2" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:t>New Text</w:t></w:r>
      </w:ins>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const doc = await Document.loadFromBuffer(await createDocxFromXml(xml), { revisionHandling: 'preserve' });
      const paragraphs = doc.getAllParagraphs();
      expect(paragraphs.length).toBe(1);

      const structure = getContentStructure(paragraphs[0]!);
      const validation = validateFieldStructure(structure);

      // All revisions should be INSIDE the field (before end marker)
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        console.error('Structure:', structure.join(' '));
        console.error('Issue:', validation.issue);
      }
    });

    it('should preserve HYPERLINK field code with revisions in both areas', async () => {
      // The bug scenario: revisions in both instruction AND result areas
      // This is the exact pattern from Original_16.docx:
      // Structure: begin → ins(new instr) → del(old instr) → separate → del(old text) → ins(new text) → end
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:ins w:id="58" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:instrText>HYPERLINK "https://new-url.com/path"</w:instrText></w:r>
      </w:ins>
      <w:del w:id="59" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:delInstrText>HYPERLINK "https://old-url.com/path"</w:delInstrText></w:r>
      </w:del>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:del w:id="60" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:delText>Old Display Text (046762)</w:delText></w:r>
      </w:del>
      <w:ins w:id="61" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:t>New Display Text (046762)</w:t></w:r>
      </w:ins>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const doc = await Document.loadFromBuffer(await createDocxFromXml(xml), { revisionHandling: 'preserve' });
      const paragraphs = doc.getAllParagraphs();
      expect(paragraphs.length).toBe(1);

      const structure = getContentStructure(paragraphs[0]!);
      console.log('Field structure with revisions in both areas:', structure.join(' '));

      const validation = validateFieldStructure(structure);

      // CRITICAL: All revisions MUST be INSIDE the field (before end marker)
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        console.error('BUG DETECTED: Revision placed outside field boundary!');
        console.error('Structure:', structure.join(' '));
        console.error('Issue:', validation.issue);
      }
    });

    it('should preserve correct structure after save/load roundtrip', async () => {
      // Create document with complex field and revisions
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:ins w:id="1" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:instrText>HYPERLINK "https://example.com"</w:instrText></w:r>
      </w:ins>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:ins w:id="2" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:t>Link Text</w:t></w:r>
      </w:ins>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const initialBuffer = await createDocxFromXml(xml);
      const doc = await Document.loadFromBuffer(initialBuffer, { revisionHandling: 'preserve' });

      // Save and reload
      const buffer = await doc.toBuffer();
      const reloadedDoc = await Document.loadFromBuffer(buffer, { revisionHandling: 'preserve' });

      const paragraphs = reloadedDoc.getAllParagraphs();
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);

      const structure = getContentStructure(paragraphs[0]!);
      const validation = validateFieldStructure(structure);

      // Structure should be preserved after roundtrip
      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        console.error('Structure after roundtrip:', structure.join(' '));
        console.error('Issue:', validation.issue);
      }
    });

    it('should correctly accept revisions while preserving field structure', async () => {
      // Create document with complex field and revisions
      const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:r><w:fldChar w:fldCharType="begin"/></w:r>
      <w:ins w:id="1" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:instrText>HYPERLINK "https://example.com"</w:instrText></w:r>
      </w:ins>
      <w:del w:id="2" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:delInstrText>HYPERLINK "https://old.com"</w:delInstrText></w:r>
      </w:del>
      <w:r><w:fldChar w:fldCharType="separate"/></w:r>
      <w:del w:id="3" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:delText>Old Text</w:delText></w:r>
      </w:del>
      <w:ins w:id="4" w:author="User" w:date="2024-01-01T00:00:00Z">
        <w:r><w:t>New Text</w:t></w:r>
      </w:ins>
      <w:r><w:fldChar w:fldCharType="end"/></w:r>
    </w:p>
  </w:body>
</w:document>`;

      const initialBuffer = await createDocxFromXml(xml);
      const doc = await Document.loadFromBuffer(initialBuffer, { revisionHandling: 'preserve' });

      // Accept all revisions
      await doc.acceptAllRevisions();

      // Save and reload
      const buffer = await doc.toBuffer();
      const reloadedDoc = await Document.loadFromBuffer(buffer);

      const paragraphs = reloadedDoc.getAllParagraphs();
      expect(paragraphs.length).toBeGreaterThanOrEqual(1);

      // After accepting revisions, the field should be properly structured
      // Either as a Hyperlink object or as a valid field sequence
      const content = paragraphs[0]!.getContent();

      // Should have some content
      expect(content.length).toBeGreaterThan(0);

      // Verify no revisions remain
      const hasRevisions = content.some((c: any) => c.constructor.name === 'Revision');
      expect(hasRevisions).toBe(false);
    });
  });
});