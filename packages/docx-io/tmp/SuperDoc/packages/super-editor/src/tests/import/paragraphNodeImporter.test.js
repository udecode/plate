import { handleParagraphNode } from '@converter/v2/importer/paragraphNodeImporter.js';
import { defaultNodeListHandler } from '@converter/v2/importer/docxImporter.js';
import { getTestDataByFileName } from '@tests/helpers/helpers.js';
import { loadTestDataForEditorTests, initTestEditor } from '@tests/helpers/helpers.js';
import { getExportedResult } from '../export/export-helpers/index';
import { handleListNode } from '@converter/v2/importer/listImporter.js';
import { beforeAll, expect } from 'vitest';

describe('paragraph tests to check spacing', () => {
  let lists = {};
  beforeEach(() => {
    lists = {};
  });

  it('correctly gets spacing [paragraph_spacing_missing]', async () => {
    const dataName = 'paragraph_spacing_missing.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;
    const { nodes } = handleParagraphNode({
      nodes: [content[0]],
      docx,
      nodeListHandler: defaultNodeListHandler(),
      lists,
    });

    const node = nodes[0];
    expect(node.type).toBe('paragraph');
    expect(node.content.length).toBeGreaterThan(0);

    const { attrs } = node;
    const { spacing } = attrs;
    expect(spacing.line).toBe(1.15);
    expect(spacing.lineSpaceAfter).toBe(16);
    expect(spacing.lineSpaceBefore).toBe(16);
  });

  it('correctly gets spacing [line_space_table]', async () => {
    const dataName = 'line_space_table.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;

    const tblNode = content[1];
    const trNode = tblNode.elements[2];
    const tcNode = trNode.elements[1];

    // Check all nodes after the known tcPr
    const { nodes } = handleParagraphNode({
      nodes: tcNode.elements.slice(1),
      docx,
      nodeListHandler: defaultNodeListHandler(),
      lists,
    });
    const node = nodes[0];

    expect(node.type).toBe('paragraph');
    expect(node.content.length).toBeGreaterThan(0);

    const { attrs } = node;
    const { spacing } = attrs;

    expect(spacing.line).toBe(1.15);
    expect(spacing.lineSpaceAfter).toBeUndefined();
    expect(spacing.lineSpaceBefore).toBeUndefined();
  });

  it('correctly gets spacing around image in p [image_p_spacing]', async () => {
    const dataName = 'image_p_spacing.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;

    const { nodes } = handleParagraphNode({
      nodes: [content[0]],
      docx,
      nodeListHandler: defaultNodeListHandler(),
      lists,
    });

    const node = nodes[0];
    expect(node.type).toBe('paragraph');
    expect(node.content.length).toBeGreaterThan(0);

    const { attrs } = node;
    const { spacing } = attrs;
    expect(spacing.line).toBe(1.125);
    expect(spacing.lineSpaceAfter).toBe(16);
    expect(spacing.lineSpaceBefore).toBe(16);

    // Specifically, double check we have this important line rule to prevent image clipping
    // due to line height restriction
    expect(spacing.lineRule).toBe('auto');
  });

  it('correctly gets marks for empty paragraph', async () => {
    const dataName = 'doc_with_spacing.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;

    const { nodes } = handleParagraphNode({ nodes: [content[1]], docx, nodeListHandler: defaultNodeListHandler() });

    const node = nodes[0];
    expect(node.type).toBe('paragraph');

    const { attrs } = node;
    const { spacing, marksAttrs } = attrs;

    expect(spacing.lineSpaceAfter).toBe(18);
    expect(spacing.lineSpaceBefore).toBe(18);
    expect(marksAttrs.length).toBe(2);
    expect(marksAttrs[0].type).toBe('bold');
    expect(marksAttrs[1].type).toBe('textStyle');
    expect(marksAttrs[1].attrs.fontFamily).toBe('Arial');
    expect(marksAttrs[1].attrs.fontSize).toBe('16pt');
  });

  it('correctly gets spaces from paragraph Normal styles', async () => {
    const dataName = 'doc_with_spacing.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;

    const { nodes } = handleParagraphNode({ nodes: [content[4]], docx, nodeListHandler: defaultNodeListHandler() });

    const node = nodes[0];
    expect(node.type).toBe('paragraph');

    const { attrs } = node;
    const { spacing } = attrs;
    expect(spacing.lineSpaceAfter).toBe(11);
    expect(spacing.lineSpaceBefore).toBeUndefined();
  });

  it('correctly gets spacing from styles.xml by related styleId', async () => {
    const dataName = 'doc_with_spaces_from_styles.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;

    const { nodes } = handleParagraphNode({ nodes: [content[0]], docx, nodeListHandler: defaultNodeListHandler() });

    const node = nodes[0];
    expect(node.type).toBe('paragraph');

    const { attrs } = node;
    const { spacing } = attrs;
    expect(spacing.lineSpaceAfter).toBe(6);
    expect(spacing.lineSpaceBefore).toBe(21);
  });

  it('correctly gets spacing with lists [list-def-mix]', async () => {
    const dataName = 'list-def-mix.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;

    const firstListItem = content[0];
    const { nodes } = handleListNode({ nodes: [content[0]], docx, nodeListHandler: defaultNodeListHandler(), lists });
  });

  it('should return empty result for empty nodes', () => {
    const result = handleParagraphNode({
      nodes: [],
      docx: {},
      nodeListHandler: defaultNodeListHandler(),
    });
    expect(result).toEqual({ nodes: [], consumed: 0 });
  });

  it('should return empty result for non w:p node', () => {
    const result = handleParagraphNode({
      nodes: [{ name: 'w:r' }],
      docx: {},
      nodeListHandler: defaultNodeListHandler(),
    });
    expect(result).toEqual({ nodes: [], consumed: 0 });
  });

  it('correctly handles paragraph with text alignment', () => {
    const mockParagraph = {
      name: 'w:p',
      elements: [
        {
          name: 'w:pPr',
          elements: [
            {
              name: 'w:jc',
              attributes: {
                'w:val': 'center',
              },
            },
          ],
        },
      ],
    };

    const { nodes } = handleParagraphNode({
      nodes: [mockParagraph],
      docx: {},
      nodeListHandler: defaultNodeListHandler(),
    });

    const node = nodes[0];
    expect(node.type).toBe('paragraph');
    expect(node.attrs.textAlign).toBe('center');
  });

  it('correctly handles paragraph indentation in twips', () => {
    const mockParagraph = {
      name: 'w:p',
      elements: [
        {
          name: 'w:pPr',
          elements: [
            {
              name: 'w:ind',
              attributes: {
                'w:left': '2880',
                'w:right': '1440',
                'w:firstLine': '720',
                'w:hanging': '270',
              },
            },
          ],
        },
      ],
    };

    const { nodes } = handleParagraphNode({
      nodes: [mockParagraph],
      docx: {},
      nodeListHandler: defaultNodeListHandler(),
    });

    const node = nodes[0];
    expect(node.type).toBe('paragraph');
    // Keep raw twips values in indent object
    expect(node.attrs.indent.left).toBe(192);
    expect(node.attrs.indent.right).toBe(96);
    expect(node.attrs.indent.firstLine).toBe(48);
    expect(node.attrs.indent.hanging).toBe(18);
    // textIndent should be in inches (2880twips - 270twips(hanging))
    expect(node.attrs.textIndent).toBe('1.81in');
  });
});

