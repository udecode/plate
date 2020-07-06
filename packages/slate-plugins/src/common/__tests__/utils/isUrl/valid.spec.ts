import { isUrl } from '../../../utils/index';

const input = 'http://google.com';

const output = true;

it('should be', () => {
  expect(isUrl(input)).toEqual(output);
});
