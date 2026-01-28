import { getExportedResult } from './export-helpers/index';

describe('ImageNodeExporter', async () => {
  window.URL.createObjectURL = vi.fn().mockImplementation((file) => {
    return file.name;
  });

  const fileName = 'image_doc.docx';
  const result = await getExportedResult(fileName);
  const body = {};

  beforeEach(() => {
    Object.assign(
      body,
      result.elements?.find((el) => el.name === 'w:body'),
    );
  });

  it('export image node correctly', () => {
    const imageNode = body.elements[0].elements[1].elements[0];
    expect(imageNode.elements[0].attributes.distT).toBe('0');
    expect(imageNode.elements[0].attributes.distB).toBe('0');
    expect(imageNode.elements[0].attributes.distL).toBe('0');
    expect(imageNode.elements[0].attributes.distR).toBe('0');

    expect(imageNode.elements[0].elements[0].attributes.cx).toBe(5734050);
    expect(imageNode.elements[0].elements[0].attributes.cy).toBe(8601075);

    expect(
      imageNode.elements[0].elements[4].elements[0].elements[0].elements[1].elements[0].attributes['r:embed'],
    ).toBe('rId4');
  });

  it('exports anchor image node correctly', async () => {});
});

describe('ImageNodeExporter anchor image', async () => {
  window.URL.createObjectURL = vi.fn().mockImplementation((file) => {
    return file.name;
  });

  const fileName = 'anchor_images.docx';
  const result = await getExportedResult(fileName);
  const body = {};

  beforeEach(() => {
    Object.assign(
      body,
      result.elements?.find((el) => el.name === 'w:body'),
    );
  });

  it('exports anchor image node correctly', async () => {
    const imageNode = body.elements[1].elements[4].elements[0];
    const anchorNode = imageNode.elements[0];

    expect(anchorNode.attributes).toHaveProperty('simplePos', '0');
    expect(anchorNode.elements[0].name).toBe('wp:simplePos');
    expect(anchorNode.elements[1].attributes.relativeFrom).toBe('margin');
    expect(anchorNode.elements[1].elements[0].name).toBe('wp:align');
    expect(anchorNode.elements[1].elements[0].elements[0].text).toBe('left');

    expect(anchorNode.elements[2].attributes.relativeFrom).toBe('margin');
    expect(anchorNode.elements[2].elements[0].name).toBe('wp:align');
    expect(anchorNode.elements[2].elements[0].elements[0].text).toBe('top');

    expect(anchorNode.elements[5].name).toBe('wp:wrapSquare');
    expect(anchorNode.elements[5].attributes.wrapText).toBe('bothSides');
  });
});
