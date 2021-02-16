import { deserializeHTMLToBreak } from '../../utils/deserializeHTMLToBreak';

const input = document.createElement('br');

const output = '\n';

it('should be', () => {
  expect(deserializeHTMLToBreak(input)).toEqual(output);
});
