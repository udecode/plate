import type { Decorate, TRange } from '@udecode/plate';

import { NodeApi } from '@udecode/plate';

import type { TCodeBlockElement } from './types';

import {
  BaseCodeBlockPlugin,
  BaseCodeSyntaxPlugin,
} from './BaseCodeBlockPlugin';

export interface CodeSyntaxRange extends TRange {
  [BaseCodeSyntaxPlugin.key]: true;
  tokenType: string;
}

export const decorateCodeLine: Decorate = ({
  editor,
  entry: [node, path],
  type,
}): CodeSyntaxRange[] => {
  const codeBlockOptions = editor.getOptions(BaseCodeBlockPlugin);

  const { prism: Prism } = codeBlockOptions;

  if (!Prism) return [];

  const { languages, Token, tokenize } = Prism;

  const ranges: CodeSyntaxRange[] = [];

  if (!codeBlockOptions.syntax || node.type !== type) {
    return ranges;
  }

  const codeBlock = editor.api.parent<TCodeBlockElement>(path);

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

  const text = NodeApi.string(node);
  const tokens = tokenize(text, lang);
  let offset = 0;

  for (const element of tokens) {
    if (element instanceof Token) {
      ranges.push({
        anchor: { offset, path },
        [BaseCodeSyntaxPlugin.key]: true,
        focus: { offset: offset + element.length, path },
        tokenType: element.type,
      });
    }

    offset += element.length;
  }

  return ranges;
};
