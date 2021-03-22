import { SlateDocument } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { deserializeHTMLToDocument } from '../../utils/deserializeHTMLToDocument';

const plugins: SlatePlugin[] = [];
const body = document.createElement('span');

const output: SlateDocument = [
  {
    children: [{ text: '' }],
  },
];

it('should be', () => {
  expect(
    deserializeHTMLToDocument(createEditorPlugins(), {
      plugins,
      element: body,
    })
  ).toEqual(output);
});
