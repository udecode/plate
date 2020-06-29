import { isImageUrl } from '../../../../elements/image/utils';

const input = 'hello';

const output = false;

it('should be', () => {
  expect(isImageUrl(input)).toEqual(output);
});
