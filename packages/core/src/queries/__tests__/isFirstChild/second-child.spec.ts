import { isFirstChild } from '../../index';

const input = [0, 0, 1];

const output = false;

it('should be', () => {
  expect(isFirstChild(input)).toEqual(output);
});
