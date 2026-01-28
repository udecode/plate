/**
 * Tests for Content Controls (Structured Document Tags)
 * Phase 5.2: All 9 content control types
 */

import { describe, test, expect } from '@jest/globals';
import { StructuredDocumentTag, ListItem } from '../../src/elements/StructuredDocumentTag';
import { Paragraph } from '../../src/elements/Paragraph';
import { Document } from '../../src/core/Document';

describe('ContentControls - Rich Text', () => {
  test('should create rich text control', () => {
    const para = new Paragraph().addText('Rich text content');
    const sdt = StructuredDocumentTag.createRichText([para]);

    expect(sdt.getControlType()).toBe('richText');
    expect(sdt.getContent()).toHaveLength(1);
  });

  test('should generate correct XML for rich text control', () => {
    const para = new Paragraph().addText('Rich text content');
    const sdt = StructuredDocumentTag.createRichText([para], { alias: 'RichTextControl' });

    const xml = sdt.toXML();

    expect(xml.name).toBe('w:sdt');
    expect(xml.children).toBeDefined();
    expect(xml.children!.length).toBeGreaterThan(0);

    // Find sdtPr
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );
    expect(sdtPr).toBeDefined();

    if (sdtPr && typeof sdtPr !== 'string') {
      const richTextElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:richText'
      );
      expect(richTextElement).toBeDefined();
    }
  });
});

describe('ContentControls - Plain Text', () => {
  test('should create plain text control', () => {
    const para = new Paragraph().addText('Plain text');
    const sdt = StructuredDocumentTag.createPlainText([para], false);

    expect(sdt.getControlType()).toBe('plainText');
    expect(sdt.getPlainTextProperties()).toEqual({ multiLine: false });
  });

  test('should create multiline plain text control', () => {
    const para = new Paragraph().addText('Line 1\nLine 2');
    const sdt = StructuredDocumentTag.createPlainText([para], true);

    expect(sdt.getControlType()).toBe('plainText');
    expect(sdt.getPlainTextProperties()).toEqual({ multiLine: true });
  });

  test('should generate correct XML for plain text control', () => {
    const para = new Paragraph().addText('Plain text');
    const sdt = StructuredDocumentTag.createPlainText([para], true);

    const xml = sdt.toXML();
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );

    if (sdtPr && typeof sdtPr !== 'string') {
      const textElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:text'
      );
      expect(textElement).toBeDefined();

      if (textElement && typeof textElement !== 'string') {
        expect(textElement.attributes!['w:multiLine']).toBe('1');
      }
    }
  });
});

describe('ContentControls - Combo Box', () => {
  const items: ListItem[] = [
    { displayText: 'Option 1', value: 'opt1' },
    { displayText: 'Option 2', value: 'opt2' },
    { displayText: 'Option 3', value: 'opt3' },
  ];

  test('should create combo box control', () => {
    const para = new Paragraph().addText('Select an option');
    const sdt = StructuredDocumentTag.createComboBox(items, [para]);

    expect(sdt.getControlType()).toBe('comboBox');
    expect(sdt.getComboBoxProperties()).toEqual({ items });
  });

  test('should generate correct XML for combo box control', () => {
    const para = new Paragraph().addText('Select an option');
    const sdt = StructuredDocumentTag.createComboBox(items, [para]);

    const xml = sdt.toXML();
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );

    if (sdtPr && typeof sdtPr !== 'string') {
      const comboBoxElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:comboBox'
      );
      expect(comboBoxElement).toBeDefined();

      if (comboBoxElement && typeof comboBoxElement !== 'string') {
        expect(comboBoxElement.children).toHaveLength(3);
      }
    }
  });
});

