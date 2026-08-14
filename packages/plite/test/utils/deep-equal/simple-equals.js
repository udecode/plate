import { TextApi } from '@platejs/plite';

export const input = {
  objectA: { text: 'same text', bold: true },
  objectB: { text: 'same text', bold: true },
};

export const test = ({ objectA, objectB }) => TextApi.equals(objectA, objectB);

export const output = true;
