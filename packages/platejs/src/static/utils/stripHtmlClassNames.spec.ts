import { stripHtmlClassNames } from './stripHtmlClassNames.internal';

describe('stripHtmlClassNames', () => {
  it('keeps only editor classes by default', () => {
    expect(
      stripHtmlClassNames(
        '<p class="foo editor-p bar editor-bold">Hello</p>',
        {}
      )
    ).toBe('<p class="editor-p editor-bold">Hello</p>');
  });

  it('removes all class names when preserveClassNames is empty', () => {
    expect(
      stripHtmlClassNames('<p class="foo editor-p bar">Hello</p>', {
        preserveClassNames: [],
      })
    ).toBe('<p>Hello</p>');
  });

  it('keeps configured class prefixes', () => {
    expect(
      stripHtmlClassNames(
        '<p class="keep-me prose-p editor-p drop-me">Hello</p>',
        {
          preserveClassNames: ['keep-', 'prose-'],
        }
      )
    ).toBe('<p class="keep-me prose-p">Hello</p>');
  });
});