describe('paragraph tests to check indentation', () => {
  it('correctly gets indents from paragraph Normal styles', async () => {
    const dataName = 'paragraph_indent_normal_styles.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;

    const { nodes } = handleParagraphNode({ nodes: [content[0]], docx, nodeListHandler: defaultNodeListHandler() });

    const node = nodes[0];
    expect(node.type).toBe('paragraph');

    const { attrs } = node;
    const { indent } = attrs;

    expect(indent.firstLine).toBe(29);
  });
});

describe('paragraph with dropcaps', () => {
  it('correctly gets dropcaps data', async () => {
    const dataName = 'dropcaps.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;

    const { nodes } = handleParagraphNode({ nodes: [content[1]], docx, nodeListHandler: defaultNodeListHandler() });

    const node = nodes[0];
    expect(node.type).toBe('paragraph');

    const { attrs } = node;
    const { dropcap } = attrs;
    expect(dropcap.type).toBe('drop');
  });
});

describe('Check that we can import list item with invalid list def with fallback', () => {
  const filename = 'invalid-list-def-fallback.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch, content, exported, body;
  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    content = editor.getJSON();
    exported = await getExportedResult(filename);
    body = exported.elements?.find((el) => el.name === 'w:body');
  });

  it('imports expected list item with fallback', async () => {
    const item = content.content[3];
    expect(item.type).toBe('paragraph');
    const textNode = item.content[0];
    expect(textNode.type).toBe('text');
    expect(textNode.text).toBe('NO VALID DEF');
  });

  it('exports first list item correctly', async () => {
    const item = body.elements[0];
    const pPr = item.elements.find((el) => el.name === 'w:pPr');
  });
});

