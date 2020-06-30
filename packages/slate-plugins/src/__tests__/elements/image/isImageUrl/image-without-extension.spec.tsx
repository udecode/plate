import { isImageUrl } from '../../../../elements/image/utils';

const input = '//google.com';

const output = false;

it('should be', () => {
  expect(isImageUrl(input)).toEqual(output);
});
