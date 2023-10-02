/* eslint-disable unused-imports/no-unused-imports,unused-imports/no-unused-vars */
import {
  DecorateEntry,
  getNodeString,
  getParentNode,
  getPlugin,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
// noinspection ES6UnusedImports
import Prism, { languages, Token, tokenize } from 'prismjs';

import 'prismjs/components/prism-antlr4.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-cmake.js';
import 'prismjs/components/prism-coffeescript.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-csharp.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-dart.js';
// import 'prismjs/components/prism-django.js';
import 'prismjs/components/prism-docker.js';
// import 'prismjs/components/prism-ejs.js';
import 'prismjs/components/prism-erlang.js';
import 'prismjs/components/prism-git.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-graphql.js';
import 'prismjs/components/prism-groovy.js';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/components/prism-jsx.js';
import 'prismjs/components/prism-kotlin.js';
import 'prismjs/components/prism-latex.js';
import 'prismjs/components/prism-less.js';
import 'prismjs/components/prism-lua.js';
import 'prismjs/components/prism-makefile.js';
import 'prismjs/components/prism-markdown.js';
import 'prismjs/components/prism-matlab.js';
import 'prismjs/components/prism-objectivec.js';
import 'prismjs/components/prism-perl.js';
// import 'prismjs/components/prism-php.js';
import 'prismjs/components/prism-powershell.js';
import 'prismjs/components/prism-properties.js';
import 'prismjs/components/prism-protobuf.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-r.js';
import 'prismjs/components/prism-ruby.js';
import 'prismjs/components/prism-sass.js';
import 'prismjs/components/prism-scala.js';
import 'prismjs/components/prism-scheme.js';
import 'prismjs/components/prism-scss.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-swift.js';
import 'prismjs/components/prism-tsx.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-wasm.js';
import 'prismjs/components/prism-yaml.js';

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
  E extends PlateEditor<V> = PlateEditor<V>,
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
