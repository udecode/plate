import { autolinksToLinks } from './autolinksToLinks';

describe('autolinksToLinks', () => {
  it('rewrites email autolinks as mailto links', () => {
    expect(autolinksToLinks('User: <quinn.martin@mindflow.io>')).toBe(
      String.raw`User: [quinn\.martin\@mindflow\.io](mailto:quinn.martin@mindflow.io)`
    );
  });

  it('rewrites url and mailto autolinks', () => {
    expect(autolinksToLinks('<https://example.com/a> <mailto:a@b.co>')).toBe(
      String.raw`[https\:\/\/example\.com\/a](https://example.com/a) [mailto\:a\@b\.co](mailto:a@b.co)`
    );
  });

  it('escapes the label and the destination', () => {
    expect(autolinksToLinks('<https://example.com/_a_(b)?x=1&amp;y>')).toBe(
      String.raw`[https\:\/\/example\.com\/\_a\_\(b\)\?x\=1\&amp\;y](https://example.com/_a_\(b\)?x=1\&amp;y)`
    );
  });

  it('leaves jsx and html tags alone', () => {
    const input =
      '<u>under</u> <Foo bar="1" /> <br /> <svg:rect> <a href="https://x.co">x</a>';

    expect(autolinksToLinks(input)).toBe(input);
  });

  it('leaves escaped autolinks alone', () => {
    const input = String.raw`\<a@b.co> \\<a@b.co>`;

    expect(autolinksToLinks(input)).toBe(
      String.raw`\<a@b.co> \\[a\@b\.co](mailto:a@b.co)`
    );
  });

  it('leaves code spans alone', () => {
    const input = 'Use `<a@b.co>` or ``<https://x.co> ` `` here';

    expect(autolinksToLinks(input)).toBe(input);
  });

  it('leaves fenced code alone', () => {
    const input = [
      '<a@b.co>',
      '```',
      '<a@b.co>',
      '````',
      '<c@d.co>',
      '- item',
      '  ~~~',
      '  <e@f.co>',
      '  ~~~',
      '  <g@h.co>',
    ].join('\n');

    expect(autolinksToLinks(input)).toBe(
      [
        String.raw`[a\@b\.co](mailto:a@b.co)`,
        '```',
        '<a@b.co>',
        '````',
        String.raw`[c\@d\.co](mailto:c@d.co)`,
        '- item',
        '  ~~~',
        '  <e@f.co>',
        '  ~~~',
        String.raw`  [g\@h\.co](mailto:g@h.co)`,
      ].join('\n')
    );
  });
});
