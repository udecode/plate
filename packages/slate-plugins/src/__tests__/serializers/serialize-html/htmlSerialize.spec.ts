import { htmlSerialize } from 'serializers/serialize-html';
import { Node as SlateNode } from 'slate';

it('serialize to html', () => {
  const input: SlateNode[] = [];
  const output = '';
  expect(htmlSerialize(input)).toEqual(output);
});
