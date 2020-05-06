import { deserializeElement } from 'deserializers/utils';
import { ParagraphPlugin } from 'elements/paragraph';

const el = document.createElement('div');
el.setAttribute('data-slate-type', 'div');

export const input = {
  plugins: [ParagraphPlugin({ typeP: 'p' })],
  el: document.createElement('div'),
  children: [{ text: 'test' }],
};

export const run = (value: any) => {
  return deserializeElement(value);
};

export const output = undefined;
