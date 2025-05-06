export const splitIncompleteMdx = (data: string): string[] | string => {
  const tagRe = /<([A-Za-z][^\s/>]*)(?:\s[^>]*)?>|<\/([A-Za-z][^\s/>]*)\s*>/g;

  interface Frame {
    idx: number;
    name: string;
  }
  const stack: Frame[] = [];

  let m: RegExpExecArray | null;
  let lastMatchEnd = 0; // end offset of the last tag we matched

  while ((m = tagRe.exec(data))) {
    lastMatchEnd = tagRe.lastIndex;
    const full = m[0];

    if (full.endsWith('/>')) continue; // self‑closing

    if (m[1]) stack.push({ idx: m.index, name: m[1].toLowerCase() });
    else if (m[2]) {
      const want = m[2].toLowerCase();
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === want) {
          stack.splice(i, 1);
          break;
        }
      }
    }
  }

  // Case 1: unmatched opening tags → split at the first of them
  if (stack.length > 0) {
    const cut = stack[0].idx;
    return [data.slice(0, cut), data.slice(cut)];
  }

  // Case 2: no unmatched tags, but the stream ended inside a tag name
  const tail = data.slice(lastMatchEnd);
  const lt = tail.indexOf('<');
  const gt = tail.indexOf('>');

  if (lt !== -1 && gt === -1) {
    // Incomplete tag starts at absolute offset = lastMatchEnd + lt
    const cut = lastMatchEnd + lt;
    return [data.slice(0, cut), data.slice(cut)];
  }

  // Fully balanced
  return data;
};
