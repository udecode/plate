import { ParagraphPlugin } from '../../../../elements/paragraph/ParagraphPlugin';
import { deserializeHTMLToElement } from '../../utils/deserializeHTMLToElement';

const input = {
  plugins: [ParagraphPlugin({ p: { type: 'p' } })],
  element: document.createElement('div'),
  children: [{ text: 'test' }],
};

const output = undefined;

it('should be', () => {
  expect(deserializeHTMLToElement(input)).toEqual(output);
});
