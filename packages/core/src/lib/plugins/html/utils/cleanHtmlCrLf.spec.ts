import { cleanHtmlCrLf } from './cleanHtmlCrLf';

const output = 'a\nb\nc\n';

it('normalizes CRLF variants to newlines', () => {
  expect(cleanHtmlCrLf('a\r\nb\nc\r')).toEqual(output);
});