describe('ContentControls - Dropdown List', () => {
  const items: ListItem[] = [
    { displayText: 'First', value: '1' },
    { displayText: 'Second', value: '2' },
  ];

  test('should create dropdown list control', () => {
    const para = new Paragraph().addText('Choose one');
    const sdt = StructuredDocumentTag.createDropDownList(items, [para]);

    expect(sdt.getControlType()).toBe('dropDownList');
    expect(sdt.getDropDownListProperties()).toEqual({ items });
  });

  test('should generate correct XML for dropdown list control', () => {
    const para = new Paragraph().addText('Choose one');
    const sdt = StructuredDocumentTag.createDropDownList(items, [para]);

    const xml = sdt.toXML();
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );

    if (sdtPr && typeof sdtPr !== 'string') {
      const dropDownElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:dropDownList'
      );
      expect(dropDownElement).toBeDefined();

      if (dropDownElement && typeof dropDownElement !== 'string') {
        expect(dropDownElement.children).toHaveLength(2);
      }
    }
  });
});

describe('ContentControls - Date Picker', () => {
  test('should create date picker control', () => {
    const para = new Paragraph().addText('Select date');
    const sdt = StructuredDocumentTag.createDatePicker('MM/dd/yyyy', [para]);

    expect(sdt.getControlType()).toBe('datePicker');
    expect(sdt.getDatePickerProperties()).toEqual({ dateFormat: 'MM/dd/yyyy' });
  });

  test('should generate correct XML for date picker control', () => {
    const para = new Paragraph().addText('Select date');
    const sdt = StructuredDocumentTag.createDatePicker('MM/dd/yyyy', [para]);

    const xml = sdt.toXML();
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );

    if (sdtPr && typeof sdtPr !== 'string') {
      const dateElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:date'
      );
      expect(dateElement).toBeDefined();

      if (dateElement && typeof dateElement !== 'string') {
        expect(dateElement.attributes!['w:dateFormat']).toBe('MM/dd/yyyy');
      }
    }
  });

  test('should include full date in XML when provided', () => {
    const para = new Paragraph().addText('2025-10-23');
    const testDate = new Date('2025-10-23T00:00:00Z');
    const sdt = StructuredDocumentTag.createDatePicker('MM/dd/yyyy', [para]);
    sdt.setDatePickerProperties({ dateFormat: 'MM/dd/yyyy', fullDate: testDate });

    const xml = sdt.toXML();
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );

    if (sdtPr && typeof sdtPr !== 'string') {
      const dateElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:date'
      );

      if (dateElement && typeof dateElement !== 'string') {
        expect(dateElement.attributes!['w:fullDate']).toBeDefined();
      }
    }
  });
});

describe('ContentControls - Checkbox', () => {
  test('should create checkbox control - unchecked', () => {
    const para = new Paragraph().addText('☐ Option');
    const sdt = StructuredDocumentTag.createCheckbox(false, [para]);

    expect(sdt.getControlType()).toBe('checkbox');
    expect(sdt.getCheckboxProperties()?.checked).toBe(false);
  });

  test('should create checkbox control - checked', () => {
    const para = new Paragraph().addText('☒ Option');
    const sdt = StructuredDocumentTag.createCheckbox(true, [para]);

    expect(sdt.getControlType()).toBe('checkbox');
    expect(sdt.getCheckboxProperties()?.checked).toBe(true);
  });

  test('should generate correct XML for checkbox control', () => {
    const para = new Paragraph().addText('☒ Checked');
    const sdt = StructuredDocumentTag.createCheckbox(true, [para]);

    const xml = sdt.toXML();
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );

    if (sdtPr && typeof sdtPr !== 'string') {
      const checkboxElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w14:checkbox'
      );
      expect(checkboxElement).toBeDefined();

      if (checkboxElement && typeof checkboxElement !== 'string') {
        // Per OOXML spec, checkbox children use w14 namespace
        const checkedElement = checkboxElement.children!.find(
          (child) => typeof child !== 'string' && child.name === 'w14:checked'
        );
        expect(checkedElement).toBeDefined();

        if (checkedElement && typeof checkedElement !== 'string') {
          expect(checkedElement.attributes!['w14:val']).toBe('1');
        }
      }
    }
  });
});