describe('Check that paragraph-level sectPr is retained', () => {
  const filename = 'paragraph-sectpr-breaks.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch, content;
  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    content = editor.getJSON();
  });

  it('correctly imports sectPr inside paragraphs as section breaks', async () => {
    const p2 = content.content[2];
    const sectPr = p2.attrs.paragraphProperties.sectPr;
    expect(sectPr).toBeDefined();
    expect(p2.attrs.pageBreakSource).toBe('sectPr');

    const textNode = p2.content.find((el) => el.type === 'text');
    expect(textNode.text).toBe('TITLE');
  });

  it('correctly imports the first node alignment', async () => {
    const p1 = content.content[0];
    const { attrs } = p1;
    expect(attrs.styleId).toBe('Title');
  });

  it('correctly exports the pass-through sectPr', () => {
    const { result: exported } = editor.converter.exportToXmlJson({
      data: editor.getJSON(),
      editor,
    });
    expect(exported).toBeDefined();
    expect(exported.elements.length).toBe(1);
    expect(exported.elements[0].name).toBe('w:body');

    const body = exported.elements[0];

    const p1 = content.content[1];
    expect(p1.attrs.pageBreakSource).toBe('sectPr');
    const p1sectPrData = p1.attrs.paragraphProperties.sectPr;
    expect(p1sectPrData).toBeDefined();

    // Check the empty paragraph for its sectPr
    const p1exported = body.elements[1];
    const pPr1 = p1exported.elements.find((el) => el.name === 'w:pPr');
    const sectPr1 = pPr1.elements.find((el) => el.name === 'w:sectPr');
    expect(p1sectPrData).toEqual(sectPr1);

    const p2 = content.content[2];
    const p2sectPrData = p2.attrs.paragraphProperties.sectPr;
    const p2Exported = body.elements[2];
    const pPr2 = p2Exported.elements.find((el) => el.name === 'w:pPr');
    const sectPr2 = pPr2.elements.find((el) => el.name === 'w:sectPr');
    expect(p2sectPrData).toEqual(sectPr2);
  });

  describe('paragraph tests to check tab stops', () => {
    it('correctly handles paragraph with tab stops', () => {
      const mockParagraph = {
        name: 'w:p',
        elements: [
          {
            name: 'w:pPr',
            elements: [
              {
                name: 'w:tabs',
                elements: [
                  {
                    name: 'w:tab',
                    attributes: {
                      'w:val': 'start',
                      'w:pos': '2160',
                    },
                  },
                  {
                    name: 'w:tab',
                    attributes: {
                      'w:val': 'center',
                      'w:pos': '5040',
                      'w:leader': 'dot',
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const { nodes } = handleParagraphNode({
        nodes: [mockParagraph],
        docx: {},
        nodeListHandler: defaultNodeListHandler(),
      });

      const node = nodes[0];
      expect(node.type).toBe('paragraph');
      expect(node.attrs.tabStops).toBeDefined();
      expect(node.attrs.tabStops.length).toBe(2);

      const firstTab = node.attrs.tabStops[0];
      expect(firstTab.val).toBe('start');
      expect(firstTab.pos).toBe(144);
      expect(firstTab.leader).toBeUndefined();

      const secondTab = node.attrs.tabStops[1];
      expect(secondTab.val).toBe('center');
      expect(secondTab.pos).toBe(336);
      expect(secondTab.leader).toBe('dot');
    });

    it('correctly handles paragraph without tab stops', () => {
      const mockParagraph = {
        name: 'w:p',
        elements: [
          {
            name: 'w:pPr',
            elements: [],
          },
        ],
      };

      const { nodes } = handleParagraphNode({
        nodes: [mockParagraph],
        docx: {},
        nodeListHandler: defaultNodeListHandler(),
      });

      const node = nodes[0];
      expect(node.type).toBe('paragraph');
      expect(node.attrs.tabStops).toBeUndefined();
    });

    it('correctly handles empty tabs element', () => {
      const mockParagraph = {
        name: 'w:p',
        elements: [
          {
            name: 'w:pPr',
            elements: [
              {
                name: 'w:tabs',
                elements: [],
              },
            ],
          },
        ],
      };

      const { nodes } = handleParagraphNode({
        nodes: [mockParagraph],
        docx: {},
        nodeListHandler: defaultNodeListHandler(),
      });

      const node = nodes[0];
      expect(node.type).toBe('paragraph');
      expect(node.attrs.tabStops).toBeUndefined();
    });

    it('correctly handles tab with default values', () => {
      const mockParagraph = {
        name: 'w:p',
        elements: [
          {
            name: 'w:pPr',
            elements: [
              {
                name: 'w:tabs',
                elements: [
                  {
                    name: 'w:tab',
                    attributes: {
                      'w:pos': '1440',
                      // No w:val provided, should default to 'start'
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const { nodes } = handleParagraphNode({
        nodes: [mockParagraph],
        docx: {},
        nodeListHandler: defaultNodeListHandler(),
      });

      const node = nodes[0];
      expect(node.type).toBe('paragraph');
      expect(node.attrs.tabStops).toBeDefined();
      expect(node.attrs.tabStops.length).toBe(1);

      const tab = node.attrs.tabStops[0];
      expect(tab.val).toBe('start');
      expect(tab.pos).toBe(96);
    });
  });
});
