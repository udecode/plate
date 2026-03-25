import { inferWhiteSpaceRule } from './inferWhiteSpaceRule';

describe('inferWhiteSpaceRule', () => {
  it.each([
    ['break-spaces', 'pre'],
    ['pre', 'pre'],
    ['pre-wrap', 'pre'],
    ['normal', 'normal'],
    ['nowrap', 'normal'],
    ['pre-line', 'pre-line'],
  ])('maps %s to %s', (whiteSpace, expected) => {
    const element = document.createElement('span');

    element.style.whiteSpace = whiteSpace as any;

    expect(inferWhiteSpaceRule(element)).toBe(expected);
  });

  it('treats pre elements as pre even without an inline white-space style', () => {
    expect(inferWhiteSpaceRule(document.createElement('pre'))).toBe('pre');
  });

  it('maps initial to normal and unknown styles to null', () => {
    const initial = document.createElement('span');
    const unknown = document.createElement('span');

    initial.style.whiteSpace = 'initial';
    unknown.style.whiteSpace = 'inherit';

    expect(inferWhiteSpaceRule(initial)).toBe('normal');
    expect(inferWhiteSpaceRule(unknown)).toBeNull();
  });
});
