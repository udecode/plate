import { isFirstChild } from '@/packages/slate-utils/src/queries/index';

const input = [0, 0, 1];

const output = false;

it('should be', () => {
  expect(isFirstChild(input)).toEqual(output);
});
