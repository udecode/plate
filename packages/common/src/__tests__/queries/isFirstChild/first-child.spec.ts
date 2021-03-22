import { isFirstChild } from '../../../queries/index';

const input = [0, 0, 0];

const output = true;

it('should be', () => {
  expect(isFirstChild(input)).toEqual(output);
});
