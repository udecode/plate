import { deserializeBreak } from 'deserializers/utils';

export const input = document.createElement('div');

export const run = (value: any) => {
  return deserializeBreak(value);
};

export const output = undefined;
