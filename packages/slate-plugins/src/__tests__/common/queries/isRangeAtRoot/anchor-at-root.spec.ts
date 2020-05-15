import { isRangeAtRoot } from 'common/queries';
import { Range } from 'slate';

const input: Range = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 1, 0], offset: 0 },
};

const output = true;

it('should be', () => {
  expect(isRangeAtRoot(input)).toEqual(output);
});
