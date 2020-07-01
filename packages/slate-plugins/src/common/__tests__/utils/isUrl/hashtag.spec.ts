import { isUrl } from '../../../utils/isUrl';

const input = '#';

const output = false;

it('should be', () => {
  expect(isUrl(input)).toEqual(output);
});
