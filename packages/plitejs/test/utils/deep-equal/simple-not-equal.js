import { TextApi } from 'plitejs';

export const input = {
  objectA: { text: 'same text', bold: true },
  objectB: { text: 'same text', bold: true, italic: true },
};

export const test = ({ objectA, objectB }) => TextApi.equals(objectA, objectB);

export const output = false;
