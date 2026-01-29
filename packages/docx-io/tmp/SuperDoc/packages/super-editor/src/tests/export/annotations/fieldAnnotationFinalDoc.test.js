import { getExportedResultForAnnotations, getTextFromNode } from '../export-helpers/index.js';

describe('AnnotationNodeExporter for final doc', async () => {
  window.URL.createObjectURL = vi.fn().mockImplementation((file) => {
    return file.name;
  });

  const { result, params } = await getExportedResultForAnnotations(true);
  const body = {};

  beforeEach(() => {
    Object.assign(
      body,
      result.elements?.find((el) => el.name === 'w:body'),
    );
  });

  it('export text annotation correctly', async () => {
    const text = getTextFromNode(body.elements[0]);
    expect(text).toEqual('Vladyslava Andrushchenko');
  });

  it('export image annotation correctly', async () => {
    const imageNode = body.elements[2].elements[1].elements[0];
    expect(imageNode.elements[0].attributes.distT).toBe(0);
    expect(imageNode.elements[0].attributes.distB).toBe(0);
    expect(imageNode.elements[0].attributes.distL).toBe(0);
    expect(imageNode.elements[0].attributes.distR).toBe(0);

    expect(imageNode.elements[0].elements[0].attributes.cx).toBe(4286250);
    expect(imageNode.elements[0].elements[0].attributes.cy).toBe(4286250);
    expect(
      imageNode.elements[0].elements[4].elements[0].elements[0].elements[1].elements[0].attributes['r:embed'],
    ).toBe(params.relationships[0].attributes.Id);
  });

  it('export signature annotation correctly', async () => {
    const imageNode = body.elements[4].elements[1].elements[0];
    expect(
      imageNode.elements[0].elements[4].elements[0].elements[0].elements[1].elements[0].attributes['r:embed'],
    ).toBe(params.relationships[1].attributes.Id);
  });

  it('export checkbox annotation correctly', async () => {
    const text = getTextFromNode(body.elements[6]);
    expect(text).toEqual('x');
  });

  it('export paragraph annotation correctly', async () => {
    const text = getTextFromNode(body.elements[8]);
    expect(text).toEqual('test paragraph data');
  });

  it('export url annotation correctly', async () => {
    const hyperLinkNode = body.elements[10].elements[1];

    const run = hyperLinkNode.elements.find((el) => el.name === 'w:r');
    const text = run?.elements[1].elements[0].text;

    expect(text).toBe('https://vitest.dev/guide/coverage');
    expect(hyperLinkNode.attributes['r:id']).toBe(params.relationships[2].attributes.Id);
  });
});
