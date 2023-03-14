import {
  createPluginFactory,
  getPlugin,
  KEY_DESERIALIZE_HTML,
  PlateEditor,
  someNode,
  Value,
} from '@udecode/plate-common';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
} from './constants';
import { decorateCodeLine } from './decorateCodeLine';
import { deserializeHtmlCodeBlock } from './deserializeHtmlCodeBlockPre';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';
import { CodeBlockPlugin } from './types';
import { withCodeBlock } from './withCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const createCodeBlockPlugin = createPluginFactory<
  CodeBlockPlugin,
  Value,
  PlateEditor
>({
  key: ELEMENT_CODE_BLOCK,
  isElement: true,
  deserializeHtml: deserializeHtmlCodeBlock,
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  withOverrides: withCodeBlock,
  options: {
    hotkey: ['mod+opt+8', 'mod+shift+8'],
    syntax: true,
    syntaxPopularFirst: false,
  },
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
  plugins: [
    {
      key: ELEMENT_CODE_LINE,
      isElement: true,
    },
    {
      key: ELEMENT_CODE_SYNTAX,
      isLeaf: true,
      decorate: decorateCodeLine,
    },
  ],
});
