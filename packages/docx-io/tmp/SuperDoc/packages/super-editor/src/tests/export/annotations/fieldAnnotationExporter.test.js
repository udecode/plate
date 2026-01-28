import { getExportedResultForAnnotations, getTextFromNode } from '../export-helpers/index.js';

describe('AnnotationNodeExporter', async () => {
  window.URL.createObjectURL = vi.fn().mockImplementation((file) => {
    return file.name;
  });

  const { result, params } = await getExportedResultForAnnotations(false);
  const body = {};

  beforeEach(() => {
    Object.assign(
      body,
      result.elements?.find((el) => el.name === 'w:body'),
    );
  });

  it('export text annotation correctly', async () => {
    const fieldElements = body.elements[0].elements[1].elements[0].elements;
    const tagValue = fieldElements.find((f) => f.name === 'w:tag')?.attributes['w:val'];
    const attrs = parseTagAttrsJSON(tagValue);

    expect(attrs.fieldTypeShort).toBe('text');

    const text = getTextFromNode(body.elements[0].elements[1].elements[1]);
    expect(text).toEqual('Vladyslava Andrushchenko');
  });

  it('export image annotation correctly', async () => {
    const tag = body.elements[2].elements[1].elements[0];

    const fieldElements = body.elements[2].elements[1].elements[0].elements;
    const tagValue = fieldElements.find((f) => f.name === 'w:tag')?.attributes['w:val'];
    const attrs = parseTagAttrsJSON(tagValue);

    expect(attrs.fieldTypeShort).toBe('image');

    const node = body.elements[2].elements[1].elements[1].elements;
    const run = node.find((el) => el.name === 'w:r');
    const drawing = run.elements.find((el) => el.name === 'w:drawing');
    const inline = drawing.elements.find((el) => el.name === 'wp:inline');
    const extent = inline.elements.find((el) => el.name === 'wp:extent');
    const docPr = inline.elements.find((el) => el.name === 'wp:docPr');
    const graphic = inline.elements.find((el) => el.name === 'a:graphic');
    const graphicData = graphic.elements.find((el) => el.name === 'a:graphicData');
    const pic = graphicData.elements.find((el) => el.name === 'pic:pic');
    const blipFill = pic.elements.find((el) => el.name === 'pic:blipFill');
    const blip = blipFill.elements.find((el) => el.name === 'a:blip');
    const rId = blip.attributes['r:embed'];
    expect(rId).toBeDefined();

    expect(extent.attributes.cx).toBe(4286250);
    expect(extent.attributes.cy).toBe(4286250);
    const mediaIds = Object.keys(params.media);
    expect(mediaIds[0].replace('_', '-').startsWith(attrs.fieldId)).toBe(true);
  });

  it('export signature annotation correctly', async () => {
    const tag = body.elements[4].elements[1].elements[0];

    const fieldElements = body.elements[4].elements[1].elements[0].elements;
    const tagValue = fieldElements.find((f) => f.name === 'w:tag')?.attributes['w:val'];
    const attrs = parseTagAttrsJSON(tagValue);
    expect(attrs.fieldTypeShort).toBe('signature');

    const mediaIds = Object.keys(params.media);
    expect(mediaIds[1].replace('_', '-').startsWith(attrs.fieldId)).toBe(true);
  });

  it('export checkbox annotation correctly', async () => {
    const fieldElements = body.elements[6].elements[1].elements[0].elements;
    const tagValue = fieldElements.find((f) => f.name === 'w:tag')?.attributes['w:val'];
    const attrs = parseTagAttrsJSON(tagValue);

    expect(attrs.fieldTypeShort).toBe('checkbox');

    const text = getTextFromNode(body.elements[6].elements[1].elements[1]);
    expect(text).toEqual('x');
  });

  it('export paragraph annotation correctly', async () => {
    const fieldElements = body.elements[8].elements[1].elements[0].elements;
    const tagValue = fieldElements.find((f) => f.name === 'w:tag')?.attributes['w:val'];
    const attrs = parseTagAttrsJSON(tagValue);

    expect(attrs.fieldTypeShort).toBe('html');

    const node = body.elements[8].elements[1].elements[1];
    const par = node.elements.find((el) => el.name === 'w:p');
    expect(par).toBeDefined();

    const run = par.elements.find((el) => el.name === 'w:r');
    expect(run).toBeDefined();

    const textNode = run.elements.find((el) => el.name === 'w:t');
    const text = textNode.elements[0].text;
    expect(text).toEqual('test paragraph data');
  });

  it('export url annotation correctly', async () => {
    const fieldElements = body.elements[10].elements[1].elements[0].elements;
    const tagValue = fieldElements.find((f) => f.name === 'w:tag')?.attributes['w:val'];
    const attrs = parseTagAttrsJSON(tagValue);

    expect(attrs.fieldTypeShort).toBe('link');

    const node = body.elements[10].elements[1].elements[1];
    const hyperlink = node.elements.find((el) => el.name === 'w:hyperlink');
    const run = hyperlink.elements.find((el) => el.name === 'w:r');
    const textNode = run?.elements.find((el) => el.name === 'w:t');
    const text = textNode.elements[0].text;

    expect(text).toEqual('https://vitest.dev/guide/coverage');
    expect(params.relationships[2].attributes.Target).toBe('https://vitest.dev/guide/coverage');
  });
});

function parseTagAttrsJSON(json) {
  try {
    const attrs = JSON.parse(json);
    return attrs;
  } catch (err) {
    console.error(err);
    return {};
  }
}
