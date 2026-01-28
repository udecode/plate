// https://discuss.prosemirror.net/t/expanding-the-selection-to-the-active-mark/
export const findMarkPosition = (doc, pos, markName) => {
  const $pos = doc.resolve(pos);
  const parent = $pos.parent;
  const start = parent.childAfter($pos.parentOffset);

  if (!start.node) {
    return null;
  }

  const actualMark = start.node.marks.find((mark) => mark.type.name === markName);

  let startIndex = $pos.index();
  let startPos = $pos.start() + start.offset;

  while (startIndex > 0 && actualMark.isInSet(parent.child(startIndex - 1).marks)) {
    startPos -= parent.child(--startIndex).nodeSize;
  }

  let endIndex = $pos.index() + 1;
  let endPos = $pos.start() + start.offset + start.node.nodeSize;

  while (endIndex < parent.childCount && actualMark.isInSet(parent.child(endIndex).marks)) {
    endPos += parent.child(endIndex++).nodeSize;
  }

  return {
    from: startPos,
    to: endPos,
    attrs: actualMark.attrs,
  };
};

export const flatten = (node, descend = true) => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  }
  const result = [];
  node.descendants((child, pos) => {
    result.push({ node: child, pos });
    if (!descend) {
      return false;
    }
  });
  return result;
};

export const findChildren = (node, predicate, descend) => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  } else if (!predicate) {
    throw new Error('Invalid "predicate" parameter');
  }
  return flatten(node, descend).filter((child) => predicate(child.node));
};

export const findInlineNodes = (node, descend) => {
  return findChildren(node, (child) => child.isInline, descend);
};
