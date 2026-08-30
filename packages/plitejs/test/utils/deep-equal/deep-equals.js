import { TextApi } from 'plitejs';

export const input = {
  objectA: {
    text: 'same text',
    bold: true,
    italic: { origin: 'inherited', value: false },
  },
  objectB: {
    text: 'same text',
    bold: true,
    italic: { origin: 'inherited', value: false },
  },
};

export const test = ({ objectA, objectB }) => TextApi.equals(objectA, objectB);

export const output = true;
