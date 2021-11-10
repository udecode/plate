import { cleanCrLf } from './cleanCrLf';

const output = 'a\nb\nc\n';

it('should be', () => {
  expect(cleanCrLf(`a\r\nb\nc\r`)).toEqual(output);
});
