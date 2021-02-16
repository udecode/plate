import { isImageUrl } from '../../utils/isImageUrl';

const input = 'https://i.imgur.com/removed.png';

const output = true;

it('should be', () => {
  expect(isImageUrl(input)).toEqual(output);
});
