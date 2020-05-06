import { deserializeFragment } from 'deserializers/utils';

export const input = {
  el: document.createElement('div'),
  children: [],
};

export const run = (value: any) => {
  return deserializeFragment(value);
};

export const output = undefined;
