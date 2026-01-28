import { getExportedResult } from '../export/export-helpers/index';
import { loadTestDataForEditorTests, initTestEditor } from '@tests/helpers/helpers.js';
import { beforeAll, beforeEach, expect } from 'vitest';

describe('[custom-list1.docx] test import custom lists', () => {
  const filename = 'custom-list1.docx';
  let docx, media, mediaFiles, fonts, editor;
  beforeAll(async () => ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename)));
  beforeEach(() => ({ editor } = initTestEditor({ content: docx, media, mediaFiles, fonts })));

  it('can import first element in custom list', () => {
    const state = editor.getJSON();
    const content = state.content;
    expect(content.length).toBe(5);

    const firstList = content[0];
    expect(firstList.type).toBe('orderedList');

    const { attrs: firstListAttrs } = firstList;
    expect(firstListAttrs).toBeDefined();
    expect(firstListAttrs.listId).toBe('4');
    expect(firstListAttrs.order).toBe(1);
  });

  it('can import the first sub-element (1.1)', () => {
    const state = editor.getJSON();
    const content = state.content;
    expect(content.length).toBe(5);

    const listItem = content[2].content[0];
    const { attrs } = listItem;
    const lvlText = attrs.lvlText;
    expect(lvlText).toBe('%1.%2.');

    // We expect the list level to be [1, 1]
    const listLevel = attrs.listLevel;
    expect(listLevel).toStrictEqual([1, 2]);
  });

  it('can import the second sub-element (1.2)', () => {
    const state = editor.getJSON();
    const content = state.content;
    const listItem = content[2].content[0];

    const { attrs } = listItem;
    const lvlText = attrs.lvlText;
    expect(lvlText).toBe('%1.%2.');

    // We expect the list level to be [2, 2]
    const listLevel = attrs.listLevel;
    expect(listLevel).toStrictEqual([1, 2]);
  });

  it('can import the sub-sub-element (1.2.1)', () => {
    const state = editor.getJSON();
    const content = state.content;
    const listItem = content[3].content[0];

    const { attrs } = listItem;
    const lvlText = attrs.lvlText;
    expect(lvlText).toBe('%1.%2.%3.');

    // We expect the list level to be [1, 2, 1]
    const listLevel = attrs.listLevel;
    expect(listLevel).toStrictEqual([1, 2, 1]);
  });
});

