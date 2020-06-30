import { isUrl } from '../../../../common/utils';

const input = 'test';

const output = false;

it('should be', () => {
  expect(isUrl(input)).toEqual(output);
});
