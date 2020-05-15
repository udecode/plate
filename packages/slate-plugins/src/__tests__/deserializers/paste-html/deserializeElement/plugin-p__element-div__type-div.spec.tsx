import { deserializeElement } from 'deserializers/deserialize-html/utils';
import { ParagraphPlugin } from 'elements/paragraph';

const el = document.createElement('div');
el.setAttribute('data-slate-type', 'div');

const input = {
  plugins: [ParagraphPlugin({ typeP: 'p' })],
  el: document.createElement('div'),
  children: [{ text: 'test' }],
};

const output = undefined;

it('should be', () => {
  expect(deserializeElement(input)).toEqual(output);
});
