import type { MdRootContent } from '../../mdast';

const BR_HTML_REGEX = /^<br(?:\s[^>]*)?\/?>$/i;
const LEADING_NEWLINE_REGEX = /^\n/;

const endsWithBr = (node?: MdRootContent): boolean => {
  if (node && 'children' in node && node.children.length > 0) {
    return endsWithBr(node.children.at(-1));
  }

  return (
    (node?.type === 'html' && BR_HTML_REGEX.test(node.value)) ||
    ((node?.type === 'mdxJsxTextElement' ||
      node?.type === 'mdxJsxFlowElement') &&
      node.name === 'br')
  );
};

// A rendered `<br>` already breaks the line, so the source newline right after
// it is dropped.
export const dropNewlineAfterBr = (
  node: MdRootContent,
  previous?: MdRootContent
): MdRootContent =>
  node.type === 'text' && endsWithBr(previous)
    ? { ...node, value: node.value.replace(LEADING_NEWLINE_REGEX, '') }
    : node;
