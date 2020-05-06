import { deserializeTextNode } from 'deserializers/utils';

export const input = document.createElement('div');

export const run = (value: any) => {
  return deserializeTextNode(value);
};

export const output = undefined;
