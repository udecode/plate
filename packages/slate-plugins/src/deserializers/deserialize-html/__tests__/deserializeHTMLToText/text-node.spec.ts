import { deserializeHTMLToText } from '../../utils/index';

const input = document.createTextNode('test');

const output = 'test';

it('should be', () => {
  expect(deserializeHTMLToText(input)).toEqual(output);
});
