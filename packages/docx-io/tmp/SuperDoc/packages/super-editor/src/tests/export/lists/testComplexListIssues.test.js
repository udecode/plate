// prettier-ignore
import { beforeAll, expect } from 'vitest';
import { loadTestDataForEditorTests, initTestEditor, getNewTransaction } from '@tests/helpers/helpers.js';

describe('[complex-list-def-issue.docx] importing complex list (repeated num id in sub lists, breaks)', () => {
  const filename = 'complex-list-def-issue.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch;
  let currentState;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    currentState = editor.getJSON();
  });

  it('imports the list correctly', () => {
    expect(currentState.content[0].type).toBe('orderedList');
    expect(currentState.content[0].content.length).toBe(1);
  });

  it('first list item imports correctly', () => {
    const listItem = currentState.content[0].content[0];

    expect(listItem.type).toBe('listItem');
    expect(listItem.content.length).toBe(1);

    const sublist = currentState.content[1];
    expect(sublist).toBeDefined();
    expect(sublist.content.length).toBe(1);

    const subItem1 = currentState.content[3].content[0];
    expect(subItem1.attrs.listLevel).toStrictEqual([1, 2]);

    const subItem4 = currentState.content[7].content[0];
    expect(subItem4.attrs.listLevel).toStrictEqual([1, 4]);
  });

  it('second list item imports correctly', () => {
    const listItem = currentState.content[0].content[0];
    expect(listItem.type).toBe('listItem');
    expect(listItem.content.length).toBe(1);

    const sublist = currentState.content[3];
    expect(sublist).toBeDefined();
    expect(sublist.content.length).toBe(1);

    const subItem1 = sublist.content[0];
    expect(subItem1.type).toBe('listItem');
    expect(subItem1.attrs.numId).toBe('5');
    expect(subItem1.attrs.listLevel).toStrictEqual([1, 2]);

    const subItem2 = currentState.content[5].content[0];
    expect(subItem2.attrs.listLevel).toStrictEqual([1, 3]);
  });

  it('third list item with node break imports correctly', () => {
    const listItem = currentState.content[0].content[0];
    expect(listItem.type).toBe('listItem');
    expect(listItem.content.length).toBe(1);

    const sublist = currentState.content[7];
    expect(sublist).toBeDefined();
    expect(sublist.content.length).toBe(1);

    const subItem1 = sublist.content[0];
    expect(subItem1.attrs.listLevel).toStrictEqual([1, 4]);
    expect(subItem1.content.length).toBe(1);

    // The node break
    const nodeBreak = currentState.content[19];
    expect(nodeBreak.type).toBe('paragraph');
    expect(nodeBreak.content.length).toBe(1);

    // Ensure the nodes after the break have the correct listLevel index
    const listAfterBreak = currentState.content[21];
    expect(listAfterBreak.type).toBe('orderedList');

    const subItem3 = listAfterBreak.content[0];
    expect(subItem3.attrs.numId).toBe('5');
    expect(subItem3.attrs.listLevel).toStrictEqual([3, 2]);

    const subItem4 = currentState.content[23].content[0];
    expect(subItem4.type).toBe('listItem');
    expect(subItem4.attrs.numId).toBe('5');
    expect(subItem4.attrs.listLevel).toStrictEqual([3, 3]);
  });

  it('root list continues correctly after third item with break', () => {
    // Make sure the 'FOUR' list item continues correctly here
    const listItem = currentState.content[25].content[0];
    expect(listItem.type).toBe('listItem');
    expect(listItem.attrs.listLevel).toStrictEqual([4]);

    const contents = listItem.content[0];
    expect(contents.type).toBe('paragraph');
    expect(contents.content.length).toBe(1);

    const textNode = contents.content[0];
    expect(textNode.type).toBe('text');
    expect(textNode.text).toBe('FOUR');
  });
});

describe('[complex-list-def-issue.docx] importing complex list (repeated num id in sub lists, breaks)', () => {
  const filename = 'complex-list-def-issue.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch;
  let currentState;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    currentState = editor.getJSON();
  });

  it('correctly imports the list styles on the indented list (expects inline js, ind)', () => {
    const subList = currentState.content[1];
    const subItem1 = subList.content[0];

    const spacing = subItem1.attrs.spacing;
    expect(spacing).toBeNull();

    const indent = subItem1.attrs.indent;
    expect(indent.left).toBe(24);
    expect(indent.firstLine).toBe(0);
    expect(indent.hanging).toBeUndefined();
  });
});

describe('[custom-list-numbering1.docx] importing complex list (repeated num id in sub lists, breaks)', () => {
  const filename = 'custom-list-numbering1.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch;
  let currentState;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    currentState = editor.getJSON();
  });

  it('correctly imports list with numbering format SECTION %1.', () => {
    const listItem = currentState.content[0].content[0];
    const { attrs } = listItem;

    expect(attrs.lvlText).toBe('SECTION %1.  ');
  });

  it('correctly imports the sublist with numbering (a), (b) etc', () => {
    const subList = currentState.content[1];
    const subItem1 = subList.content[0];
    expect(subItem1.attrs.lvlText).toBe('(%2)');

    const subItem2 = currentState.content[3].content[0];
    expect(subItem2.attrs.lvlText).toBe('(%2)');
  });
});
