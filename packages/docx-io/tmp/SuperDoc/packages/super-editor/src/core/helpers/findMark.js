export const findMark = (state, markType, toArr = false) => {
  const { selection, doc } = state;
  const { $from, $to } = selection;

  const fromMark = $from.marks().find((mark) => mark.type === markType);
  const toMark = $to.marks().find((mark) => mark.type === markType);

  let markFound;
  const marksFound = [];

  doc.nodesBetween($from.pos, $to.pos, (node, from) => {
    if (node.marks) {
      const actualMark = node.marks.find((mark) => mark.type === markType);
      if (actualMark) {
        markFound = {
          from,
          to: from + node.nodeSize,
          attrs: actualMark.attrs,
          contained: !fromMark || !toMark || fromMark === toMark,
        };
        marksFound.push(markFound);
      }
    }
  });

  if (toArr) {
    return marksFound;
  }

  return markFound;
};
