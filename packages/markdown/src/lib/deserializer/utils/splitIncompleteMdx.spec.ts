import { splitIncompleteMdx } from './splitIncompleteMdx';

describe('splitIncomplete', () => {
  it('should split HTML with an incomplete tag at the end', () => {
    const data = '<u>underline</u>text<u>';
    const result = splitIncompleteMdx(data);
    expect(result).toEqual(['<u>underline</u>text', '<u>']);
  });

  it('should split HTML with an incomplete closing tag at the end', () => {
    const data = '<u>underline</u>text<u>underline</';
    const result = splitIncompleteMdx(data);
    expect(result).toEqual(['<u>underline</u>text', '<u>underline</']);
  });

  it('keeps a fully‑balanced block that has attributes intact', () => {
    const data = '<mdx foo="bar">code</mdx>text';
    expect(splitIncompleteMdx(data)).toBe(data);
  });

  it('splits when the last opening tag (with attributes) is incomplete', () => {
    const data = '<mdx foo="bar">code</mdx>text<mdx lang="ts">';
    expect(splitIncompleteMdx(data)).toEqual([
      '<mdx foo="bar">code</mdx>text',
      '<mdx lang="ts">',
    ]);
  });

  it('ignores self‑closing tags and still finds the first unmatched opener', () => {
    const data = '<div id="a"><img src="x"/><span>hi</span></div><div id="b">';
    expect(splitIncompleteMdx(data)).toEqual([
      '<div id="a"><img src="x"/><span>hi</span></div>',
      '<div id="b">',
    ]);
  });

  it('splits at the very start if the outer‑most opener stays unmatched', () => {
    const data = '<u style="color:red">one<u style="color:blue">two</u>';
    expect(splitIncompleteMdx(data)).toEqual([
      '',
      '<u style="color:red">one<u style="color:blue">two</u>',
    ]);
  });

  it('splits at the tag middle', () => {
    const data = 'test <mdx>mdx</m';
    expect(splitIncompleteMdx(data)).toEqual(['test ', '<mdx>mdx</m']);
  });

  it('ignores self‑closing tags when checking balance', () => {
    const data = '<section><img src="x.jpg"/><p>hi</p></section><sec';
    expect(splitIncompleteMdx(data)).toEqual([
      '<section><img src="x.jpg"/><p>hi</p></section>',
      '<sec',
    ]);
  });

  it('handles incomplete attributes ', () => {
    const data = 'test<img sr';
    expect(splitIncompleteMdx(data)).toEqual(['test', '<img sr']);
  });
});
