import { loadTestDataForEditorTests, initTestEditor } from '@tests/helpers/helpers.js';
import { expect } from 'vitest';

describe('[sublist-issue.docx] Imports sublist with numId issue', () => {
  const filename = 'sublist-issue.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch, content;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    content = editor.getJSON();
  });

  it('correctly imports first list item and indented paragraph break', () => {
    const list1 = content.content[2];
    const item1 = list1.content[0];

    expect(list1.type).toBe('orderedList');
    expect(item1.type).toBe('listItem');
    expect(item1.attrs.indent.left).toBeUndefined();
    expect(item1.attrs.indent.hanging).toBeUndefined();
    expect(item1.attrs.indent.right).toBe(-14);
    expect(item1.attrs.numId).toBe('5');

    const spacerP1 = content.content[3];
    expect(spacerP1.type).toBe('paragraph');
    expect(spacerP1.attrs.indent.firstLine).toBe(0);
    expect(spacerP1.attrs.indent.left).toBe(48);
    expect(spacerP1.attrs.indent.right).toBe(-14);
    expect(spacerP1.attrs.indent.hanging).toBe(0);
  });

  it('imports second list item and break', () => {
    const list2 = content.content[4];
    expect(list2.type).toBe('orderedList');
    expect(list2.content.length).toBe(1);

    const item = list2.content[0];
    expect(item.type).toBe('listItem');
    expect(item.attrs.indent.left).toBeUndefined();
    expect(item.attrs.indent.hanging).toBeUndefined();
    expect(item.attrs.indent.right).toBeUndefined;
    expect(item.attrs.numId).toBe('5');

    // Ensure we're importing the empty paragraprh
    const emptyParagraph = content.content[5];
    expect(emptyParagraph.type).toBe('paragraph');
    expect(emptyParagraph.content).toBeUndefined();
  });

  it('correctly imports numId in sublist that does not match outer list', () => {
    const indentedList = content.content[6];
    expect(indentedList.type).toBe('orderedList');
    expect(indentedList.content.length).toBe(1);

    const item = indentedList.content[0];
    expect(item.type).toBe('listItem');
    expect(item.attrs.indent.left).toBe(24);
    expect(item.attrs.indent.hanging).toBeUndefined();
    expect(item.attrs.indent.right).toBe(-14);
    expect(item.attrs.indent.firstLine).toBe(0);
    expect(item.attrs.numId).toBe('3');
    expect(item.attrs.listLevel).toStrictEqual([1]);
  });
});

describe('[base-ordered.docx] Imports base list and sublist', () => {
  const filename = 'base-ordered.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch, content;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    content = editor.getJSON();
  });

  it('can import the first list item from list 1', () => {
    const item1 = content.content[0];
    expect(item1.type).toBe('orderedList');
    expect(item1.content.length).toBe(1);

    const list = item1.content[0];
    expect(list.type).toBe('listItem');
    expect(list.content.length).toBe(1);

    const { attrs: listAttrs } = list;
    expect(listAttrs).toBeDefined();
    expect(listAttrs.listLevel).toStrictEqual([1]);
    expect(listAttrs.numId).toBe('1');
    expect(listAttrs.indent.left).toBeUndefined();
    expect(listAttrs.indent.hanging).toBeUndefined();

    const paragraph = list.content[0];
    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.content.length).toBe(1);
    expect(paragraph.content[0].type).toBe('text');
    expect(paragraph.content[0].text).toBe('One');

    const { attrs: paragraphAttrs } = paragraph;
    expect(paragraphAttrs).toBeDefined();
    expect(paragraphAttrs.indent).toBeNull();
  });

  it('can import the second list item from list 1', () => {
    const item2 = content.content[1];
    expect(item2.type).toBe('orderedList');

    const list = item2.content[0];
    expect(list.type).toBe('listItem');
    expect(list.content.length).toBe(1);

    const { attrs: listAttrs } = list;
    expect(listAttrs.listLevel).toStrictEqual([2]);
    expect(listAttrs.numId).toBe('1');
    expect(listAttrs.indent.left).toBeUndefined();
    expect(listAttrs.indent.hanging).toBeUndefined();
  });

  it('can import the third list item from list 1', () => {
    const item2 = content.content[2];
    expect(item2.type).toBe('orderedList');

    const list = item2.content[0];
    expect(list.type).toBe('listItem');
    expect(list.content.length).toBe(1);

    const { attrs: listAttrs } = list;
    expect(listAttrs.listLevel).toStrictEqual([3]);
    expect(listAttrs.numId).toBe('1');
    expect(listAttrs.indent.left).toBeUndefined();
    expect(listAttrs.indent.hanging).toBeUndefined();
  });

  it('correctly imports spacer paragraphs', () => {
    const p1 = content.content[3];
    expect(p1.type).toBe('paragraph');
    expect(p1.content).toBeUndefined();

    const p2 = content.content[4];
    expect(p2.type).toBe('paragraph');
    expect(p2.content).toBeUndefined();
  });

  it('correctly imports first item list 2', () => {
    const item1 = content.content[5];
    expect(item1.type).toBe('orderedList');
    expect(item1.content.length).toBe(1);

    const list = item1.content[0];
    expect(list.type).toBe('listItem');
    expect(list.content.length).toBe(1);

    const { attrs: listAttrs } = list;
    expect(listAttrs).toBeDefined();
    expect(listAttrs.listLevel).toStrictEqual([1]);
    expect(listAttrs.numId).toBe('2');
    expect(listAttrs.indent.left).toBeUndefined();
    expect(listAttrs.indent.hanging).toBeUndefined();

    const paragraph = list.content[0];
    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.content.length).toBe(1);
    expect(paragraph.content[0].type).toBe('text');
    expect(paragraph.content[0].text).toBe('One');

    const { attrs: paragraphAttrs } = paragraph;
    expect(paragraphAttrs).toBeDefined();
    expect(paragraphAttrs.indent).toBeNull();
  });
});
