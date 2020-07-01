import { isUrl } from '../../../utils/index';

const input = 'test';

const output = false;

it('should be', () => {
  expect(isUrl(input)).toEqual(output);
});
