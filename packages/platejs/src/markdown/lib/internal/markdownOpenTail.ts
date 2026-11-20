import type { Nodes, Root } from 'mdast';
import type { Plugin as UnifiedPlugin } from 'unified';

type Run = Readonly<{ from: number; to: number }>;

const MARKERS = '*_~';
const HIDDEN_BUDGET = 3;
const ANY_LETTER = 'a';
const WORD = /[^\s\p{P}\p{S}]/u;
const DIGIT = /\p{N}/u;

const startOf = (node: Nodes) => node.position?.start.offset ?? Number.NaN;
const endOf = (node: Nodes) => node.position?.end.offset ?? Number.NaN;
const isPlaced = (node: Nodes): boolean =>
  !Number.isNaN(startOf(node) + endOf(node)) &&
  (!('children' in node) || node.children.every(isPlaced));

const codePointBefore = (text: string, at: number) =>
  /.$/su.exec(text.slice(Math.max(0, at - 2), at))?.[0] ?? '';

const isEscaped = (text: string, at: number) => {
  let slashes = 0;

  while (text[at - 1 - slashes] === '\\') slashes += 1;

  return slashes % 2 === 1;
};

const findOpenLeaf = (tree: Root) => {
  let node: Nodes = tree;

  while (node.type !== 'heading' && node.type !== 'paragraph') {
    const last: Nodes | undefined =
      'children' in node ? node.children.at(-1) : undefined;

    if (!last) return null;
    node = last;
  }
  const last = node.children.at(-1);

  return last && node.children.every(isPlaced) ? node : null;
};

// A closed code span is a node of its own, so a backtick left in text is
// unclosed. A later backtick can pair with it from any depth and turn what
// follows it into code.
const hasOpenBacktick = (text: string, node: Nodes): boolean => {
  if ('children' in node) {
    return node.children.some((child) => hasOpenBacktick(text, child));
  }
  if (node.type !== 'text') return false;
  for (let at = startOf(node); at < endOf(node); at += 1) {
    if (text[at] === '`' && !isEscaped(text, at)) return true;
  }

  return false;
};

const markerRuns = (text: string, from: number, to: number) => {
  const runs: Run[] = [];

  for (let at = from; at < to; at += 1) {
    const marker = text.charAt(at);

    if (!MARKERS.includes(marker) || isEscaped(text, at)) continue;
    let end = at + 1;

    while (end < to && text[end] === marker) end += 1;
    runs.push({ from: at, to: end });
    at = end - 1;
  }

  return runs;
};

const canOpen = (text: string, from: number, length: number, after: string) => {
  const before = codePointBefore(text, from);
  const afterWord = WORD.test(before);

  if (length > 3 || /\s/.test(after)) return false;
  if (afterWord && !WORD.test(after)) return false;
  if (text[from] === '~') return length === 2;
  if (text[from] === '_') return !afterWord;

  return !afterWord || (length > 1 && !DIGIT.test(before));
};

const isHeld = (text: string, { from, to }: Run) => {
  if (text[from] === '\\') return true;
  if (to < text.length) return canOpen(text, from, to - from, text.charAt(to));
  for (let length = to - from; length <= 3; length += 1) {
    if (canOpen(text, from, length, ANY_LETTER)) return true;
  }

  return false;
};

const heldRuns = (text: string, from: number) => {
  const end = text.length;
  const escape = text.endsWith('\\') && !isEscaped(text, end - 1);
  const markersEnd = escape ? end - 1 : end;
  let start = markersEnd;

  while (start > from && MARKERS.includes(text.charAt(start - 1))) start -= 1;
  const held: Run[] = [];
  let budget = HIDDEN_BUDGET;

  for (const run of [
    ...markerRuns(text, start, markersEnd),
    ...(escape ? [{ from: markersEnd, to: end }] : []),
  ]) {
    const length = run.to - run.from;

    if (length <= budget && isHeld(text, run)) {
      held.push(run);
      budget -= length;
    }
  }

  return held;
};

export const remarkHoldOpenTail: UnifiedPlugin<[onHeld: () => void], Root> =
  (onHeld) => (tree, file) => {
    const text = String(file);

    if (!/[*_~\\]$/.test(text)) return;
    const leaf = findOpenLeaf(tree);
    const last = leaf?.children.at(-1);

    if (
      !leaf ||
      last?.type !== 'text' ||
      endOf(last) !== text.length ||
      hasOpenBacktick(text, leaf)
    ) {
      return;
    }
    const held = heldRuns(text, startOf(last));
    const outermost = held.at(0);

    if (!outermost) return;
    const tail = text.slice(outermost.from);

    if (!last.value.endsWith(tail)) return;
    let shown = '';
    let at = outermost.from;

    for (const run of held) {
      shown += text.slice(at, run.from);
      at = run.to;
    }
    last.value = last.value.slice(0, -tail.length) + shown + text.slice(at);
    onHeld();
  };
