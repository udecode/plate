import { isFirstChild } from '../../../../../slate-utils/src/queries';

const input = [0, 0, 0];

const output = true;

it('should be', () => {
  expect(isFirstChild(input)).toEqual(output);
});
