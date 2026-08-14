import { TextApi } from '@platejs/plite';

export const input = {
  objectA: {
    text: 'same text',
    array: ['array-content'],
    bold: true,
  },
  objectB: {
    text: 'same text',
    array: ['array-content'],
    bold: false,
  },
};

export const test = ({ objectA, objectB }) => TextApi.equals(objectA, objectB);

export const output = false;
