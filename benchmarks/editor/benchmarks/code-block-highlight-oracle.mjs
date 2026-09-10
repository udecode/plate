/** Require exact syntax boundaries, including unhighlighted text after a token. */
export function hasExactCodeHighlight({
  root,
  className,
  text,
  start,
  end,
  textLength,
}) {
  if (!root || text.length === 0 || end - start !== text.length) return false;
  let trailing = (textLength ?? root.textContent.length) - end;
  if (trailing < 0) return false;
  let node = root.lastChild;
  while (node) {
    if (node.nodeType === 3) {
      const { length } = node.nodeValue;
      if (trailing < length) break;
      trailing -= length;
    } else if (node.lastChild) {
      node = node.lastChild;
      continue;
    }
    while (node && !node.previousSibling && node.parentNode !== root) {
      node = node.parentNode;
    }
    node = node?.previousSibling ?? null;
  }
  for (
    let token = node?.parentElement;
    token && token !== root;
    token = token.parentElement
  ) {
    if (!token.classList.contains(className) || token.textContent !== text) {
      continue;
    }
    const range = root.ownerDocument.createRange();
    range.selectNodeContents(root);
    range.setEndBefore(token);
    if (range.toString().length !== start) continue;
    range.setEndAfter(token);
    if (range.toString().length === end) return true;
  }
  return false;
}

/** Check the inserted keyword, including its position in retained native text. */
export function hasInsertedCodeHighlight({
  canonicalText,
  expectedSuffix,
  mode,
  root,
}) {
  if (!root || !canonicalText?.endsWith(expectedSuffix)) return false;

  let target = root;
  if (mode === 'codemirror') {
    const lines = root.querySelectorAll('.cm-line');
    target = lines.item(lines.length - 1);
  }
  if (!target) return false;
  if (
    mode === 'codemirror'
      ? target.textContent !== expectedSuffix.slice(1)
      : !target.textContent.endsWith(expectedSuffix)
  ) {
    return false;
  }

  const start =
    mode === 'codemirror'
      ? 0
      : canonicalText.length - expectedSuffix.length + 1;
  return hasExactCodeHighlight({
    root: target,
    className: 'hljs-keyword',
    text: 'const',
    start,
    end: start + 5,
    textLength:
      mode === 'codemirror' ? expectedSuffix.length - 1 : canonicalText.length,
  });
}
