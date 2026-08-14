import { TextApi } from '@platejs/plite';

export const input = {
  objectA: {
    text: 'same text',
  },
  objectB: {
    text: 'same text',
    bold: undefined,
  },
};

export const test = ({ objectA, objectB }) => TextApi.equals(objectA, objectB);

export const output = true;
