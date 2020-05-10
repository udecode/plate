import { isImageUrl } from 'elements/image/utils';

const input = 'https://i.imgur.com/removed.png';

const output = true;

it('should be', () => {
  expect(isImageUrl(input)).toEqual(output);
});
