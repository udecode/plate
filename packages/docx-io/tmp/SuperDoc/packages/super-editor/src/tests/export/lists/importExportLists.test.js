// prettier-ignore
import { beforeAll, expect } from 'vitest';
import { TextSelection } from 'prosemirror-state';
import { loadTestDataForEditorTests, initTestEditor, getNewTransaction } from '@tests/helpers/helpers.js';

describe('[blank-doc.docx] import, add node, export', () => {
  const filename = 'blank-doc.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
  });

  it('starts with an empty document containing only a paragraph', () => {
    const currentState = editor.getJSON();
    expect(currentState.content.length).toBe(1);
    expect(currentState.content[0].type).toBe('paragraph');
  });

  it('can start an ordered list', () => {
    // Generate a new list, track the list ID to check it later
    editor.commands.toggleOrderedList();

    const currentState = editor.getJSON();
    expect(currentState.content.length).toBe(1);
    expect(currentState.content[0].type).toBe('orderedList');
    expect(currentState.content[0].content.length).toBe(1);
    expect(currentState.content[0].content[0].type).toBe('listItem');
    expect(currentState.content[0].content[0].content.length).toBe(1);
    expect(currentState.content[0].content[0].content[0].type).toBe('paragraph');
    expect(currentState.content[0].content[0].content[0].content).toBeUndefined();
  });

  it('can export the empty list node', () => {
    const { result: exported } = editor.converter.exportToXmlJson({
      data: editor.getJSON(),
      editorSchema: editor.schema,
      editor,
    });
    const body = exported.elements.find((el) => el.name === 'w:body');
    const content = body.elements;

    const paragraph = content[0];
    expect(paragraph.name).toBe('w:p');

    const pPr = paragraph.elements.find((el) => el.name === 'w:pPr');
    expect(pPr).toBeDefined();

    const numPr = pPr.elements.find((el) => el.name === 'w:numPr');
    expect(numPr).toBeDefined();
    expect(numPr.elements.length).toBe(2);
  });

  it('can add text to the first list item', () => {
    const tr = getNewTransaction(editor);
    const listPosition = 3;

    tr.insertText('hello world', listPosition);
    dispatch(tr);

    const currentState = editor.getJSON();
    expect(currentState.content[0].content[0].content[0].content[0].text).toBe('hello world');

    // Insert text will automatically generate the next list item here too
    expect(currentState.content[0].content.length).toBe(1); // Expect two list items

    // We expect to see 2 separate ordered list nodes
    const content = currentState.content;
    expect(content[0].type).toBe('orderedList');

    const firstListContent = content[0].content;
    expect(firstListContent.length).toBe(1);

    const firstListItem = firstListContent[0];
    expect(firstListItem.type).toBe('listItem');
    expect(firstListItem.content[0].type).toBe('paragraph');

    const { attrs } = firstListItem;
    expect(attrs.listNumberingType).toBe('decimal');
    expect(attrs.numId).toBe(3);
    expect(attrs.level).toBe(0);
    expect(attrs.numPrType).toBe('inline');
    expect(attrs.listLevel).toStrictEqual([1]);
  });

  it('correctly exports after the first list item', () => {
    const { result: exported } = editor.converter.exportToXmlJson({
      data: editor.getJSON(),
      editor,
    });

    expect(exported).toBeDefined();
    expect(exported.elements.length).toBe(1);
    expect(exported.elements[0].name).toBe('w:body');

    const body = exported.elements[0];
    const listItem = body.elements[0];
    const pPr = listItem.elements[0];
    const numPr = pPr.elements[0];
    expect(numPr.elements.length).toBe(2);

    const numIdTag = numPr.elements.find((el) => el.name === 'w:numId');
    const numId = numIdTag.attributes['w:val'];
    expect(numId).toBe(3);

    const lvl = numPr.elements.find((el) => el.name === 'w:ilvl');
    const lvlText = lvl.attributes['w:val'];
    expect(lvlText).toBe(0);

    const runNode = listItem.elements.find((el) => el.name === 'w:r');
    const runText = runNode.elements[0].elements[0].text;
    expect(runText).toBe('hello world');
  });

  it('can add a second list item by splitting the first', () => {
    const tr = getNewTransaction(editor);
    const $pos = tr.doc.resolve(9);
    tr.setSelection(TextSelection.near($pos));
    dispatch(tr);

    editor.commands.splitListItem();

    const currentState = editor.getJSON();
    expect(currentState.content.length).toBe(2);

    const secondList = currentState.content[1];
    const secondListItem = secondList.content[0];
    expect(secondList.type).toBe('orderedList');
    expect(secondListItem.type).toBe('listItem');
    expect(secondListItem.content[0].type).toBe('paragraph');
    expect(secondListItem.content[0].content[0].text).toBe('world');
    expect(secondListItem.attrs.listNumberingType).toBe('decimal');
    expect(secondListItem.attrs.numId).toBe(3);
    expect(secondListItem.attrs.level).toBe(0);
    expect(secondListItem.attrs.numPrType).toBe('inline');
    expect(secondListItem.attrs.listLevel).toStrictEqual([2]);
  });
});
