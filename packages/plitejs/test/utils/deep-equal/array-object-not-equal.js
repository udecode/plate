import { TextApi } from 'plitejs';

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
  TextApi.equals(emptyArray.objectA, emptyArray.objectB),
  TextApi.equals(indexedArray.objectA, indexedArray.objectB),
];

export const output = [false, false];
