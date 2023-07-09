import { isFirstChild } from '@/packages/slate-utils/src/queries/index';

const input = [0, 0, 0];

const output = true;

it('should be', () => {
  expect(isFirstChild(input)).toEqual(output);
});