describe('[broken-complex-list.docx] Tests with repeated list numbering item and complex indentation', () => {
  const filename = 'broken-complex-list.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch, content;
  let exported, body;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    content = editor.getJSON();
    exported = await getExportedResult(filename);
    body = exported.elements?.find((el) => el.name === 'w:body');
  });

  it('can import the first list item', () => {
    const list = content.content[0];
    const item = list.content[0];
    expect(list.type).toBe('orderedList');
    expect(item.type).toBe('listItem');
    expect(item.attrs.numId).toBe('5');
    expect(item.attrs.indent.left).toBe(24);
    expect(item.attrs.indent.hanging).toBeUndefined();
    expect(item.attrs.level).toBe(0);
    expect(item.attrs.listLevel).toStrictEqual([1]);

    const pNode = item.content[0];
    expect(pNode.type).toBe('paragraph');

    const textNode = pNode.content[0];
    expect(textNode.type).toBe('text');
    expect(textNode.text).toBe('ONE');
  });

  it('can import the first sub item (a) with indent', () => {
    const list = content.content[2];
    const item = list.content[0];
    expect(list.type).toBe('orderedList');
    expect(item.type).toBe('listItem');
    expect(item.attrs.numId).toBe('5');
    expect(item.attrs.indent.left).toBe(24);
    expect(item.attrs.indent.hanging).toBeUndefined();
    expect(item.attrs.level).toBe(1);
    expect(item.attrs.listLevel).toStrictEqual([1, 1]);

    const pNode = item.content[0];
    expect(pNode.type).toBe('paragraph');

    const textNode = pNode.content[0];
    expect(textNode.type).toBe('text');
    expect(textNode.text).toBe('a');

    const { attrs: pNodeAttrs } = pNode;
    expect(pNodeAttrs).toBeDefined();

    // Check spacing
    // The spacing in this document is crucial to showing the indented list in the right place
    const { spacing } = pNodeAttrs;
    expect(spacing).toBeDefined();

    expect(spacing.lineSpaceBefore).toBeUndefined();
    expect(spacing.lineSpaceAfter).toBe(0);
    expect(spacing.line).toBe(1);
    expect(spacing.lineRule).toBe('auto');

    // Compare with exported data
    const exportedList = body.elements[2];
    const text = exportedList.elements.find((el) => el.name === 'w:r')?.elements.find((el) => el.name === 'w:t')
      ?.elements[0].text;
    expect(text).toBe('a');

    const pPr = exportedList.elements.find((s) => s.name === 'w:pPr');
    const styleId = pPr?.elements.find((s) => s.name === 'w:pStyle')?.attributes['w:val'];
    expect(styleId).toBe('ListParagraph');

    const numPr = pPr?.elements.find((s) => s.name === 'w:numPr');
    expect(numPr).toBeDefined();
    expect(numPr.elements.length).toBe(2);
    const numIdTag = numPr.elements.find((s) => s.name === 'w:numId');
    const numId = numIdTag?.attributes['w:val'];
    expect(numId).toBe('5');
    const ilvlTag = numPr.elements.find((s) => s.name === 'w:ilvl');
    const iLvl = ilvlTag?.attributes['w:val'];
    expect(iLvl).toBe(1);

    const indentTag = pPr?.elements.find((s) => s.name === 'w:ind');
    expect(indentTag).toBeDefined();
    const indentLeft = indentTag?.attributes['w:left'];
    const indentHanging = indentTag?.attributes['w:hanging'];
    const indentFirstLine = indentTag?.attributes['w:firstLine'];
    expect(indentLeft).toBe(360);
    expect(indentHanging).toBeUndefined();
    expect(indentFirstLine).toBe(0);

    const spacingTag = pPr?.elements.find((el) => el.name === 'w:spacing');
    expect(spacingTag).toBeDefined();
    const spacingLine = spacingTag?.attributes['w:line'];
    const spacingAfter = spacingTag?.attributes['w:after'];
    const spacingBefore = spacingTag?.attributes['w:before'];
    const lineRule = spacingTag?.attributes['w:lineRule'];
    expect(spacingLine).toBe(240);
    expect(spacingAfter).toBe(0);
    expect(spacingBefore).toBeUndefined();
    expect(lineRule).toBe('auto');
  });

  it('can import the first "c" list item', () => {
    const list = content.content[6];
    const item = list.content[0];

    expect(list.type).toBe('orderedList');
    expect(item.type).toBe('listItem');
    expect(item.attrs.numId).toBe('5');
    expect(item.attrs.indent.left).toBe(24);
    expect(item.attrs.indent.hanging).toBeUndefined();
    expect(item.attrs.level).toBe(1);
    expect(item.attrs.listLevel).toStrictEqual([1, 3]);

    const pNode = item.content[0];
    expect(pNode.type).toBe('paragraph');
    expect(pNode.content[0].type).toBe('text');
    expect(pNode.content[0].text).toBe('c');
  });
});

describe('[brken-list.docx] Test list breaking indentation formatting', () => {
  const filename = 'broken-list.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch, content;
  let exported, body;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    content = editor.getJSON();
    exported = await getExportedResult(filename);
    body = exported.elements?.find((el) => el.name === 'w:body');
  });

  it('can import the first list item', () => {
    const list = content.content[0];
    const listItem = list.content[0];

    expect(list.type).toBe('orderedList');
    const { attrs } = listItem;
    expect(attrs.numId).toBe('1');
    expect(attrs.level).toBe(0);
    expect(attrs.numPrType).toBe('inline');
    expect(attrs.listLevel).toStrictEqual([1]);
    expect(attrs.indent.left).toBeUndefined();
    expect(attrs.indent.leftChars).toBe(0);
  });
});

describe('[restart-numbering-sub-list.docx] Test sublist restart nubering', () => {
  const filename = 'restart-numbering-sub-list.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch, content;
  let exported, body;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    content = editor.getJSON();
    exported = await getExportedResult(filename);
    body = exported.elements?.find((el) => el.name === 'w:body');
  });

  it('resets the numbering for the indented list item', () => {
    const sublist1 = content.content[4];
    expect(sublist1.content[0].attrs.listLevel).toStrictEqual([2, 1]);
  });
});
