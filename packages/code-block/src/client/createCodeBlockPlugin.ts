import {
  KEY_DESERIALIZE_HTML,
  type PlateEditor,
  type Value,
  createPluginFactory,
  getPlugin,
  someNode,
} from '@udecode/plate-common/server';

import type { CodeBlockPlugin } from '../shared/types';

import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
} from '../shared/constants';
import { decorateCodeLine } from '../shared/decorateCodeLine';
import { deserializeHtmlCodeBlock } from '../shared/deserializeHtmlCodeBlockPre';
import { withCodeBlock } from '../shared/withCodeBlock';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

/** Enables support for pre-formatted code blocks. */
export const createCodeBlockPlugin = createPluginFactory<
  CodeBlockPlugin,
  Value,
  PlateEditor
>({
  deserializeHtml: deserializeHtmlCodeBlock,
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  isElement: true,
  key: ELEMENT_CODE_BLOCK,
  options: {
    hotkey: ['mod+opt+8', 'mod+shift+8'],
    syntax: true,
    syntaxPopularFirst: false,
  },
  plugins: [
    {
      isElement: true,
      key: ELEMENT_CODE_LINE,
    },
    {
      decorate: decorateCodeLine,
      isLeaf: true,
      key: ELEMENT_CODE_SYNTAX,
    },
  ],
  then: (editor) => ({
    inject: {
      pluginsByKey: {
        [KEY_DESERIALIZE_HTML]: {
          editor: {
            insertData: {
              query: () => {
                const code_line = getPlugin(editor, ELEMENT_CODE_LINE);

                return !someNode(editor, {
                  match: { type: code_line.type },
                });
              },
            },
          },
        },
      },
    },
  }),
  withOverrides: withCodeBlock,
});
