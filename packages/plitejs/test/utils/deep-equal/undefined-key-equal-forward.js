import { TextApi } from 'plitejs';

export const input = {
  objectA: {
    text: 'same text',
    bold: undefined,
  },
  objectB: {
    text: 'same text',
  },
};

export const test = ({ objectA, objectB }) => TextApi.equals(objectA, objectB);

export const output = true;
