import { htmlStringToDOMNode } from '../htmlStringToDOMNode';
import { collapseWhiteSpace } from './collapseWhiteSpace';

const expectCollapsedWhiteSpace = (input: string, expected: string) => {
  const element = htmlStringToDOMNode(input);
  const collapsedElement = collapseWhiteSpace(element);
  const output = collapsedElement.innerHTML;
  expect(output).toEqual(expected);
};

describe('collapseWhiteSpace', () => {
  describe('when there are no special block types or styles', () => {
    describe('when whitespace is already collapsed', () => {
      it('does not alter simple collapsed HTML', () => {
        const input = '<p>Hello world!</p>';
        const expected = input;
        expectCollapsedWhiteSpace(input, expected);
      });

      it('does not remove single space in text node in inline formatting context', () => {
        const input = '<p>Hello<strong> </strong>world</p>';
        const expected = input;
        expectCollapsedWhiteSpace(input, expected);
      });
    });

    describe('when whitespace is not collapsed', () => {
      it('removes whitespace between block elements', () => {
        const input =
          ' \n\n\n  <p>Hello world!</p>  \n\n  <p>How are you?</p>  \n  ';
        const expected = '<p>Hello world!</p><p>How are you?</p>';
        expectCollapsedWhiteSpace(input, expected);
      });

      it('removes all whitespace at start of block element', () => {
        const input = '<div> \n\n   <p>Hello world!</p></div>';
        const expected = '<div><p>Hello world!</p></div>';
        expectCollapsedWhiteSpace(input, expected);
      });

      it('collapses whitespace at end of block element', () => {
        const input = '<p>Hello world!   \n\n\n</p>';
        const expected = '<p>Hello world! </p>';
        expectCollapsedWhiteSpace(input, expected);
      });

      it('collapses whitespace inside text nodes', () => {
        const input = '<p>Hello  \n  world!</p>';
        const expected = '<p>Hello world!</p>';
        expectCollapsedWhiteSpace(input, expected);
      });

      it('removes whitespace at start of inline formatting context', () => {
        const input = '<p> <strong> Hello</strong> world!</p>';
        const expected = '<p><strong>Hello</strong> world!</p>';
        expectCollapsedWhiteSpace(input, expected);
      });

      it('collapses whitespace at end of inline formatting context', () => {
        const input = '<p><strong>Hello </strong> world!   \n    </p>';
        const expected = '<p><strong>Hello </strong>world! </p>';
        expectCollapsedWhiteSpace(input, expected);
      });

      it('span does not interrupt inline formatting context', () => {
        const input = '<div>Hello<span></span> world!</div>';
        const expected = '<div>Hello<span></span> world!</div>';
        expectCollapsedWhiteSpace(input, expected);
      });

      it('div does interrupt inline formatting context', () => {
        const input = '<div>Hello<div></div> world!</div>';
        const expected = '<div>Hello<div></div>world!</div>';
        expectCollapsedWhiteSpace(input, expected);
      });

      it('tracks whitespace across multiple inline nodes (case 1)', () => {
        const input = '<p><strong>Hello   </strong><em>    world!</em></p>';
        const expected = '<p><strong>Hello </strong><em>world!</em></p>';
        expectCollapsedWhiteSpace(input, expected);
      });

      it('tracks whitespace across multiple inline nodes (case 2)', () => {
        const input = '<p><strong>Hello</strong><em>    world!</em></p>';
        const expected = '<p><strong>Hello</strong><em> world!</em></p>';
        expectCollapsedWhiteSpace(input, expected);
      });
    });
  });

  describe('when inside an actual <pre> element', () => {
    it('preserves whitespace, including newlines, except for one newline at start and end', () => {
      const input = '<pre>\n\n\n  one  two\nthree  \n  \n\n</pre>';
      const expected = '<pre>\n\n  one  two\nthree  \n  \n</pre>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single newline at start of <pre> element', () => {
      const input = '<pre>\nhello world</pre>';
      const expected = '<pre>hello world</pre>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('does not remove single newline in first text node of <pre> element if not a direct child', () => {
      const input = '<pre><span>\nhello</span> world</pre>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single newline at end of <pre> element', () => {
      const input = '<pre>hello world\n</pre>';
      const expected = '<pre>hello world</pre>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single new line at the end of nested inline formatting context', () => {
      const input = '<pre><div>hello world\n</div>x\n</pre>';
      const expected = '<pre><div>hello world</div>x</pre>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('does not remove single newline at the start of nested blocks', () => {
      const input = '<pre><div>\nhello world</div></pre>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });

    it('does not remove single newline when not at the end of some inline formatting context', () => {
      const input = '<pre><span>hello world\n</span> </pre>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single newline at the end of inline formatting context: case 1', () => {
      const input = '<pre><span>hello world\n</span><span></span></pre>';
      const expected = '<pre><span>hello world</span><span></span></pre>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single newline at the end of inline formatting context: case 2', () => {
      const input = '<pre><span>hello world\n</span><div></div>x</pre>';
      const expected = '<pre><span>hello world</span><div></div>x</pre>';
      expectCollapsedWhiteSpace(input, expected);
    });
  });

  describe('when `white-space: pre` is applied to a block element', () => {
    it('preserves whitespace, including newlines, except for one newline at end', () => {
      const input =
        '<div style="white-space: pre">\n  one  two\nthree  \n  \n\n\n\n</div>';
      const expected =
        '<div style="white-space: pre">\n  one  two\nthree  \n  \n\n\n</div>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single newline at end of top-level block', () => {
      const input = '<div style="white-space: pre">\nhello world\n</div>';
      const expected = '<div style="white-space: pre">\nhello world</div>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single new line at the end of nested inline formatting context', () => {
      const input =
        '<div style="white-space: pre"><div>hello world\n</div>\n</div>';
      const expected =
        '<div style="white-space: pre"><div>hello world</div></div>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('does not remove single newline when not at the end of some inline formatting context', () => {
      const input =
        '<div style="white-space: pre"><span>hello world\n</span>x</div>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single newline at the end of some inline formatting block', () => {
      const input =
        '<div style="white-space: pre"><span>hello world\n</span><span></span></div>';
      const expected =
        '<div style="white-space: pre"><span>hello world</span><span></span></div>';
      expectCollapsedWhiteSpace(input, expected);
    });
  });

  describe('when `white-space: pre` is applied to an inline element', () => {
    it('does not let trailing whitespace affect subsequent text nodes', () => {
      const input =
        '<span><strong style="white-space: pre">Hello </strong><em> world</em></span>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });
  });

  describe('when `white-space: pre-line` is applied to a block element', () => {
    it('collapses horizontal whitespace', () => {
      const input = '<div style="white-space: pre-line">Hello   world!</div>';
      const expected = '<div style="white-space: pre-line">Hello world!</div>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('preserves newlines, except for one newline at end', () => {
      const input =
        '<div style="white-space: pre-line">\n\n\n  one  two\nthree  \n  \n\n\n\n</div>';
      const expected =
        '<div style="white-space: pre-line">\n\n\none two\nthree\n\n\n\n</div>';
      expectCollapsedWhiteSpace(input, expected);
    });
  });

  describe('when a div is made inline using CSS', () => {
    it('inline div does not interrupt inline formatting context', () => {
      const input =
        '<div>Hello<div style="display: inline"></div> world!</div>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });

    it('inline-block div does not interrupt inline formatting context', () => {
      const input =
        '<div>Hello<div style="display: inline-block"></div> world!</div>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });

    it('inline-grid div does not interrupt inline formatting context', () => {
      const input =
        '<div>Hello<div style="display: inline-grid"></div> world!</div>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });

    it('inline-flex div does not interrupt inline formatting context', () => {
      const input =
        '<div>Hello<div style="display: inline-flex"></div> world!</div>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });

    it('inline flow div does not interrupt inline formatting context', () => {
      const input =
        '<div>Hello<div style="display: inline flow"></div> world!</div>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });
  });

  describe('when a span is made block using CSS', () => {
    it('block span does interrupt inline formatting context', () => {
      const input =
        '<div>Hello<span style="display: block"></span> world!</div>';
      const expected =
        '<div>Hello<span style="display: block"></span>world!</div>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('flex span does interrupt inline formatting context', () => {
      const input =
        '<div>Hello<span style="display: flex"></span> world!</div>';
      const expected =
        '<div>Hello<span style="display: flex"></span>world!</div>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('grid span does interrupt inline formatting context', () => {
      const input =
        '<div>Hello<span style="display: grid"></span> world!</div>';
      const expected =
        '<div>Hello<span style="display: grid"></span>world!</div>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('table span does interrupt inline formatting context', () => {
      const input =
        '<div>Hello<span style="display: table"></span> world!</div>';
      const expected =
        '<div>Hello<span style="display: table"></span>world!</div>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('block flow span does interrupt inline formatting context', () => {
      const input =
        '<div>Hello<span style="display: block flow"></span> world!</div>';
      const expected =
        '<div>Hello<span style="display: block flow"></span>world!</div>';
      expectCollapsedWhiteSpace(input, expected);
    });
  });
});
