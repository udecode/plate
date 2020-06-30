import { Range } from 'slate';
import { isRangeAtRoot } from '../../../../common/queries';

const input: Range = {
  anchor: { path: [0, 0, 0], offset: 0 },
  focus: { path: [0, 1], offset: 0 },
};

const output = true;

it('should be', () => {
  expect(isRangeAtRoot(input)).toEqual(output);
});
