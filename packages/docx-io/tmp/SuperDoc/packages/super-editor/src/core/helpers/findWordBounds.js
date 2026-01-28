/**
 * Find the closest word when double click event fires.
 * @param doc view document.
 * @param pos event position.
 * @returns position of the word.
 */
export const findWordBounds = (doc, pos) => {
  const $pos = doc.resolve(pos);
  const parent = $pos.parent;
  const offsetInParent = $pos.parentOffset;

  let offset = 0;
  let targetNode = null;
  let nodeStart = 0;

  parent.forEach((child, childOffset) => {
    if (child.isText) {
      const start = offset;
      const end = offset + child.nodeSize;
      if (start <= offsetInParent && offsetInParent <= end) {
        targetNode = child;
        nodeStart = childOffset;
      }
      offset = end;
    } else {
      offset += child.nodeSize;
    }
  });

  if (!targetNode) return;

  const text = targetNode.text;
  const cursorOffset = offsetInParent - nodeStart;

  const isWordChar = (ch) => /\w/.test(ch);
  const isPunctOrSpace = (ch) => /[.,;:!-?=()[\]{}"'\s]/.test(ch);

  let from, to;

  if (isPunctOrSpace(text[cursorOffset])) {
    from = $pos.start() + nodeStart + cursorOffset;
    to = from + 1;
  } else {
    // Select only word characters (no trailing punctuation)
    let start = cursorOffset;
    while (start > 0 && isWordChar(text[start - 1])) start--;

    let end = cursorOffset;
    while (end < text.length && isWordChar(text[end])) end++;

    if (start === end) return;

    from = $pos.start() + nodeStart + start;
    to = $pos.start() + nodeStart + end;
  }

  return { from, to };
};
