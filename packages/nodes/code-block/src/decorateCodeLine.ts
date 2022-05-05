/* eslint-disable @typescript-eslint/no-unused-vars,simple-import-sort/imports */
import {
  Decorate,
  getNodeString,
  getParentNode,
  getPlugin,
  TDescendant,
  TNodeEntry,
} from '@udecode/plate-core';

// noinspection ES6UnusedImports
import Prism, { languages, Token, tokenize } from 'prismjs';
import 'prismjs/components/prism-antlr4';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cmake';
import 'prismjs/components/prism-coffeescript';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-django';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-ejs';
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
import 'prismjs/components/prism-php';
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
import { Node, Range } from 'slate';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
} from './constants';
import { CodeBlockPlugin } from './types';

export interface CodeSyntaxRange extends Range {
  tokenType: string;
  [ELEMENT_CODE_SYNTAX]: true;
}

export const decorateCodeLine: Decorate = (editor) => {
  const code_block = getPlugin<CodeBlockPlugin>(editor, ELEMENT_CODE_BLOCK);
  const code_line = getPlugin(editor, ELEMENT_CODE_LINE);

  return ([node, path]: TNodeEntry<TDescendant>): CodeSyntaxRange[] => {
    const ranges: CodeSyntaxRange[] = [];

    if (!code_block.options.syntax || node.type !== code_line.type) {
      return ranges;
    }

    const codeBlock = getParentNode(editor, path);
    if (!codeBlock) {
      return ranges;
    }

    let langName = codeBlock[0].lang;
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
