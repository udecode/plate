import { isDeepEqual } from '../../../src/utils/deep-equal';

export const input = {
  emptyArray: {
    objectA: { array: [] },
    objectB: { array: {} },
  },
  indexedArray: {
    objectA: { array: ['array-content'] },
    objectB: { array: { 0: 'array-content' } },
  },
};

export const test = ({ emptyArray, indexedArray }) => [
  isDeepEqual(emptyArray.objectA, emptyArray.objectB),
  isDeepEqual(indexedArray.objectA, indexedArray.objectB),
];

export const output = [false, false];
