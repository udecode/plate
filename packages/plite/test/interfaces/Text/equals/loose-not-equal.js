import { TextApi } from '@platejs/plite';

export const input = {
  textNodeA: { text: 'same text', bold: true },
  textNodeB: { text: 'same text', bold: true, italic: true },
};

export const test = ({ textNodeA, textNodeB }) =>
  TextApi.equals(textNodeA, textNodeB, { loose: true });

export const output = false;
