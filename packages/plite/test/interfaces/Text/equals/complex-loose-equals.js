import { TextApi } from '@platejs/plite';

export const input = {
  textNodeA: {
    text: 'same text',
    bold: true,
    italic: { origin: 'inherited', value: false },
  },
  textNodeB: {
    text: 'diff text',
    bold: true,
    italic: { origin: 'inherited', value: false },
  },
};

export const test = ({ textNodeA, textNodeB }) =>
  TextApi.equals(textNodeA, textNodeB, { loose: true });

export const output = true;
