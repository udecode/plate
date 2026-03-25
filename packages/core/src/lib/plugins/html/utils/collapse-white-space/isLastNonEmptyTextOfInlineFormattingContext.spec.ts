import { isLastNonEmptyTextOfInlineFormattingContext } from './isLastNonEmptyTextOfInlineFormattingContext';

describe('isLastNonEmptyTextOfInlineFormattingContext', () => {
  it('returns false when non-empty inline text follows in the same formatting context', () => {
    const block = document.createElement('div');
    const strong = document.createElement('strong');
    const text = document.createTextNode('one');

    strong.append(text);
    block.append(strong, document.createTextNode('two'));

    expect(isLastNonEmptyTextOfInlineFormattingContext(text)).toBe(false);
  });

  it('returns true when the next node is a block or there is no next node', () => {
    const block = document.createElement('div');
    const strong = document.createElement('strong');
    const text = document.createTextNode('one');

    strong.append(text);
    block.append(strong, document.createElement('p'));

    expect(isLastNonEmptyTextOfInlineFormattingContext(text)).toBe(true);
    expect(
      isLastNonEmptyTextOfInlineFormattingContext(
        document.createTextNode('solo')
      )
    ).toBe(true);
  });
});
