import type { Decorate } from '@udecode/plate-common';
import type { Range } from 'slate';

import { getNodeString, getParentNode } from '@udecode/plate-common';

import type { TCodeBlockElement } from './types';

import { CodeBlockPlugin, CodeSyntaxPlugin } from './CodeBlockPlugin';

export interface CodeSyntaxRange extends Range {
  [CodeSyntaxPlugin.key]: true;
  tokenType: string;
}

export const decorateCodeLine: Decorate = ({
  editor,
  entry: [node, path],
  plugin,
}): CodeSyntaxRange[] => {
  const codeBlockOptions = editor.getOptions(CodeBlockPlugin);

  const { prism: Prism } = codeBlockOptions;

  if (!Prism) return [];

  const { Token, languages, tokenize } = Prism;

  const ranges: CodeSyntaxRange[] = [];

  if (!codeBlockOptions.syntax || node.type !== plugin.type) {
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
        [CodeSyntaxPlugin.key]: true,
        anchor: { offset, path },
        focus: { offset: offset + element.length, path },
        tokenType: element.type,
      });
    }

    offset += element.length;
  }

  return ranges;
};
