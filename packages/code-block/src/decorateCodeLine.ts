/* eslint-disable unused-imports/no-unused-imports,unused-imports/no-unused-vars */
import {
  DecorateEntry,
  PlateEditor,
  Value,
  getNodeString,
  getParentNode,
  getPlugin,
} from '@udecode/plate-common';
// noinspection ES6UnusedImports
import Prism, { Token, languages, tokenize } from 'prismjs';

import 'prismjs/components/prism-antlr4';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cmake';
import 'prismjs/components/prism-coffeescript';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-dart';
// import 'prismjs/components/prism-django';
import 'prismjs/components/prism-docker';
// import 'prismjs/components/prism-ejs';
import 'prismjs/components/prism-erlang';
import 'prismjs/components/prism-git';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-groovy';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-latex';
import 'prismjs/components/prism-less';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-makefile';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-matlab';
import 'prismjs/components/prism-objectivec';
import 'prismjs/components/prism-perl';
// import 'prismjs/components/prism-php';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-properties';
import 'prismjs/components/prism-protobuf';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-scheme';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-wasm';
import 'prismjs/components/prism-yaml';
import { Range } from 'slate';

import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
} from './constants';
import { CodeBlockPlugin, TCodeBlockElement } from './types';

export interface CodeSyntaxRange extends Range {
  tokenType: string;
  [ELEMENT_CODE_SYNTAX]: true;
}

export const decorateCodeLine = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
): DecorateEntry => {
  const code_block = getPlugin<CodeBlockPlugin, V>(editor, ELEMENT_CODE_BLOCK);
  const code_line = getPlugin<{}, V>(editor, ELEMENT_CODE_LINE);

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
          anchor: { path, offset },
          focus: { path, offset: offset + element.length },
          tokenType: element.type,
          [ELEMENT_CODE_SYNTAX]: true,
        });
      }

      offset += element.length;
    }

    return ranges;
  };
};
