import { getDeserializer } from 'deserializers/utils';

const cb = () => ({ type: 'p' });
export const input = ['p', ['p', 'P'], cb];

export const run = (value: any) => {
  return getDeserializer(value[0], value[1], value[2]);
};

export const output = {
  p: cb,
  P: cb,
};
