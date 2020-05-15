import { isPointAtRoot } from 'common/queries';
import { Point } from 'slate';

const input: Point = { path: [0, 0, 0], offset: 0 };

const output = false;

it('should be', () => {
  expect(isPointAtRoot(input)).toEqual(output);
});
