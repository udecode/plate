import { collapseWhiteSpace } from './collapseWhiteSpace';
import { htmlStringToDOMNode } from './htmlStringToDOMNode';

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
        const input = ' \n\n\n  <p>Hello world!</p>  \n\n  <p>How are you?</p>  \n  ';
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
    it('preserves whitespace, including newlines, except for newlines at start and end', () => {
      const input = '<pre>\n\n\n  one  two\nthree  \n  \n\n</pre>';
      const expected = '<pre>\n\n  one  two\nthree  \n  \n</pre>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single newline at start and end', () => {
      const input = '<pre>\nhello world\n</pre>';
      const expected = '<pre>hello world</pre>';
      expectCollapsedWhiteSpace(input, expected);
    });
  });

  describe('when `white-space: pre` is applied to a block element', () => {
    it('preserves whitespace, including newlines, except for newlines at end', () => {
      const input = '<div style="white-space: pre">\n  one  two\nthree  \n  \n\n\n\n</div>';
      const expected = '<div style="white-space: pre">\n  one  two\nthree  \n  \n\n\n</div>';
      expectCollapsedWhiteSpace(input, expected);
    });

    it('removes single newline at end', () => {
      const input = '<div style="white-space: pre">\nhello world\n</div>';
      const expected = '<div style="white-space: pre">\nhello world</div>';
      expectCollapsedWhiteSpace(input, expected);
    });
  });

  describe('when `white-space: pre` is applied to an inline element', () => {
    it('does not let trailing whitespace affect subsequent text nodes', () => {
      const input = '<span><strong style="white-space: pre">Hello </strong><em> world</em></span>';
      const expected = input;
      expectCollapsedWhiteSpace(input, expected);
    });
  });

  // TODO: When white-space: pre-line 
  // TODO: Inline through display CSS property
  // TODO: Block through display CSS property
  // TODO: Other elements inside <pre>
});