describe('ContentControls - Picture', () => {
  test('should create picture control', () => {
    const para = new Paragraph().addText('[Image placeholder]');
    const sdt = StructuredDocumentTag.createPicture([para]);

    expect(sdt.getControlType()).toBe('picture');
  });

  test('should generate correct XML for picture control', () => {
    const para = new Paragraph().addText('[Image placeholder]');
    const sdt = StructuredDocumentTag.createPicture([para]);

    const xml = sdt.toXML();
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );

    if (sdtPr && typeof sdtPr !== 'string') {
      const pictureElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:picture'
      );
      expect(pictureElement).toBeDefined();
    }
  });
});

describe('ContentControls - Building Block', () => {
  test('should create building block control', () => {
    const para = new Paragraph().addText('Building block content');
    const sdt = StructuredDocumentTag.createBuildingBlock(
      'Quick Parts',
      'General',
      [para]
    );

    expect(sdt.getControlType()).toBe('buildingBlock');
    expect(sdt.getBuildingBlockProperties()).toEqual({
      gallery: 'Quick Parts',
      category: 'General',
    });
  });

  test('should generate correct XML for building block control', () => {
    const para = new Paragraph().addText('Building block content');
    const sdt = StructuredDocumentTag.createBuildingBlock(
      'Quick Parts',
      'General',
      [para]
    );

    const xml = sdt.toXML();
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );

    if (sdtPr && typeof sdtPr !== 'string') {
      const docPartElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:docPartObj'
      );
      expect(docPartElement).toBeDefined();

      if (docPartElement && typeof docPartElement !== 'string') {
        const galleryElement = docPartElement.children!.find(
          (child) => typeof child !== 'string' && child.name === 'w:docPartGallery'
        );
        expect(galleryElement).toBeDefined();

        if (galleryElement && typeof galleryElement !== 'string') {
          expect(galleryElement.attributes!['w:val']).toBe('Quick Parts');
        }
      }
    }
  });
});

describe('ContentControls - Group', () => {
  test('should create group control', () => {
    const para1 = new Paragraph().addText('Grouped content 1');
    const para2 = new Paragraph().addText('Grouped content 2');
    const sdt = StructuredDocumentTag.createGroup([para1, para2]);

    expect(sdt.getControlType()).toBe('group');
    expect(sdt.getLock()).toBe('sdtContentLocked');
    expect(sdt.getContent()).toHaveLength(2);
  });

  test('should generate correct XML for group control', () => {
    const para = new Paragraph().addText('Grouped content');
    const sdt = StructuredDocumentTag.createGroup([para]);

    const xml = sdt.toXML();
    const sdtPr = xml.children!.find(
      (child) => typeof child !== 'string' && child.name === 'w:sdtPr'
    );

    if (sdtPr && typeof sdtPr !== 'string') {
      const groupElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:group'
      );
      expect(groupElement).toBeDefined();

      const lockElement = sdtPr.children!.find(
        (child) => typeof child !== 'string' && child.name === 'w:lock'
      );
      expect(lockElement).toBeDefined();

      if (lockElement && typeof lockElement !== 'string') {
        expect(lockElement.attributes!['w:val']).toBe('sdtContentLocked');
      }
    }
  });
});

describe('ContentControls - Document Integration', () => {
  test('should create document with rich text control', async () => {
    const doc = Document.create();
    const para = new Paragraph().addText('Content control text');
    const sdt = StructuredDocumentTag.createRichText([para], {
      alias: 'TestControl',
    });

    doc.addStructuredDocumentTag(sdt);

    const buffer = await doc.toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  test('should create document with multiple control types', async () => {
    const doc = Document.create();

    // Rich text
    doc.addStructuredDocumentTag(
      StructuredDocumentTag.createRichText([new Paragraph().addText('Rich text')])
    );

    // Checkbox
    doc.addStructuredDocumentTag(
      StructuredDocumentTag.createCheckbox(true, [new Paragraph().addText('☒ Checked')])
    );

    // Dropdown
    const items: ListItem[] = [
      { displayText: 'Option 1', value: 'opt1' },
      { displayText: 'Option 2', value: 'opt2' },
    ];
    doc.addStructuredDocumentTag(
      StructuredDocumentTag.createDropDownList(items, [new Paragraph().addText('Dropdown')])
    );

    const buffer = await doc.toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
