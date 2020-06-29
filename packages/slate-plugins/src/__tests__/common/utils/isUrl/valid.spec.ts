import { isUrl } from '../../../../common/utils';

const input = 'http://localhost';

const output = true;

it('should be', () => {
  expect(isUrl(input)).toEqual(output);
});
