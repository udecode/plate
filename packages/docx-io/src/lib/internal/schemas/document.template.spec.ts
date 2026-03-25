import generateDocumentTemplate from './document.template';

describe('generateDocumentTemplate', () => {
  it('renders page size, orientation, and page margins in the section props', () => {
    const xml = generateDocumentTemplate(100, 200, 'landscape', {
      bottom: 3,
      footer: 6,
      gutter: 7,
      header: 5,
      left: 4,
      right: 2,
      top: 1,
    });

    expect(xml).toContain('<w:sectPr>');
    expect(xml).toContain('w:pgSz w:w="100" w:h="200" w:orient="landscape"');
    expect(xml).toContain('w:top="1"');
    expect(xml).toContain('w:right="2"');
    expect(xml).toContain('w:bottom="3"');
    expect(xml).toContain('w:left="4"');
    expect(xml).toContain('w:header="5"');
    expect(xml).toContain('w:footer="6"');
    expect(xml).toContain('w:gutter="7"');
  });
});
