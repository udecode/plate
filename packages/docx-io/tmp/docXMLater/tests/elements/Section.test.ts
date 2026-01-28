/**
 * Tests for Section component
 */

import { Section, SectionType } from '../../src/elements/Section';
import { PAGE_SIZES } from '../../src/utils/units';
import { XMLElement } from '../../src/xml/XMLBuilder';

/**
 * Helper to filter and safely access XMLElement children
 */
function filterXMLElements(children?: (XMLElement | string)[]): XMLElement[] {
  return (children || []).filter((c): c is XMLElement => typeof c !== 'string');
}

describe('Section', () => {
  describe('Basic functionality', () => {
    it('should create section with default properties', () => {
      const section = new Section();
      const props = section.getProperties();

      expect(props.pageSize).toBeDefined();
      expect(props.pageSize?.width).toBe(PAGE_SIZES.LETTER.width);
      expect(props.pageSize?.height).toBe(PAGE_SIZES.LETTER.height);
      expect(props.pageSize?.orientation).toBe('portrait');

      expect(props.margins).toBeDefined();
      expect(props.margins?.top).toBe(1440);
      expect(props.margins?.bottom).toBe(1440);
      expect(props.margins?.left).toBe(1440);
      expect(props.margins?.right).toBe(1440);

      expect(props.columns?.count).toBe(1);
      expect(props.type).toBe('nextPage');
    });

    it('should create section with custom properties', () => {
      const section = new Section({
        pageSize: {
          width: PAGE_SIZES.A4.width,
          height: PAGE_SIZES.A4.height,
          orientation: 'landscape',
        },
        margins: {
          top: 720,
          bottom: 720,
          left: 720,
          right: 720,
        },
        type: 'continuous',
      });

      const props = section.getProperties();
      expect(props.pageSize?.width).toBe(PAGE_SIZES.A4.width);
      expect(props.pageSize?.height).toBe(PAGE_SIZES.A4.height);
      expect(props.pageSize?.orientation).toBe('landscape');
      expect(props.margins?.top).toBe(720);
      expect(props.type).toBe('continuous');
    });
  });

  describe('Page size', () => {
    it('should set page size', () => {
      const section = new Section();
      section.setPageSize(11906, 16838); // A4 in twips

      const props = section.getProperties();
      expect(props.pageSize?.width).toBe(11906);
      expect(props.pageSize?.height).toBe(16838);
    });

    it('should set page orientation', () => {
      const section = new Section();
      section.setOrientation('landscape');

      const props = section.getProperties();
      expect(props.pageSize?.orientation).toBe('landscape');
    });

    it('should swap dimensions for landscape orientation', () => {
      const section = new Section({
        pageSize: {
          width: 12240,
          height: 15840,
        },
      });

      section.setOrientation('landscape');
      const props = section.getProperties();
      expect(props.pageSize?.width).toBe(15840);
      expect(props.pageSize?.height).toBe(12240);
    });
  });

  describe('Margins', () => {
    it('should set margins', () => {
      const section = new Section();
      section.setMargins({
        top: 720,
        bottom: 720,
        left: 1080,
        right: 1080,
        header: 360,
        footer: 360,
      });

      const props = section.getProperties();
      expect(props.margins?.top).toBe(720);
      expect(props.margins?.bottom).toBe(720);
      expect(props.margins?.left).toBe(1080);
      expect(props.margins?.right).toBe(1080);
      expect(props.margins?.header).toBe(360);
      expect(props.margins?.footer).toBe(360);
    });

    it('should set gutter margin', () => {
      const section = new Section();
      section.setMargins({
        top: 1440,
        bottom: 1440,
        left: 1440,
        right: 1440,
        gutter: 720,
      });

      const props = section.getProperties();
      expect(props.margins?.gutter).toBe(720);
    });
  });

  describe('Columns', () => {
    it('should set column layout', () => {
      const section = new Section();
      section.setColumns(2, 360);

      const props = section.getProperties();
      expect(props.columns?.count).toBe(2);
      expect(props.columns?.space).toBe(360);
      expect(props.columns?.equalWidth).toBe(true);
    });

    it('should use default spacing for columns', () => {
      const section = new Section();
      section.setColumns(3);

      const props = section.getProperties();
      expect(props.columns?.count).toBe(3);
      expect(props.columns?.space).toBe(720);
    });
  });

  describe('Section type', () => {
    it('should set section type', () => {
      const section = new Section();
      section.setSectionType('continuous');

      const props = section.getProperties();
      expect(props.type).toBe('continuous');
    });

    it('should support all section types', () => {
      const types: SectionType[] = ['nextPage', 'continuous', 'evenPage', 'oddPage', 'nextColumn'];

      types.forEach(type => {
        const section = new Section();
        section.setSectionType(type);
        expect(section.getProperties().type).toBe(type);
      });
    });
  });

  describe('Page numbering', () => {
    it('should set page numbering start', () => {
      const section = new Section();
      section.setPageNumbering(5);

      const props = section.getProperties();
      expect(props.pageNumbering?.start).toBe(5);
    });

    it('should set page numbering format', () => {
      const section = new Section();
      section.setPageNumbering(1, 'upperRoman');

      const props = section.getProperties();
      expect(props.pageNumbering?.start).toBe(1);
      expect(props.pageNumbering?.format).toBe('upperRoman');
    });

    it('should set only format without start', () => {
      const section = new Section();
      section.setPageNumbering(undefined, 'lowerLetter');

      const props = section.getProperties();
      expect(props.pageNumbering?.start).toBeUndefined();
      expect(props.pageNumbering?.format).toBe('lowerLetter');
    });
  });

  describe('Headers and footers', () => {
    it('should set title page flag', () => {
      const section = new Section();
      section.setTitlePage(true);

      const props = section.getProperties();
      expect(props.titlePage).toBe(true);
    });

    it('should set header references', () => {
      const section = new Section();
      section.setHeaderReference('default', 'rId1');
      section.setHeaderReference('first', 'rId2');
      section.setHeaderReference('even', 'rId3');

      const props = section.getProperties();
      expect(props.headers?.default).toBe('rId1');
      expect(props.headers?.first).toBe('rId2');
      expect(props.headers?.even).toBe('rId3');
    });

    it('should set footer references', () => {
      const section = new Section();
      section.setFooterReference('default', 'rId4');
      section.setFooterReference('first', 'rId5');
      section.setFooterReference('even', 'rId6');

      const props = section.getProperties();
      expect(props.footers?.default).toBe('rId4');
      expect(props.footers?.first).toBe('rId5');
      expect(props.footers?.even).toBe('rId6');
    });
  });

  describe('Method chaining', () => {
    it('should support method chaining', () => {
      const section = new Section();
      const result = section
        .setPageSize(PAGE_SIZES.A4.width, PAGE_SIZES.A4.height)
        .setOrientation('landscape')
        .setMargins({
          top: 720,
          bottom: 720,
          left: 1080,
          right: 1080,
        })
        .setColumns(2)
        .setSectionType('continuous')
        .setPageNumbering(1, 'decimal')
        .setTitlePage(true);

      expect(result).toBe(section);

      const props = section.getProperties();
      expect(props.pageSize?.orientation).toBe('landscape');
      expect(props.margins?.top).toBe(720);
      expect(props.columns?.count).toBe(2);
      expect(props.type).toBe('continuous');
      expect(props.pageNumbering?.format).toBe('decimal');
      expect(props.titlePage).toBe(true);
    });
  });

  describe('XML generation', () => {
    it('should generate basic section XML', () => {
      const section = new Section();
      const xml = section.toXML();

      expect(xml.name).toBe('w:sectPr');
      expect(xml.children).toBeDefined();

      // Should have page size
      const xmlElements = filterXMLElements(xml.children);
      const pgSz = xmlElements.find(c => c.name === 'w:pgSz');
      expect(pgSz).toBeDefined();
      expect(pgSz?.attributes?.['w:w']).toBe(PAGE_SIZES.LETTER.width.toString());
      expect(pgSz?.attributes?.['w:h']).toBe(PAGE_SIZES.LETTER.height.toString());

      // Should have margins
      const pgMar = xmlElements.find(c => c.name === 'w:pgMar');
      expect(pgMar).toBeDefined();

      // Should have columns
      const cols = xmlElements.find(c => c.name === 'w:cols');
      expect(cols).toBeDefined();

      // Should have type
      const type = xmlElements.find(c => c.name === 'w:type');
      expect(type).toBeDefined();
    });

    it('should generate XML with landscape orientation', () => {
      const section = new Section();
      section.setOrientation('landscape');

      const xml = section.toXML();
      const pgSz = filterXMLElements(xml.children).find(c => c.name === 'w:pgSz');
      expect(pgSz?.attributes?.['w:orient']).toBe('landscape');
    });

    it('should generate XML with multiple columns', () => {
      const section = new Section();
      section.setColumns(3, 480);

      const xml = section.toXML();
      const cols = filterXMLElements(xml.children).find(c => c.name === 'w:cols');
      expect(cols?.attributes?.['w:num']).toBe('3');
      expect(cols?.attributes?.['w:space']).toBe('480');
      expect(cols?.attributes?.['w:equalWidth']).toBe('1');
    });

    it('should generate XML with page numbering', () => {
      const section = new Section();
      section.setPageNumbering(10, 'upperRoman');

      const xml = section.toXML();
      const pgNumType = filterXMLElements(xml.children).find(c => c.name === 'w:pgNumType');
      expect(pgNumType?.attributes?.['w:start']).toBe('10');
      expect(pgNumType?.attributes?.['w:fmt']).toBe('upperRoman');
    });

    it('should generate XML with title page', () => {
      const section = new Section();
      section.setTitlePage(true);

      const xml = section.toXML();
      const titlePg = filterXMLElements(xml.children).find(c => c.name === 'w:titlePg');
      expect(titlePg).toBeDefined();
    });

    it('should generate XML with headers and footers', () => {
      const section = new Section();
      section.setHeaderReference('default', 'rId1');
      section.setHeaderReference('first', 'rId2');
      section.setFooterReference('default', 'rId3');

      const xml = section.toXML();

      const headerRefs = filterXMLElements(xml.children).filter(c => c.name === 'w:headerReference');
      expect(headerRefs).toHaveLength(2);

      const defaultHeader = headerRefs.find(h => h.attributes?.['w:type'] === 'default');
      expect(defaultHeader?.attributes?.['r:id']).toBe('rId1');

      const firstHeader = headerRefs.find(h => h.attributes?.['w:type'] === 'first');
      expect(firstHeader?.attributes?.['r:id']).toBe('rId2');

      const footerRefs = filterXMLElements(xml.children).filter(c => c.name === 'w:footerReference');
      expect(footerRefs).toHaveLength(1);
      expect(footerRefs[0]?.attributes?.['r:id']).toBe('rId3');
    });

    it('should generate XML with gutter margin', () => {
      const section = new Section();
      section.setMargins({
        top: 1440,
        bottom: 1440,
        left: 1440,
        right: 1440,
        gutter: 720,
      });

      const xml = section.toXML();
      const pgMar = filterXMLElements(xml.children).find(c => c.name === 'w:pgMar');
      expect(pgMar?.attributes?.['w:gutter']).toBe('720');
    });
  });

  describe('clone()', () => {
    it('should create an independent clone with all properties', () => {
      const section = new Section({
        pageSize: { width: 11906, height: 16838, orientation: 'landscape' },
        margins: { top: 720, bottom: 720, left: 1080, right: 1080, header: 360, footer: 360, gutter: 144 },
        columns: { count: 2, space: 480, equalWidth: true, separator: true },
        type: 'continuous',
        pageNumbering: { start: 5, format: 'upperRoman' },
        headers: { default: 'rId1', first: 'rId2', even: 'rId3' },
        footers: { default: 'rId4', first: 'rId5', even: 'rId6' },
        titlePage: true,
        verticalAlignment: 'center',
        paperSource: { first: 1, other: 2 },
        textDirection: 'rtl',
      });

      const cloned = section.clone();

      // Verify cloned properties match
      const originalProps = section.getProperties();
      const clonedProps = cloned.getProperties();

      expect(clonedProps.pageSize).toEqual(originalProps.pageSize);
      expect(clonedProps.margins).toEqual(originalProps.margins);
      expect(clonedProps.columns).toEqual(originalProps.columns);
      expect(clonedProps.type).toBe(originalProps.type);
      expect(clonedProps.pageNumbering).toEqual(originalProps.pageNumbering);
      expect(clonedProps.headers).toEqual(originalProps.headers);
      expect(clonedProps.footers).toEqual(originalProps.footers);
      expect(clonedProps.titlePage).toBe(originalProps.titlePage);
      expect(clonedProps.verticalAlignment).toBe(originalProps.verticalAlignment);
      expect(clonedProps.paperSource).toEqual(originalProps.paperSource);
      expect(clonedProps.textDirection).toBe(originalProps.textDirection);
    });

    it('should create independent objects (not references)', () => {
      const section = new Section({
        pageSize: { width: 12240, height: 15840 },
        margins: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        columns: { count: 2, columnWidths: [5000, 6000] },
      });

      const cloned = section.clone();

      // Modify the clone
      cloned.setPageSize(11906, 16838);
      cloned.setMargins({ top: 720, bottom: 720, left: 720, right: 720 });
      cloned.setColumnWidths([3000, 4000, 5000]);

      // Original should be unchanged
      const originalProps = section.getProperties();
      expect(originalProps.pageSize?.width).toBe(12240);
      expect(originalProps.margins?.top).toBe(1440);
      expect(originalProps.columns?.columnWidths).toEqual([5000, 6000]);
    });

    it('should handle section with minimal properties', () => {
      const section = new Section();
      const cloned = section.clone();

      expect(cloned).toBeInstanceOf(Section);
      expect(cloned.getProperties().pageSize).toBeDefined();
      expect(cloned.getProperties().margins).toBeDefined();
    });

    it('should deep clone columnWidths array', () => {
      const section = new Section();
      section.setColumnWidths([3000, 4000, 5000]);

      const cloned = section.clone();

      // Modify original's columnWidths
      section.setColumnWidths([1000, 2000]);

      // Clone should still have original values
      expect(cloned.getProperties().columns?.columnWidths).toEqual([3000, 4000, 5000]);
    });
  });

  describe('Static factory methods', () => {
    it('should create section with default properties', () => {
      const section = Section.create();
      expect(section).toBeInstanceOf(Section);
      const props = section.getProperties();
      expect(props.pageSize?.width).toBe(PAGE_SIZES.LETTER.width);
    });

    it('should create letter-sized section', () => {
      const section = Section.createLetter();
      const props = section.getProperties();
      expect(props.pageSize?.width).toBe(PAGE_SIZES.LETTER.width);
      expect(props.pageSize?.height).toBe(PAGE_SIZES.LETTER.height);
      expect(props.pageSize?.orientation).toBe('portrait');
    });

    it('should create A4-sized section', () => {
      const section = Section.createA4();
      const props = section.getProperties();
      expect(props.pageSize?.width).toBe(PAGE_SIZES.A4.width);
      expect(props.pageSize?.height).toBe(PAGE_SIZES.A4.height);
      expect(props.pageSize?.orientation).toBe('portrait');
    });

    it('should create landscape letter section', () => {
      const section = Section.createLandscape('letter');
      const props = section.getProperties();
      expect(props.pageSize?.width).toBe(PAGE_SIZES.LETTER.height);
      expect(props.pageSize?.height).toBe(PAGE_SIZES.LETTER.width);
      expect(props.pageSize?.orientation).toBe('landscape');
    });

    it('should create landscape A4 section', () => {
      const section = Section.createLandscape('a4');
      const props = section.getProperties();
      expect(props.pageSize?.width).toBe(PAGE_SIZES.A4.height);
      expect(props.pageSize?.height).toBe(PAGE_SIZES.A4.width);
      expect(props.pageSize?.orientation).toBe('landscape');
    });

    it('should default to letter for landscape', () => {
      const section = Section.createLandscape();
      const props = section.getProperties();
      expect(props.pageSize?.width).toBe(PAGE_SIZES.LETTER.height);
      expect(props.pageSize?.height).toBe(PAGE_SIZES.LETTER.width);
    });
  });
});