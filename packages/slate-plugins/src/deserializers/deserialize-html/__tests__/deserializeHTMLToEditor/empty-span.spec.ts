import { SlatePlugin } from '@udecode/slate-plugins-core';
import { SlateDocument } from '../../../../common/index';
import { deserializeHTMLToDocument } from '../../index';

const plugins: SlatePlugin[] = [];
const body = document.createElement('span');

const output: SlateDocument = [
  {
    children: [{ text: '' }],
  },
];

it('should be', () => {
  expect(
    deserializeHTMLToDocument({
      plugins,
      element: body,
    })
  ).toEqual(output);
});
