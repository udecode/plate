import { deserializeHTMLToMarks } from 'deserializers/deserialize-html/utils';

const input = {
  plugins: [{}],
  el: document.createElement('strong'),
  children: [{ text: 'test' }],
};

const output = undefined;

it('should be', () => {
  expect(deserializeHTMLToMarks(input)).toEqual(output);
});
