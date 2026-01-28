import { loadTestDataForEditorTests, initTestEditor } from '@tests/helpers/helpers.js';
import { getVisibleIndent } from '@extensions/list-item/ListItemNodeView.js';
import { getListItemStyleDefinitions } from '@helpers/list-numbering-helpers.js';
import { expect } from 'vitest';

describe(' test list item rendering indents from styles', () => {
  const filename = 'base-custom.docx';
  let docx, media, mediaFiles, fonts, editor;
  beforeAll(async () => ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(filename)));
  beforeEach(() => ({ editor } = initTestEditor({ content: docx, media, mediaFiles, fonts })));

  // Global so we can access it in the tests
  let stylePpr, numDefPpr;

  it('[getListItemStyleDefinitions] can import the list item style definitions []', () => {
    const numId = 1;
    const level = 1;
    const { stylePpr: stylePprResult, numDefPpr: numDefPprResult } = getListItemStyleDefinitions({
      styleId: 'ListParagraph',
      numId,
      level,
      editor,
    });

    stylePpr = stylePprResult;
    numDefPpr = numDefPprResult;

    // Check the style definitions for indent
    expect(stylePpr).toBeDefined();
    const indentTag = stylePpr.elements.find((el) => el.name === 'w:ind');
    expect(indentTag).toBeDefined();
    const indentLeft = indentTag.attributes['w:left'];
    expect(indentLeft).toBe('720');
    expect(indentTag.attributes['w:hanging']).toBeUndefined();
    expect(indentTag.attributes['w:firstLine']).toBeUndefined();
    expect(indentTag.attributes['w:right']).toBeUndefined();

    // Check the numDef for indent
    expect(numDefPpr).toBeDefined();
    const numDefIndentTag = numDefPpr.elements.find((el) => el.name === 'w:ind');
    expect(numDefIndentTag).toBeDefined();
    const numDefIndentLeft = numDefIndentTag.attributes['w:left'];
    const numDefIndentHanging = numDefIndentTag.attributes['w:hanging'];
    expect(numDefIndentLeft).toBe('1440');
    expect(numDefIndentHanging).toBe('360');
    expect(numDefIndentTag.attributes['w:firstLine']).toBeUndefined();
    expect(numDefIndentTag.attributes['w:right']).toBeUndefined();
  });

  it('[getVisibleIndent] can calculate visible indent', () => {
    const visibleIndent = getVisibleIndent(stylePpr, numDefPpr);
    expect(visibleIndent).toBeDefined();
    expect(visibleIndent.left).toBe(96);
    expect(visibleIndent.hanging).toBe(24);
    expect(visibleIndent.right).toBeUndefined();
  });
});
