import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate';

import { htmlDeserializerCodeBlock } from './deserializer/htmlDeserializerCodeBlock';
import { withCodeBlock } from './withCodeBlock';

export type CodeBlockConfig = PluginConfig<'code_block'>;

export const BaseCodeSyntaxPlugin = createSlatePlugin({
  key: 'code_syntax',
  node: { isLeaf: true },
});

export const BaseCodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
  key: 'code_block',
  node: { isElement: true },
  options: {
    lowlight: null,
  },
  parsers: { html: { deserializer: htmlDeserializerCodeBlock } },
  plugins: [BaseCodeSyntaxPlugin],
}).overrideEditor(withCodeBlock);
