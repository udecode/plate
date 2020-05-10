import { deserializeMarks } from 'deserializers/paste-html/utils';

const input = {
  plugins: [{}],
  el: document.createElement('strong'),
  children: [{ text: 'test' }],
};

const output = undefined;

it('should be', () => {
  expect(deserializeMarks(input)).toEqual(output);
});
