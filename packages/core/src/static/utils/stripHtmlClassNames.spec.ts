import { stripHtmlClassNames } from './stripHtmlClassNames';

describe('stripHtmlClassNames', () => {
  it('keeps only slate classes by default', () => {
    expect(
      stripHtmlClassNames('<p class="foo slate-p bar slate-bold">Hello</p>', {})
    ).toBe('<p class="slate-p slate-bold">Hello</p>');
  });

  it('removes all class names when preserveClassNames is empty', () => {
    expect(
      stripHtmlClassNames('<p class="foo slate-p bar">Hello</p>', {
        preserveClassNames: [],
      })
    ).toBe('<p>Hello</p>');
  });

  it('keeps configured class prefixes', () => {
    expect(
      stripHtmlClassNames(
        '<p class="keep-me prose-p slate-p drop-me">Hello</p>',
        {
          preserveClassNames: ['keep-', 'prose-'],
        }
      )
    ).toBe('<p class="keep-me prose-p">Hello</p>');
  });
});
