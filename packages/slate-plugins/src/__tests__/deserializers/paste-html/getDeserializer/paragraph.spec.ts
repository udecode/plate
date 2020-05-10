import { getDeserializer } from 'element/utils';

const cb = () => ({ type: 'p' });

const output = {
  p: cb,
  P: cb,
};

it('should be', () => {
  expect(getDeserializer('p', ['p', 'P'], cb)).toEqual(output);
});
