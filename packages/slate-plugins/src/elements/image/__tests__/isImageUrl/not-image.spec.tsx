import { isImageUrl } from '../../utils/index';

const input = 'hello';

const output = false;

it('should be', () => {
  expect(isImageUrl(input)).toEqual(output);
});
