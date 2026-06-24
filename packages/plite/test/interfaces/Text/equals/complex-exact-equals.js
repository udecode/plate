import { TextApi } from '@platejs/plite';

export const input = {
  textNodeA: {
    text: 'same text',
    bold: true,
    italic: { origin: 'inherited', value: false },
  },
  textNodeB: {
    text: 'same text',
    bold: true,
    italic: { origin: 'inherited', value: false },
  },
};

export const test = ({ textNodeA, textNodeB }) =>
  TextApi.equals(textNodeA, textNodeB, { loose: false });

export const output = true;
