import { SuperConverter } from '@converter/SuperConverter.js';
import { handleListNode } from '@converter/v2/importer/listImporter.js';
import { defaultNodeListHandler } from '@converter/v2/importer/docxImporter.js';
import { getTestDataByFileName } from '@tests/helpers/helpers.js';
import { createDocumentJson } from '../../core/super-converter/v2/importer/docxImporter.js';
import { handleParagraphNode } from '@converter/v2/importer/paragraphNodeImporter.js';

describe('it correctly imports list with recursive style def', async () => {
  const fileName = 'broken-list-missing-items.docx';
  let docx, doc, content;

  beforeEach(async () => {
    docx = await getTestDataByFileName(fileName);
    const documentXml = docx['word/document.xml'];
    doc = documentXml.elements[0];
    const body = doc.elements[0];
    content = body.elements;
  });

  it('correctly imports list style that uses "basedOn" pointer', () => {
    const item2 = content[2];
    const nodes = handleListNode({ nodes: [item2], docx, nodeListHandler: defaultNodeListHandler(), lists: {} })?.nodes;

    const node = nodes[0].content[0].content[0];
    const text = node.content[0].text;
    expect(text).toBe('Item 2');
  });
});
