import { deserializeBreak } from 'deserializers/utils';

export const input = document.createElement('br');

export const run = (value: any) => {
  return deserializeBreak(value);
};

export const output = '\n';
