import { createPlateEditor } from '@udecode/plate-common';

import { slateDiff } from './slate-diff';
import {
  applyDiffSuggestions,
  slateDiffSuggestions,
} from './slate-diff-suggestions';
import {
  addMarkFixtures,
  insertTextAddMarkFixtures,
  insertTextFixtures,
  insertUpdateParagraphFixtures,
  insertUpdateTwoParagraphsFixtures,
  mergeTextFixtures,
} from './slate-diff-suggestions.fixtures';

describe('slate-diff', () => {
  let editor: any;
  // const options = { idFactory: () => '1' }

  beforeEach(() => {
    editor = createPlateEditor();
  });

  // TODO: first test to pass
  it('insert-text', () => {
    editor.children = insertTextFixtures.doc1;
    const ops = slateDiffSuggestions(editor.children, insertTextFixtures.doc2);
    applyDiffSuggestions(editor, ops);
    expect(editor.children).toStrictEqual(insertTextFixtures.expected);
  });

  // TODO: next
  it('add-mark', () => {
    expect(slateDiff(addMarkFixtures.doc1, addMarkFixtures.doc2)).toStrictEqual(
      addMarkFixtures.expected
    );
  });

  it('insert-text-and-add-mark', () => {
    expect(
      slateDiff(insertTextAddMarkFixtures.doc1, insertTextAddMarkFixtures.doc2)
    ).toStrictEqual(insertTextAddMarkFixtures.expected);
  });

  it('merge-text', () => {
    expect(
      slateDiff(mergeTextFixtures.doc1, mergeTextFixtures.doc2)
    ).toStrictEqual(mergeTextFixtures.expected);
  });

  it('insert-and-update-paragraph', () => {
    const diff = slateDiff(
      insertUpdateParagraphFixtures.doc1,
      insertUpdateParagraphFixtures.doc2
    );
    expect(diff).toStrictEqual(insertUpdateParagraphFixtures.expected);
  });

  it('insert-and-update-two-paragraphs', () => {
    const diff = slateDiff(
      insertUpdateTwoParagraphsFixtures.doc1,
      insertUpdateTwoParagraphsFixtures.doc2
    );
    expect(diff).toStrictEqual(insertUpdateTwoParagraphsFixtures.expected);
  });
});
