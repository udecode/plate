/** Check if character is valid for tag name: A-Z / a-z / 0-9 / - _ : */
const isNameChar = (c: number) =>
  (c >= 48 && c <= 57) || // 0-9
  (c >= 65 && c <= 90) || // A-Z
  (c >= 97 && c <= 122) || // a-z
  c === 45 || // -
  c === 95 || // _
  c === 58; // :

export const splitIncompleteMdx = (data: string): string[] | string => {
  type Frame = {
    name: string;
    pos: number;
  };
  const stack: Frame[] = [];

  const len = data.length;
  let i = 0;
  let cutPos = -1; // Once "incomplete" is found, record the starting position and exit scanning

  while (i < len) {
    if (data.codePointAt(i) !== 60 /* '<' */) {
      i++;
      continue;
    }

    const tagStart = i; // Remember the position of '<'
    i++; // Skip '<'
    if (i >= len) {
      cutPos = tagStart;
      break;
    } // Stream breaks at '<'

    let closing = false;
    if (data[i] === '/') {
      closing = true;
      i++;
    }

    /* Parse tag name -------------------------------------------------- */
    const nameStart = i;
    while (i < len && isNameChar(data.codePointAt(i) as number)) i++;
    if (nameStart === i) {
      cutPos = tagStart;
      break;
    } // No name after '<'

    const tagName = data.slice(nameStart, i).toLowerCase();

    /* Skip to matching '>' (considering quotes) ------------------------------------ */
    let inQuote: "'" | '"' | null = null;
    let selfClosing = false;

    while (i < len) {
      const ch = data[i];
      if (inQuote) {
        if (ch === inQuote) inQuote = null;
      } else if (ch === '"' || ch === "'") inQuote = ch;
      else if (ch === '>') {
        selfClosing = data[i - 1] === '/';
        i++; // Include '>'
        break;
      }
      i++;
    }

    if (i >= len) {
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
