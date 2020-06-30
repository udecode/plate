import { Point } from 'slate';
import { isPointAtRoot } from '../../../../common/queries';

const input: Point = { path: [0, 0], offset: 0 };

const output = true;

it('should be', () => {
  expect(isPointAtRoot(input)).toEqual(output);
});
