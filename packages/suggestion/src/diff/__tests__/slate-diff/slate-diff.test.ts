import { slateDiff } from './slate-diff'
import {
  addMarkFixtures,
  insertTextAddMarkFixtures,
  insertTextFixtures,
  insertUpdateParagraphFixtures,
  insertUpdateTwoParagraphsFixtures,
  mergeTextFixtures,
} from './slate-diff.fixtures'

describe('slate-diff', () => {
  test('insert-text', () => {
    expect(slateDiff(insertTextFixtures.doc1, insertTextFixtures.doc2)).toStrictEqual(insertTextFixtures.expected)
  })

  test('add-mark', () => {
    expect(slateDiff(addMarkFixtures.doc1, addMarkFixtures.doc2)).toStrictEqual(addMarkFixtures.expected)
  })

  test('insert-text-and-add-mark', () => {
    expect(slateDiff(insertTextAddMarkFixtures.doc1, insertTextAddMarkFixtures.doc2)).toStrictEqual(
      insertTextAddMarkFixtures.expected,
    )
  })

  test('merge-text', () => {
    expect(slateDiff(mergeTextFixtures.doc1, mergeTextFixtures.doc2)).toStrictEqual(mergeTextFixtures.expected)
  })

  test('insert-and-update-paragraph', () => {
    const diff = slateDiff(insertUpdateParagraphFixtures.doc1, insertUpdateParagraphFixtures.doc2)
    expect(diff).toStrictEqual(insertUpdateParagraphFixtures.expected)
  })

  test('insert-and-update-two-paragraphs', () => {
    const diff = slateDiff(insertUpdateTwoParagraphsFixtures.doc1, insertUpdateTwoParagraphsFixtures.doc2)
    expect(diff).toStrictEqual(insertUpdateTwoParagraphsFixtures.expected)
  })
})
