import { getTestDataByFileName } from '../helpers/helpers.js';
import { defaultNodeListHandler } from '@converter/v2/importer/docxImporter.js';
import { handleDrawingNode } from '../../core/super-converter/v2/importer/imageImporter.js';
import { handleParagraphNode } from '../../core/super-converter/v2/importer/paragraphNodeImporter.js';

describe('ImageNodeImporter', () => {
  it('imports image node correctly', async () => {
    const dataName = 'image_doc.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;
    const { nodes } = handleParagraphNode({ nodes: [content[0]], docx, nodeListHandler: defaultNodeListHandler() });

    const paragraphNode = nodes[0];
    const drawingNode = paragraphNode.content[0];
    const { attrs } = drawingNode;
    const { padding, size } = attrs;

    expect(paragraphNode.type).toBe('paragraph');
    expect(drawingNode.type).toBe('image');

    expect(attrs).toHaveProperty('rId', 'rId4');
    expect(attrs).toHaveProperty('src', 'word/media/image1.jpeg');

    expect(size).toHaveProperty('width', 602);
    expect(size).toHaveProperty('height', 903);

    expect(padding).toHaveProperty('left', 0);
    expect(padding).toHaveProperty('top', 0);
    expect(padding).toHaveProperty('bottom', 0);
    expect(padding).toHaveProperty('right', 0);
  });

  it('imports anchor image node correctly', async () => {
    const dataName = 'anchor_images.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;
    const { nodes } = handleParagraphNode({ nodes: [content[1]], docx, nodeListHandler: defaultNodeListHandler() });

    const paragraphNode = nodes[0];
    const drawingNode = paragraphNode.content[3];
    const { attrs } = drawingNode;
    const { anchorData } = attrs;

    expect(anchorData).toHaveProperty('hRelativeFrom', 'margin');
    expect(anchorData).toHaveProperty('vRelativeFrom', 'margin');
    expect(anchorData).toHaveProperty('alignH', 'left');
    expect(anchorData).toHaveProperty('alignV', 'top');
  });
});
