import { collapseWhitespace } from './collapseWhitespace';
import { htmlStringToDOMNode } from './htmlStringToDOMNode';

const expectCollapsedWhitespace = (input: string, expected: string) => {
  const element = htmlStringToDOMNode(input);
  const collapsedElement = collapseWhitespace(element);
  const output = collapsedElement.innerHTML;
  expect(output).toEqual(expected);
};

describe('collapseWhitespace', () => {
  describe('when there are no special block types or styles', () => {
    describe('when whitespace is already collapsed', () => {
      it('does not alter simple collapsed HTML', () => {
        const input = '<p>Hello world!</p>';
        const expected = input;
        expectCollapsedWhitespace(input, expected);
      });

      it('does not remove single space in text node in inline formatting context', () => {
        const input = '<p>Hello<strong> </strong>world</p>';
        const expected = input;
        expectCollapsedWhitespace(input, expected);
      });
    });

    describe('when whitespace is not collapsed', () => {
      it('removes whitespace between block elements', () => {
        const input = ' \n\n\n  <p>Hello world!</p>  \n\n  <p>How are you?</p>  \n  ';
        const expected = '<p>Hello world!</p><p>How are you?</p>';
        expectCollapsedWhitespace(input, expected);
      });

      it('removes all whitespace at start of block element', () => {
        const input = '<div> \n\n   <p>Hello world!</p></div>';
        const expected = '<div><p>Hello world!</p></div>';
        expectCollapsedWhitespace(input, expected);
      });

      it('collapses whitespace at end of block element', () => {
        const input = '<p>Hello world!   \n\n\n</p>';
        const expected = '<p>Hello world! </p>';
        expectCollapsedWhitespace(input, expected);
      });

      it('collapses whitespace inside text nodes', () => {
        const input = '<p>Hello  \n  world!</p>';
        const expected = '<p>Hello world!</p>';
        expectCollapsedWhitespace(input, expected);
      });

      it('removes whitespace at start of inline formatting context', () => {
        const input = '<p> <strong> Hello</strong> world!</p>';
        const expected = '<p><strong>Hello</strong> world!</p>';
        expectCollapsedWhitespace(input, expected);
      });

      it('collapses whitespace at end of inline formatting context', () => {
        const input = '<p><strong>Hello </strong> world!   \n    </p>';
        const expected = '<p><strong>Hello </strong>world! </p>';
        expectCollapsedWhitespace(input, expected);
      });

      it('span does not interrupt inline formatting context', () => {
        const input = '<div>Hello<span></span> world!</div>';
        const expected = '<div>Hello<span></span> world!</div>';
        expectCollapsedWhitespace(input, expected);
      });

      it('div does interrupt inline formatting context', () => {
        const input = '<div>Hello<div></div> world!</div>';
        const expected = '<div>Hello<div></div>world!</div>';
        expectCollapsedWhitespace(input, expected);
      });

      it('tracks whitespace across multiple inline nodes (case 1)', () => {
        const input = '<p><strong>Hello   </strong><em>    world!</em></p>';
        const expected = '<p><strong>Hello </strong><em>world!</em></p>';
        expectCollapsedWhitespace(input, expected);
      });

      it('tracks whitespace across multiple inline nodes (case 2)', () => {
        const input = '<p><strong>Hello</strong><em>    world!</em></p>';
        const expected = '<p><strong>Hello</strong><em> world!</em></p>';
        expectCollapsedWhitespace(input, expected);
      });
    });
  });
});
