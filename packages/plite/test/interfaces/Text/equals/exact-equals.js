import { TextApi } from '@platejs/plite';

export const input = {
  textNodeA: { text: 'same text', bold: true },
  textNodeB: { text: 'same text', bold: true },
};

export const test = ({ textNodeA, textNodeB }) =>
  TextApi.equals(textNodeA, textNodeB, { loose: false });

export const output = true;
