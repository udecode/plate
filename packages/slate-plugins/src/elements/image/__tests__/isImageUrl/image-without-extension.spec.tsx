import { isImageUrl } from '../../utils/index';

const input = '//google.com';

const output = false;

it('should be', () => {
  expect(isImageUrl(input)).toEqual(output);
});
