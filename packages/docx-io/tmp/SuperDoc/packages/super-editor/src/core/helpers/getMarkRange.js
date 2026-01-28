import { objectIncludes } from '../utilities/objectIncludes.js';

function findMarkInSet(marks, type, attrs = {}) {
  return marks.find((item) => {
    return item.type === type && objectIncludes(item.attrs, attrs);
  });
}

function isMarkInSet(marks, type, attrs = {}) {
  return !!findMarkInSet(marks, type, attrs);
}

export function getMarkRange($pos, type, attrs = {}) {
  if (!$pos || !type) return;

  let start = $pos.parent.childAfter($pos.parentOffset);

  if ($pos.parentOffset === start.offset && start.offset !== 0) {
    start = $pos.parent.childBefore($pos.parentOffset);
  }

  if (!start.node) return;

  const mark = findMarkInSet([...start.node.marks], type, attrs);
  if (!mark) return;

  let startIndex = start.index;
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1;
  let endPos = startPos + start.node.nodeSize;

  findMarkInSet([...start.node.marks], type, attrs);

  while (startIndex > 0 && mark.isInSet($pos.parent.child(startIndex - 1).marks)) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }

  while (endIndex < $pos.parent.childCount && isMarkInSet([...$pos.parent.child(endIndex).marks], type, attrs)) {
    endPos += $pos.parent.child(endIndex).nodeSize;
    endIndex += 1;
  }

  return { from: startPos, to: endPos };
}
