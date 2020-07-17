import { deserializeHTMLToBreak } from '../../utils/index';

const input = document.createElement('br');

const output = '\n';

it('should be', () => {
  expect(deserializeHTMLToBreak(input)).toEqual(output);
});
