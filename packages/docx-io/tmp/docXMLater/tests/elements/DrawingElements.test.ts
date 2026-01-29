/**
 * Tests for Shape and TextBox classes
 * Phase 5.4: Drawing Elements
 */

import { describe, it, expect } from '@jest/globals';
import { Shape, TextBox } from '../../src';
import { Paragraph } from '../../src/elements/Paragraph';
import { Document } from '../../src/core/Document';
import { inchesToEmus } from '../../src/utils/units';

describe('Shape', () => {
  describe('Factory Methods', () => {
    it('should create a rectangle shape', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));

      expect(rect).toBeDefined();
      expect(rect.getShapeType()).toBe('rect');
      expect(rect.getWidth()).toBe(inchesToEmus(2));
      expect(rect.getHeight()).toBe(inchesToEmus(1));
    });

    it('should create a circle shape', () => {
      const circle = Shape.createCircle(inchesToEmus(1.5));

      expect(circle).toBeDefined();
      expect(circle.getShapeType()).toBe('ellipse');
      expect(circle.getWidth()).toBe(inchesToEmus(1.5));
      expect(circle.getHeight()).toBe(inchesToEmus(1.5)); // Circle has equal width/height
    });

    it('should create an ellipse shape', () => {
      const ellipse = Shape.createEllipse(inchesToEmus(3), inchesToEmus(1.5));

      expect(ellipse).toBeDefined();
      expect(ellipse.getShapeType()).toBe('ellipse');
      expect(ellipse.getWidth()).toBe(inchesToEmus(3));
      expect(ellipse.getHeight()).toBe(inchesToEmus(1.5));
    });

    it('should create right arrow shape', () => {
      const arrow = Shape.createArrow('right', inchesToEmus(2), inchesToEmus(0.5));

      expect(arrow).toBeDefined();
      expect(arrow.getShapeType()).toBe('rightArrow');
      expect(arrow.getWidth()).toBe(inchesToEmus(2));
      expect(arrow.getHeight()).toBe(inchesToEmus(0.5));
    });

    it('should create left arrow shape', () => {
      const arrow = Shape.createArrow('left', inchesToEmus(2), inchesToEmus(0.5));

      expect(arrow).toBeDefined();
      expect(arrow.getShapeType()).toBe('leftArrow');
    });

    it('should create up arrow shape', () => {
      const arrow = Shape.createArrow('up', inchesToEmus(0.5), inchesToEmus(2));

      expect(arrow).toBeDefined();
      expect(arrow.getShapeType()).toBe('upArrow');
    });

    it('should create down arrow shape', () => {
      const arrow = Shape.createArrow('down', inchesToEmus(0.5), inchesToEmus(2));

      expect(arrow).toBeDefined();
      expect(arrow.getShapeType()).toBe('downArrow');
    });

    it('should create a line shape', () => {
      const line = Shape.createLine(inchesToEmus(3));

      expect(line).toBeDefined();
      expect(line.getShapeType()).toBe('straightConnector1');
      expect(line.getWidth()).toBe(inchesToEmus(3));
      expect(line.getHeight()).toBe(12700); // Default line height (~1pt)
    });
  });

  describe('Fill and Outline', () => {
    it('should set fill color', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setFill('FF0000');

      const fill = rect.getFill();
      expect(fill).toBeDefined();
      expect(fill?.color).toBe('FF0000');
      expect(fill?.transparency).toBeUndefined();
    });

    it('should set fill with transparency', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setFill('00FF00', 50);

      const fill = rect.getFill();
      expect(fill).toBeDefined();
      expect(fill?.color).toBe('00FF00');
      expect(fill?.transparency).toBe(50);
    });

    it('should set outline', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setOutline('0000FF', 12700, 'solid');

      const outline = rect.getOutline();
      expect(outline).toBeDefined();
      expect(outline?.color).toBe('0000FF');
      expect(outline?.width).toBe(12700);
      expect(outline?.style).toBe('solid');
    });

    it('should set dashed outline', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setOutline('000000', 6350, 'dash');

      const outline = rect.getOutline();
      expect(outline).toBeDefined();
      expect(outline?.style).toBe('dash');
    });
  });

  describe('Text in Shapes', () => {
    it('should add text to shape', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setText('Hello Shape');

      expect(rect.getText()).toBe('Hello Shape');
    });

    it('should add formatted text to shape', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setText('Bold Text', { bold: true, color: 'FF0000' });

      expect(rect.getText()).toBe('Bold Text');
    });
  });

  describe('Position and Rotation', () => {
    it('should set rotation', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setRotation(45);

      expect(rect.getRotation()).toBe(45);
    });

    it('should set position', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setPosition(
        { anchor: 'page', offset: inchesToEmus(1) },
        { anchor: 'page', offset: inchesToEmus(2) }
      );

      const pos = rect.getPosition();
      expect(pos).toBeDefined();
      expect(pos?.horizontal.anchor).toBe('page');
      expect(pos?.horizontal.offset).toBe(inchesToEmus(1));
      expect(pos?.vertical.anchor).toBe('page');
      expect(pos?.vertical.offset).toBe(inchesToEmus(2));
    });

    it('should identify floating shapes', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      expect(rect.isFloating()).toBe(false);

      rect.setPosition(
        { anchor: 'page', offset: inchesToEmus(1) },
        { anchor: 'page', offset: inchesToEmus(2) }
      );
      expect(rect.isFloating()).toBe(true);
    });
  });

  describe('XML Generation', () => {
    it('should generate XML for rectangle', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setFill('FF0000');

      const xml = rect.toXML();
      expect(xml).toBeDefined();
      expect(xml.name).toBe('w:drawing');
      expect(xml.children).toBeDefined();
      expect(xml.children!.length).toBeGreaterThan(0);
    });

    it('should generate XML for arrow with outline', () => {
      const arrow = Shape.createArrow('right', inchesToEmus(2), inchesToEmus(0.5));
      arrow.setFill('0000FF');
      arrow.setOutline('000000', 12700);

      const xml = arrow.toXML();
      expect(xml).toBeDefined();
      expect(xml.name).toBe('w:drawing');
    });

    it('should generate XML for shape with text', () => {
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
      rect.setText('Test Text', { bold: true });

      const xml = rect.toXML();
      expect(xml).toBeDefined();
    });
  });

  describe('Integration with Paragraph', () => {
    it('should add shape to paragraph', () => {
      const para = new Paragraph();
      const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));

      para.addShape(rect);

      const xml = para.toXML();
      expect(xml).toBeDefined();
      expect(xml.children).toBeDefined();
    });
  });
});

