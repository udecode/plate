// eslint-disable-next-line simple-import-sort/imports
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import { NodeEntry, Text } from 'slate'; // noinspection CommaExpressionJS

/**
 * Decorate texts with markdown preview.
 */
export const decoratePreview = () => ([node, path]: NodeEntry) => {
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
