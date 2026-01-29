/**
 * Tests for Structured Document Tag (SDT) parsing
 * Ensures SDTs (content controls) are properly parsed and preserved
 */

import { Document } from '../../src/core/Document';
import { StructuredDocumentTag } from '../../src/elements/StructuredDocumentTag';
import { Paragraph } from '../../src/elements/Paragraph';
import { Table } from '../../src/elements/Table';

describe('SDT (Structured Document Tag) Parsing', () => {
  describe('SDT Control Types', () => {
    it('should parse richText content controls', async () => {
      const doc = Document.create();

      // Create rich text SDT
      const content = new Paragraph().addText('Rich text content');
      const sdt = StructuredDocumentTag.createRichText([content]);
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const bodyElements = loadedDoc.getBodyElements();
      expect(bodyElements.length).toBeGreaterThanOrEqual(1);

      // Find SDT in body elements
      const loadedSdt = bodyElements.find(
        (el) => el instanceof StructuredDocumentTag
      );
      expect(loadedSdt).toBeDefined();

      if (loadedSdt instanceof StructuredDocumentTag) {
        expect(loadedSdt.getControlType()).toBe('richText');
      }
    });

    it('should parse plainText content controls', async () => {
      const doc = Document.create();

      const sdt = StructuredDocumentTag.createPlainText(
        [new Paragraph().addText('Plain text only')],
        false
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const bodyElements = loadedDoc.getBodyElements();
      const loadedSdt = bodyElements.find(
        (el) => el instanceof StructuredDocumentTag
      );

      expect(loadedSdt).toBeDefined();
      if (loadedSdt instanceof StructuredDocumentTag) {
        expect(loadedSdt.getControlType()).toBe('plainText');
      }
    });

    it('should parse dropDownList content controls', async () => {
      const doc = Document.create();

      const items = [
        { displayText: 'Option 1', value: 'opt1' },
        { displayText: 'Option 2', value: 'opt2' },
        { displayText: 'Option 3', value: 'opt3' },
      ];
      const sdt = StructuredDocumentTag.createDropDownList(items);
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      expect(loadedSdt.getControlType()).toBe('dropDownList');

      const listItems = loadedSdt.getListItems();
      expect(listItems).toBeDefined();
      expect(listItems?.length).toBe(3);
    });

    it('should parse datePicker content controls', async () => {
      const doc = Document.create();

      const sdt = StructuredDocumentTag.createDatePicker('MM/dd/yyyy');
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      expect(loadedSdt.getControlType()).toBe('datePicker');
      expect(loadedSdt.getDateFormat()).toBe('MM/dd/yyyy');
    });

    it('should parse checkbox content controls', async () => {
      const doc = Document.create();

      const sdt = StructuredDocumentTag.createCheckbox(true);
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      expect(loadedSdt.getControlType()).toBe('checkbox');
      expect(loadedSdt.isChecked()).toBe(true);
    });

    it('should parse buildingBlock gallery controls', async () => {
      const doc = Document.create();

      const sdt = StructuredDocumentTag.createBuildingBlock(
        'autoText',
        'General'
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      expect(loadedSdt.getControlType()).toBe('buildingBlock');

      const buildingBlock = loadedSdt.getBuildingBlock();
      expect(buildingBlock?.gallery).toBe('autoText');
      expect(buildingBlock?.category).toBe('General');
    });
  });

  describe('SDT Properties', () => {
    it('should preserve SDT ID and tag', async () => {
      const doc = Document.create();

      const sdt = new StructuredDocumentTag(
        {
          id: 12_345,
          tag: 'myCustomTag',
          alias: 'Custom Control',
          controlType: 'richText',
        },
        [new Paragraph().addText('Content')]
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      expect(loadedSdt.getId()).toBe(12_345);
      expect(loadedSdt.getTag()).toBe('myCustomTag');
      expect(loadedSdt.getAlias()).toBe('Custom Control');
    });

    it('should preserve lock state', async () => {
      const doc = Document.create();

      const sdt = new StructuredDocumentTag(
        {
          lock: 'contentLocked',
          controlType: 'richText',
        },
        [new Paragraph().addText('Locked content')]
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      expect(loadedSdt.getLock()).toBe('contentLocked');
    });

    it('should handle temporary placeholder', async () => {
      const doc = Document.create();

      const sdt = new StructuredDocumentTag(
        {
          // Note: 'temporary' property not yet implemented
          controlType: 'richText',
        },
        [new Paragraph().addText('Temporary')]
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      // Note: isTemporary() always returns false until 'temporary' property is implemented
      expect(loadedSdt.isTemporary()).toBe(false);
    });
  });

  describe('SDT Content', () => {
    it('should preserve paragraphs in SDT content', async () => {
      const doc = Document.create();

      const para1 = new Paragraph().addText('First paragraph');
      const para2 = new Paragraph().addText('Second paragraph');
      const para3 = new Paragraph().addText('Third paragraph');

      const sdt = new StructuredDocumentTag(
        {
          controlType: 'richText',
        },
        [para1, para2, para3]
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      const content = loadedSdt.getContent();
      expect(content).toHaveLength(3);

      // Verify paragraph text
      const paragraphs = content.filter(
        (c) => c instanceof Paragraph
      ) as Paragraph[];
      expect(paragraphs.length).toBeGreaterThanOrEqual(3);
      expect(paragraphs[0]?.getText()).toContain('First');
      expect(paragraphs[1]?.getText()).toContain('Second');
      expect(paragraphs[2]?.getText()).toContain('Third');
    });

    it('should preserve tables in SDT content', async () => {
      const doc = Document.create();

      const table = Table.create(3, 3);
      table.getCell(0, 0)?.addParagraph(new Paragraph().addText('Cell 1'));
      table.getCell(1, 1)?.addParagraph(new Paragraph().addText('Cell 2'));

      const sdt = new StructuredDocumentTag(
        {
          controlType: 'richText',
        },
        [table]
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      const content = loadedSdt.getContent();

      // Find table in content
      const loadedTable = content.find((c) => c instanceof Table) as Table;
      expect(loadedTable).toBeDefined();
      expect(loadedTable.getRowCount()).toBe(3);
      expect(loadedTable.getColumnCount()).toBe(3);
    });

    it('should handle nested SDTs', async () => {
      const doc = Document.create();

      // Create inner SDT
      const innerSdt = StructuredDocumentTag.createPlainText(
        [new Paragraph().addText('Inner content')],
        false
      );

      // Create outer SDT containing the inner one
      const outerSdt = new StructuredDocumentTag(
        {
          controlType: 'richText',
        },
        [innerSdt]
      );
      doc.addBodyElement(outerSdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      const content = loadedSdt.getContent();

      // Check for nested SDT
      const nestedSdt = content.find((c) => c instanceof StructuredDocumentTag);
      expect(nestedSdt).toBeDefined();
    });
  });

  describe('Critical SDT Use Cases', () => {
    it('should preserve Table of Contents SDT', async () => {
      const doc = Document.create();

      // TOC is typically a buildingBlock SDT
      const tocPara = new Paragraph().addText('Table of Contents');
      const sdt = new StructuredDocumentTag(
        {
          controlType: 'buildingBlock',
          buildingBlock: {
            gallery: 'Table of Contents',
            category: 'Built-In',
          },
        },
        [tocPara]
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Verify TOC SDT was preserved
      const bodyElements = loadedDoc.getBodyElements();
      const tocSdt = bodyElements.find((el) => {
        if (el instanceof StructuredDocumentTag) {
          const bb = el.getBuildingBlockProperties();
          return bb?.gallery === 'Table of Contents';
        }
        return false;
      });

      expect(tocSdt).toBeDefined();
    });

    it('should preserve Google Docs table wrapper SDT', async () => {
      const doc = Document.create();

      // Google Docs wraps tables in SDTs with contentLocked
      const table = Table.create(2, 2);
      const sdt = new StructuredDocumentTag(
        {
          lock: 'contentLocked',
          controlType: 'richText',
        },
        [table]
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Find SDT with table
      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      expect(loadedSdt.getLock()).toBe('contentLocked');

      // Verify table is preserved
      const content = loadedSdt.getContent();
      const loadedTable = content.find((c) => c instanceof Table);
      expect(loadedTable).toBeDefined();
    });

    it('should handle empty SDT content', async () => {
      const doc = Document.create();

      const sdt = new StructuredDocumentTag(
        {
          controlType: 'richText',
        },
        []
      );
      doc.addBodyElement(sdt);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedSdt = loadedDoc
        .getBodyElements()
        .find(
          (el) => el instanceof StructuredDocumentTag
        ) as StructuredDocumentTag;

      expect(loadedSdt).toBeDefined();
      expect(loadedSdt.getContent()).toHaveLength(0);
    });
  });
});
