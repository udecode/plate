import { slateDiff } from './slate-diff';
import {
  addMarkFixtures,
  insertTextAddMarkFixtures,
  insertTextFixtures,
  insertUpdateParagraphFixtures,
  insertUpdateTwoParagraphsFixtures,
  mergeTextFixtures,
} from './slate-diff.fixtures';

describe('slate-diff', () => {
  it('insert-text', () => {
    expect(
      slateDiff(insertTextFixtures.doc1, insertTextFixtures.doc2)
    ).toStrictEqual(insertTextFixtures.expected);
  });

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