describe('TextBox', () => {
  describe('Factory Methods', () => {
    it('should create a text box', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));

      expect(textbox).toBeDefined();
      expect(textbox.getWidth()).toBe(inchesToEmus(3));
      expect(textbox.getHeight()).toBe(inchesToEmus(2));
    });
  });

  describe('Content Management', () => {
    it('should add paragraph to text box', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      const para = new Paragraph();
      para.addText('Hello TextBox');

      textbox.addParagraph(para);

      const paras = textbox.getParagraphs();
      expect(paras).toHaveLength(1);
      expect(paras[0]?.getText()).toBe('Hello TextBox');
    });

    it('should add multiple paragraphs', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      const para1 = new Paragraph();
      para1.addText('First paragraph');
      const para2 = new Paragraph();
      para2.addText('Second paragraph');

      textbox.addParagraph(para1).addParagraph(para2);

      const paras = textbox.getParagraphs();
      expect(paras).toHaveLength(2);
      expect(paras[0]?.getText()).toBe('First paragraph');
      expect(paras[1]?.getText()).toBe('Second paragraph');
    });
  });

  describe('Fill and Borders', () => {
    it('should set fill color', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      textbox.setFill('F0F0F0');

      const fill = textbox.getFill();
      expect(fill).toBeDefined();
      expect(fill?.color).toBe('F0F0F0');
    });

    it('should set fill with transparency', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      textbox.setFill('FFFF00', 30);

      const fill = textbox.getFill();
      expect(fill).toBeDefined();
      expect(fill?.transparency).toBe(30);
    });

    it('should set borders', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      textbox.setBorders({
        style: 'single',
        size: 1,
        color: '000000',
      });

      const borders = textbox.getBorders();
      expect(borders).toBeDefined();
      expect(borders?.style).toBe('single');
      expect(borders?.size).toBe(1);
      expect(borders?.color).toBe('000000');
    });
  });

  describe('Position', () => {
    it('should set position', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      textbox.setPosition(
        { anchor: 'margin', offset: inchesToEmus(0.5) },
        { anchor: 'margin', offset: inchesToEmus(1) }
      );

      const pos = textbox.getPosition();
      expect(pos).toBeDefined();
      expect(pos?.horizontal.anchor).toBe('margin');
      expect(pos?.vertical.anchor).toBe('margin');
    });

    it('should identify floating text boxes', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      expect(textbox.isFloating()).toBe(false);

      textbox.setAnchor({
        behindDoc: false,
        locked: false,
        layoutInCell: true,
        allowOverlap: false,
        relativeHeight: 251658240,
      });
      expect(textbox.isFloating()).toBe(true);
    });
  });

  describe('XML Generation', () => {
    it('should generate XML for empty text box', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));

      const xml = textbox.toXML();
      expect(xml).toBeDefined();
      expect(xml.name).toBe('w:drawing');
    });

    it('should generate XML for text box with content', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      const para = new Paragraph();
      para.addText('Test content');
      textbox.addParagraph(para);

      const xml = textbox.toXML();
      expect(xml).toBeDefined();
      expect(xml.children).toBeDefined();
    });

    it('should generate XML for text box with fill and borders', () => {
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      textbox.setFill('F0F0F0');
      textbox.setBorders({ style: 'single', size: 1, color: '000000' });

      const xml = textbox.toXML();
      expect(xml).toBeDefined();
    });
  });

  describe('Integration with Paragraph', () => {
    it('should add text box to paragraph', () => {
      const para = new Paragraph();
      const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
      const content = new Paragraph();
      content.addText('TextBox content');
      textbox.addParagraph(content);

      para.addTextBox(textbox);

      const xml = para.toXML();
      expect(xml).toBeDefined();
      expect(xml.children).toBeDefined();
    });
  });
});

describe('Shape and TextBox Round-Trip', () => {
  it('should create document with shapes and save', async () => {
    const doc = Document.create();
    const para = doc.createParagraph();

    // Add rectangle
    const rect = Shape.createRectangle(inchesToEmus(2), inchesToEmus(1));
    rect.setFill('FF0000');
    para.addShape(rect);

    // Add arrow
    const arrow = Shape.createArrow('right', inchesToEmus(1.5), inchesToEmus(0.5));
    arrow.setFill('0000FF');
    arrow.setOutline('000000', 6350);
    para.addShape(arrow);

    // Save document
    const buffer = await doc.toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should create document with text boxes and save', async () => {
    const doc = Document.create();
    const para = doc.createParagraph();

    // Add text box
    const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
    textbox.setFill('F0F0F0');

    const content = new Paragraph();
    content.addText('This is a text box', { bold: true });
    textbox.addParagraph(content);

    para.addTextBox(textbox);

    // Save document
    const buffer = await doc.toBuffer();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
