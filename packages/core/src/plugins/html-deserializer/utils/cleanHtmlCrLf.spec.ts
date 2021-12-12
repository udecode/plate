import { cleanHtmlCrLf } from './cleanHtmlCrLf';

const output = 'a\nb\nc\n';

it('should be', () => {
  expect(cleanHtmlCrLf(`a\r\nb\nc\r`)).toEqual(output);
});
