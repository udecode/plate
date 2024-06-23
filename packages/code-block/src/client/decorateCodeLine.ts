import type { Range } from 'slate';

import {
  type DecorateEntry,
  type PlateEditor,
  type Value,
  getNodeString,
  getParentNode,
  getPlugin,
} from '@udecode/plate-common/server';

import type { CodeBlockPlugin, TCodeBlockElement } from '../shared/types';

import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
} from '../shared/constants';

export interface CodeSyntaxRange extends Range {
  [ELEMENT_CODE_SYNTAX]: true;
  tokenType: string;
}

export const decorateCodeLine = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
): DecorateEntry => {
  const code_block = getPlugin<CodeBlockPlugin, V>(editor, ELEMENT_CODE_BLOCK);
  const code_line = getPlugin<{}, V>(editor, ELEMENT_CODE_LINE);

  const { prism: Prism } = code_block.options;

  if (!Prism) return () => [];

  const { Token, languages, tokenize } = Prism;

  return ([node, path]): CodeSyntaxRange[] => {
    const ranges: CodeSyntaxRange[] = [];

    if (!code_block.options.syntax || node.type !== code_line.type) {
      return ranges;
    }

    const codeBlock = getParentNode<TCodeBlockElement>(editor, path);

    if (!codeBlock) {
      return ranges;
    }

    let langName = codeBlock[0].lang ?? '';

    if (langName === 'plain') {
      langName = '';
    }

    const lang = languages[langName];

    if (!lang) {
      return ranges;
    }

    const text = getNodeString(node);
    const tokens = tokenize(text, lang);
    let offset = 0;

    for (const element of tokens) {
      if (element instanceof Token) {
        ranges.push({
          [ELEMENT_CODE_SYNTAX]: true,
          anchor: { offset, path },
          focus: { offset: offset + element.length, path },
          tokenType: element.type,
        });
      }

      offset += element.length;
    }

    return ranges;
  };
};
