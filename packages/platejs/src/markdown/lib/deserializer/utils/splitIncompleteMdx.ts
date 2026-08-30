/** Check if character is valid for tag name: A-Z / a-z / 0-9 / $ - . _ : */
const isNameChar = (c: number) =>
  // 0-9
  (c >= 48 && c <= 57) ||
  // A-Z
  (c >= 65 && c <= 90) ||
  // a-z
  (c >= 97 && c <= 122) ||
  // $
  c === 36 ||
  // -
  c === 45 ||
  // .
  c === 46 ||
  // _
  c === 95 ||
  // :
  c === 58;

const isNameBoundary = (c: number) =>
  // /
  c === 47 ||
  // >
  c === 62 ||
  // tab
  c === 9 ||
  // newline
  c === 10 ||
  // form feed
  c === 12 ||
  // carriage return
  c === 13 ||
  // space
  c === 32;

export const splitIncompleteMdx = (data: string): string[] | string => {
  type Frame = {
    name: string;
    pos: number;
  };
  const stack: Frame[] = [];

  const len = data.length;
  let i = 0;
  // Once "incomplete" is found, record the starting position and exit scanning
  let cutPos = -1;

  while (i < len) {
    /* '<' */
    if (data.codePointAt(i) !== 60) {
      i += 1;
      continue;
    }

    // Remember the position of '<'
    const tagStart = i;
    // Skip '<'
    i += 1;
    if (i >= len) {
      cutPos = tagStart;
      break;
      // Stream breaks at '<'
    }

    let closing = false;
    if (data[i] === '/') {
      closing = true;
      i += 1;
    }

    /* Parse tag name -------------------------------------------------- */
    const nameStart = i;
    while (i < len && isNameChar(data.codePointAt(i) as number)) i += 1;
    if (nameStart === i) {
      cutPos = tagStart;
      break;
      // No name after '<'
    }

    const tagName = data.slice(nameStart, i).toLowerCase();
    const next = data.codePointAt(i);

    if (next !== undefined && !isNameBoundary(next)) {
      cutPos = tagStart;
      break;
    }

    /* Skip to matching '>' (considering quotes) ------------------------------------ */
    let inQuote: "'" | '"' | null = null;
    let foundTagEnd = false;
    let selfClosing = false;

    while (i < len) {
      const ch = data[i];
      if (inQuote) {
        if (ch === inQuote) inQuote = null;
      } else if (ch === '"' || ch === "'") inQuote = ch;
      else if (ch === '>') {
        foundTagEnd = true;
        selfClosing = data[i - 1] === '/';
        // Include '>'
        i += 1;
        break;
      }
      i += 1;
    }

    if (!foundTagEnd) {
      // Didn't reach '>'
      cutPos = tagStart;
      break;
    }

    /* Maintain stack ------------------------------------------------------ */
    if (selfClosing) continue;

    if (closing) {
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].name === tagName) {
          stack.splice(j, 1);
          break;
        }
      }
    } else {
      stack.push({ name: tagName, pos: tagStart });
    }
  }

  /* Calculate final cut point -------------------------------------------------- */
  if (stack.length > 0) {
    const firstUnmatched = stack[0].pos;
    cutPos = cutPos === -1 ? firstUnmatched : Math.min(cutPos, firstUnmatched);
  }

  return cutPos === -1 ? data : [data.slice(0, cutPos), data.slice(cutPos)];
};
