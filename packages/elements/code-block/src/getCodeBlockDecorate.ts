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
// import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-scheme';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-wasm';
import 'prismjs/components/prism-yaml';
import {
  Decorate,
  getPlatePluginOptions,
  isElement,
} from '@udecode/plate-core';
import { Node, NodeEntry } from 'slate';
import { ELEMENT_CODE_BLOCK } from './defaults';
import { CodeBlockNodeData } from './types';

export const getCodeBlockDecorate = (): Decorate => (editor) => {
  const code_block = getPlatePluginOptions(editor, ELEMENT_CODE_BLOCK);

  return (entry: NodeEntry) => {
    const ranges: any = [];
    const [node, path] = entry;
    let langName = (node as Node & CodeBlockNodeData)?.lang;
    if (!code_block?.syntax || !langName || langName === 'plain') {
      langName = '';
    }
    const lang = languages[langName];

    if (!lang) {
      return ranges;
    }

    if (isElement(node) && node.type === code_block.type) {
      const text = Node.string(node);
      const tokens = tokenize(text, lang);
      let offset = 0;

      for (const element of tokens) {
        if (typeof element === 'string') {
          offset += element.length;
        } else {
          const token: Token = element;
          ranges.push({
            anchor: { path, offset },
            focus: { path, offset: offset + token.length },
            className: `prism-token token ${token.type} `,
            prism: true,
          });
          offset += token.length;
        }
      }
    }
    return ranges;
  };
};
