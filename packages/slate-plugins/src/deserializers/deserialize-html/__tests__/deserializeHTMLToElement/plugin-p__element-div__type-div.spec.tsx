import { useParagraphPlugin } from '../../../../elements/paragraph/useParagraphPlugin';
import { deserializeHTMLToElement } from '../../utils/deserializeHTMLToElement';

const input = {
  plugins: [useParagraphPlugin({ p: { type: 'p' } })],
  element: document.createElement('div'),
  children: [{ text: 'test' }],
};

const output = undefined;

it('should be', () => {
  expect(deserializeHTMLToElement(input)).toEqual(output);
});
