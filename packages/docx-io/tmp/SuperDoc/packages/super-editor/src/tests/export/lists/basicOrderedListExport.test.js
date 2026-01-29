// prettier-ignore
import {
  getTextFromNode,
  getExportedResult,
  testListNodes,
} from '../export-helpers/index';
import { loadTestDataForEditorTests, initTestEditor } from '@tests/helpers/helpers.js';

describe('[simple-ordered-list.docx] simple ordered list tests', async () => {
  // The file for this set of test
  const fileName = 'simple-ordered-list.docx';
  const result = await getExportedResult(fileName);
  const body = {};

  beforeEach(() => {
    Object.assign(
      body,
      result.elements?.find((el) => el.name === 'w:body'),
    );
  });

  it('can export the first list', () => {
    const titleIndex = 0;
    const firstTitle = body.elements[titleIndex];
    const titleText = getTextFromNode(firstTitle);
    expect(titleText).toBe('Simple ordered list:');

    const item1 = body.elements[titleIndex + 2];
    testListNodes({ node: item1, expectedLevel: 0, expectedNumPr: 0, text: 'Item 1' });

    const item2 = body.elements[titleIndex + 3];
    testListNodes({ node: item2, expectedLevel: 0, expectedNumPr: 0, text: 'Item 2' });

    const item3 = body.elements[titleIndex + 4];
    testListNodes({ node: item3, expectedLevel: 0, expectedNumPr: 0 });

    const nonListNode = body.elements[titleIndex + 6];
    testListNodes({ node: nonListNode, expectedLevel: undefined, expectedNumPr: undefined, text: undefined });
  });

  it('can export the second list (with sublists)', () => {
    const titleIndex = 6;
    const titleNode = body.elements[titleIndex];
    const titleText = getTextFromNode(titleNode);
    expect(titleText).toBe('Simple ordered list with sub lists:');

    const item1 = body.elements[titleIndex + 2];
    testListNodes({ node: item1, expectedLevel: 0, expectedNumPr: 0, text: 'Item 1' });

    const item3 = body.elements[titleIndex + 4];
    testListNodes({ node: item3, expectedLevel: 0, expectedNumPr: 0, text: 'Item 3' });

    const firstNestedItem = body.elements[titleIndex + 5];
    testListNodes({ node: firstNestedItem, expectedLevel: 1, expectedNumPr: 1, text: 'Lvl 1 – a' });

    const doubleNestedItem = body.elements[titleIndex + 7];
    testListNodes({ node: doubleNestedItem, expectedLevel: 2, expectedNumPr: 2, text: 'Lvl 2 – i' });

    const nestedItemAfterDoubleNested = body.elements[titleIndex + 8];
    testListNodes({ node: nestedItemAfterDoubleNested, expectedLevel: 1, expectedNumPr: 1, text: 'Lvl 1 – c' });

    const finalItem = body.elements[titleIndex + 9];
    testListNodes({ node: finalItem, expectedLevel: 0, expectedNumPr: 0, text: 'Item 4' });
  });
});

