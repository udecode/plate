import { deserializeTextNode } from 'deserializers/utils';

export const input = document.createTextNode('test');

export const run = (value: any) => {
  return deserializeTextNode(value);
};

export const output = 'test';
