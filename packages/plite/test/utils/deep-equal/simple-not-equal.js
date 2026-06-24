import { isDeepEqual } from '../../../src/utils/deep-equal';

export const input = {
  objectA: { text: 'same text', bold: true },
  objectB: { text: 'same text', bold: true, italic: true },
};

export const test = ({ objectA, objectB }) => isDeepEqual(objectA, objectB);

export const output = false;
