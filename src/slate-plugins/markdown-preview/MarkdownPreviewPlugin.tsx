/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react';
import { css } from 'emotion';
import Prism from 'prismjs';
import { NodeEntry, Text } from 'slate';
import { Plugin, RenderLeafProps } from 'slate-react';

// @ts-ignore
// eslint-disable-next-line
;Prism.languages.markdown=Prism.languages.extend("markup",{}),Prism.languages.insertBefore("markdown","prolog",{blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],title:[{pattern:/\w+.*(?:\r?\n|\r)(?:==+|--+)/,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#+.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.bold.inside.italic=Prism.util.clone(Prism.languages.markdown.italic),Prism.languages.markdown.italic.inside.bold=Prism.util.clone(Prism.languages.markdown.bold); // prettier-ignore

export const decoratePreview = ([node, path]: NodeEntry) => {
  const ranges: any[] = [];

  if (!Text.isText(node)) {
    return ranges;
  }

  const getLength = (token: any) => {
    if (typeof token === 'string') {
      return token.length;
    }
    if (typeof token.content === 'string') {
      return token.content.length;
    }
    return token.content.reduce((l: any, t: any) => l + getLength(t), 0);
  };

  const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
  let start = 0;

  for (const token of tokens) {
    const length = getLength(token);
    const end = start + length;

    if (typeof token !== 'string') {
      ranges.push({
        [token.type]: true,
        anchor: { path, offset: start },
        focus: { path, offset: end },
      });
    }

    start = end;
  }

  return ranges;
};

export const renderLeafPreview = ({
  attributes,
  children,
  leaf,
}: RenderLeafProps) => (
  <span
    {...attributes}
    className={css`
    font-weight: ${leaf.bold && 'bold'};
    font-style: ${leaf.italic && 'italic'};
    text-decoration: ${leaf.underline && 'underline'};
    ${leaf.title &&
      css`
        display: inline-block;
        font-weight: bold;
        font-size: 20px;
        margin: 20px 0 10px 0;
      `}
    ${leaf.list &&
      css`
        padding-left: 10px;
        font-size: 20px;
        line-height: 10px;
      `}
    ${leaf.hr &&
      css`
        display: block;
        text-align: center;
        border-bottom: 2px solid #ddd;
      `}
    ${leaf.blockquote &&
      css`
        display: inline-block;
        border-left: 2px solid #ddd;
        padding-left: 10px;
        color: #aaa;
        font-style: italic;
      `}
    ${leaf.code &&
      css`
        font-family: monospace;
        background-color: #eee;
        padding: 3px;
      `}
  `}
  >
    {children}
  </span>
);

export const MarkdownPreviewPlugin = (): Plugin => ({
  decorate: decoratePreview,
  renderLeaf: renderLeafPreview,
});
