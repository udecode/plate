/* eslint-disable react/jsx-no-comment-textnodes */
/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createSlateEditor,
  serializeHtml,
} from '@udecode/plate';
import { createPlateEditor } from '@udecode/plate/react';
import { jsxt } from '@udecode/plate-test-utils';

import { CodeBlockElementStatic } from '../../../../../apps/www/src/registry/default/plate-ui/code-block-element-static';
import { CodeLineElementStatic } from '../../../../../apps/www/src/registry/default/plate-ui/code-line-element-static';
import { CodeSyntaxLeafStatic } from '../../../../../apps/www/src/registry/default/plate-ui/code-syntax-leaf-static';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '../BaseCodeBlockPlugin';

export const createBasicTable = (): any => (
  <fragment>
    <hcodeblock lang="javascript">
      <hcodeline>// Use code blocks to showcase code snippets</hcodeline>
      <hcodeline>{`function greet() {`}</hcodeline>
      <hcodeline>{`  console.info('Hello World!');`}</hcodeline>
      <hcodeline>{`}`}</hcodeline>
    </hcodeblock>
  </fragment>
);

jsxt;

describe('deserialize code block', () => {
  it('should deserialize code block html correctly', async () => {
    const editor = createPlateEditor({
      plugins: [BaseCodeBlockPlugin, BaseCodeLinePlugin, BaseCodeSyntaxPlugin],
    });

    const exportToHtml = async () => {
      const components = {
        [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
        [BaseCodeLinePlugin.key]: CodeLineElementStatic,
        [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
      };

      const editorStatic = createSlateEditor({
        plugins: [
          BaseCodeBlockPlugin,
          BaseCodeLinePlugin,
          BaseCodeSyntaxPlugin,
          BaseParagraphPlugin,
        ],
        value: createBasicTable(),
      });

      const editorHtml = await serializeHtml(editorStatic, {
        components,
        props: { style: { padding: '0 calc(50% - 350px)', paddingBottom: '' } },
      });

      return editorHtml;
    };

    const html = await exportToHtml();

    const deserializedNodes = editor.api.html.deserialize({
      collapseWhiteSpace: false,
      element: html,
    });

    expect(deserializedNodes).toEqual(createBasicTable());
  });
});
