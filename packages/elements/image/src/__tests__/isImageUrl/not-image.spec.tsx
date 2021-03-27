import { isImageUrl } from '../../utils/isImageUrl';

const input = 'hello';

const output = false;

it('should be', () => {
  expect(isImageUrl(input)).toEqual(output);
});
