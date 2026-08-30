import { stripHtmlClassNames } from './stripHtmlClassNames';

describe('stripHtmlClassNames', () => {
  it('keeps only plite classes by default', () => {
    expect(
      stripHtmlClassNames('<p class="foo plite-p bar plite-bold">Hello</p>', {})
    ).toBe('<p class="plite-p plite-bold">Hello</p>');
  });

  it('removes all class names when preserveClassNames is empty', () => {
    expect(
      stripHtmlClassNames('<p class="foo plite-p bar">Hello</p>', {
        preserveClassNames: [],
      })
    ).toBe('<p>Hello</p>');
  });

  it('keeps configured class prefixes', () => {
    expect(
      stripHtmlClassNames(
        '<p class="keep-me prose-p plite-p drop-me">Hello</p>',
        {
          preserveClassNames: ['keep-', 'prose-'],
        }
      )
    ).toBe('<p class="keep-me prose-p">Hello</p>');
  });
});