describe('[base-custom.docx] Can import and import the custom lists', () => {
  const filename = 'base-custom.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch, content;
  let exported, body;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    content = editor.getJSON();
    exported = await getExportedResult(filename);
    body = exported.elements?.find((el) => el.name === 'w:body');
  });

  it('imports/exports the first item', () => {
    const list1 = content.content[0];
    expect(list1.type).toBe('orderedList');

    const item1 = list1.content[0];
    expect(item1.type).toBe('listItem');

    const { attrs } = item1;
    expect(attrs).toBeDefined();
    expect(attrs.listLevel).toStrictEqual([1]);

    const expectedNumId = '1';
    const expectedLevel = 0;
    expect(attrs.numId).toBe(expectedNumId);
    expect(attrs.indent.left).toBeUndefined();
    expect(attrs.indent.hanging).toBeUndefined();
    expect(attrs.level).toBe(expectedLevel);
    // expect(attrs.styleId).toBe('ListParagraph');

    const exportedList1 = body.elements[0];
    const pPr = exportedList1.elements.find((s) => s.name === 'w:pPr');

    const numPr = pPr?.elements.find((s) => s.name === 'w:numPr');
    expect(numPr).toBeDefined();
    expect(numPr.elements.length).toBe(2);

    const numIdTag = numPr.elements.find((s) => s.name === 'w:numId');
    const numId = numIdTag?.attributes['w:val'];
    expect(numId).toBe(expectedNumId);

    const ilvlTag = numPr.elements.find((s) => s.name === 'w:ilvl');
    const iLvl = ilvlTag?.attributes['w:val'];
    expect(iLvl).toBe(expectedLevel);

    const indentTag = pPr?.elements.find((s) => s.name === 'w:ind');
    expect(indentTag).toBeUndefined();
    const indentLeft = indentTag?.attributes['w:left'];
    const indentHanging = indentTag?.attributes['w:hanging'];
    expect(indentLeft).toBeUndefined();
    expect(indentHanging).toBeUndefined();

    // Ensure styleId is passed through correctly
    const styleId = pPr?.elements.find((s) => s.name === 'w:pStyle');
    expect(styleId).toBeDefined();
    const styleIdVal = styleId?.attributes['w:val'];
    expect(styleIdVal).toBe('ListParagraph');
  });

  it('imports/exports the second item (custom indent)', () => {
    const list1 = content.content[1];
    expect(list1.type).toBe('orderedList');

    const item1 = list1.content[0];
    expect(item1.type).toBe('listItem');

    const { attrs } = item1;
    const expectedNumId = '1';
    const expectedLevel = 1;
    expect(attrs).toBeDefined();
    expect(attrs.numId).toBe(expectedNumId);
    expect(attrs.level).toBe(expectedLevel);
    expect(attrs.indent.left).toBeUndefined();
    expect(attrs.indent.hanging).toBe(72);

    const paragraphNode = item1.content[0];
    expect(paragraphNode.type).toBe('paragraph');

    const textNode = paragraphNode.content.find((n) => n.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode.text).toBe('A custom');

    const exportedList1 = body.elements[1];
    const pPr = exportedList1.elements.find((s) => s.name === 'w:pPr');

    const numPr = pPr?.elements.find((s) => s.name === 'w:numPr');
    expect(numPr).toBeDefined();
    expect(numPr.elements.length).toBe(2);

    const numIdTag = numPr.elements.find((s) => s.name === 'w:numId');
    const numId = numIdTag?.attributes['w:val'];
    expect(numId).toBe(expectedNumId);

    const ilvlTag = numPr.elements.find((s) => s.name === 'w:ilvl');
    const iLvl = ilvlTag?.attributes['w:val'];
    expect(iLvl).toBe(expectedLevel);

    const indentTag = pPr?.elements.find((s) => s.name === 'w:ind');
    expect(indentTag).toBeDefined();
    const indentLeft = indentTag?.attributes['w:left'];
    const indentHanging = indentTag?.attributes['w:hanging'];
    expect(indentLeft).toBeUndefined();
    expect(indentHanging).toBe(1080);
  });

  it('imports the line break', () => {
    const lineBreak = content.content[3];
    expect(lineBreak.type).toBe('paragraph');
    expect(lineBreak.content).toBeUndefined();
  });

  it('imports the first item in the second (custom) list', () => {
    const list1 = content.content[4];
    expect(list1.type).toBe('orderedList');

    const item1 = list1.content[0];
    expect(item1.type).toBe('listItem');

    const { attrs } = item1;
    const expectedNumId = '4';
    const expectedLevel = 1;
    expect(attrs).toBeDefined();
    expect(attrs.numId).toBe(expectedNumId);
    expect(attrs.level).toBe(expectedLevel);
    expect(attrs.indent.left).toBeUndefined();
    expect(attrs.indent.hanging).toBeUndefined();
    expect(attrs.indent.right).toBe(1);

    const paragraphNode = item1.content[0];
    expect(paragraphNode.type).toBe('paragraph');

    const textNode = paragraphNode.content.find((n) => n.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode.text).toBe('2.1');

    const exportedList1 = body.elements[4];
    const pPr = exportedList1.elements.find((s) => s.name === 'w:pPr');

    const numPr = pPr?.elements.find((s) => s.name === 'w:numPr');
    expect(numPr).toBeDefined();
    expect(numPr.elements.length).toBe(2);

    const numIdTag = numPr.elements.find((s) => s.name === 'w:numId');
    const numId = numIdTag?.attributes['w:val'];
    expect(numId).toBe(expectedNumId);

    const ilvlTag = numPr.elements.find((s) => s.name === 'w:ilvl');
    const iLvl = ilvlTag?.attributes['w:val'];
    expect(iLvl).toBe(expectedLevel);

    const indentTag = pPr?.elements.find((s) => s.name === 'w:ind');
    expect(indentTag).toBeDefined();
    const indentLeft = indentTag?.attributes['w:left'];
    const indentHanging = indentTag?.attributes['w:hanging'];
    const indentRight = indentTag?.attributes['w:right'];
    expect(indentLeft).toBeUndefined();
    expect(indentHanging).toBeUndefined();
    expect(indentRight).toBe(15);
  });
});
