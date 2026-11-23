import type { Heading, Nodes, Paragraph, Root } from 'mdast';
import {
  classifyCharacter,
  classifyPrecedingCharacter,
  isCjk,
  isCjkOrIvs,
  isIvs,
  isNonCjkPunctuation,
  isSpaceOrPunctuation,
  isUnicodeWhitespace,
} from 'micromark-extension-cjk-friendly-util';
import type { Plugin as UnifiedPlugin } from 'unified';

import type { Descendant } from '../../../core';

type Run = Readonly<{ from: number; to: number }>;

type Offer = Run & Readonly<{ split: boolean }>;

export type MarkdownGrammar = Readonly<{
  attention: 'cjkFriendly' | 'commonmark' | null;
  strikethrough: 'cjkFriendly' | 'gfm' | null;
}>;

export type OpenTailCopy = Readonly<{
  closers: Run;
  delimiters: readonly number[];
  droppedRuns: readonly string[];
  splitEmphasisLength: number | null;
  text: string;
}>;

export type OpenTailPlan = Readonly<{
  copy: OpenTailCopy | null;
  heldFromEnd: readonly Run[];
}>;

export type MarkdownMarkKinds = Readonly<{
  emphasis: ReadonlySet<string>;
  exact: ReadonlySet<string>;
  strong: ReadonlySet<string>;
}>;

type CopyPlanRead = Readonly<{
  from: number;
  grammar: MarkdownGrammar;
  mode: 'planCopy';
  onPlan: (plan: OpenTailPlan) => void;
}>;

type HoldPlanRead = Readonly<{
  grammar: MarkdownGrammar;
  mode: 'planHold';
  onPlan: (plan: OpenTailPlan) => void;
}>;

export type OpenTailRead =
  | CopyPlanRead
  | HoldPlanRead
  | Readonly<{
      copy: OpenTailCopy;
      heldFromEnd: readonly Run[];
      mode: 'pairCopy';
    }>;

type Code = number | null;

const MARKERS = '*_~';
const STAR = 42;
const UNDERSCORE = 95;
const TILDE = 126;
const HIDDEN_BUDGET = 3;
const MAX_OFFERS = 4;
const WINDOW = 1000;
// Under every rule here a letter after a run opens it whenever any character
// does.
const ANY_LETTER = 'a';
const LETTER = /\p{L}/u;
const DIGIT = /\p{N}/u;
const PARAGRAPH_REST = /^[ \t]*(?:(?:\r\n?|\n)[ \t>]*)?$/;
// A line ending closes an ATX heading and underlines a setext one.
const HEADING_REST = /^[ \t]*(?:#+[ \t]*)?$/;

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

const lengthOf = (run: Run) => run.to - run.from;

// micromark-util-classify-character@2.0.1 reads one UTF-16 code unit: 1 for
// whitespace, 2 for punctuation and undefined for anything else.
const groupOf = (code: Code) => {
  if (code === null || /\s/u.test(String.fromCharCode(code))) return 1;

  return /\p{P}|\p{S}/u.test(String.fromCharCode(code)) ? 2 : 0;
};

// The CJK rules read whole code points, as their util does.
const pointBefore = (text: string, at: number): Code => {
  if (at <= 0) return null;
  const pair = at >= 2 ? text.codePointAt(at - 2) : undefined;

  return pair !== undefined && pair > 0xff_ff ? pair : text.charCodeAt(at - 1);
};

const cjkSides = (text: string, from: number, after: string) => {
  const previous = pointBefore(text, from);
  const before = classifyCharacter(previous);
  const width = previous !== null && previous > 0xff_ff ? 2 : 1;

  return {
    after: classifyCharacter(after ? (after.codePointAt(0) ?? null) : null),
    before,
    // A variation selector belongs to the character before it.
    beforePrimary: classifyPrecedingCharacter(
      before,
      () => (from < 1 + width ? null : pointBefore(text, from - width)),
      previous
    ),
    previous,
  };
};

// micromark-core-commonmark@2.0.3, lib/attention.js
const coreAttentionOpens = (
  text: string,
  from: number,
  after: string,
  markers: readonly number[]
) => {
  const previous = from > 0 ? text.charCodeAt(from - 1) : null;
  const code = after ? after.charCodeAt(0) : null;
  const before = groupOf(previous);
  const next = groupOf(code);
  const open =
    !next ||
    (next === 2 && before > 0) ||
    (code !== null && markers.includes(code));

  if (text.charCodeAt(from) === STAR) return open;
  const close =
    !before ||
    (before === 2 && next > 0) ||
    (previous !== null && markers.includes(previous));

  return open && (before > 0 || !close);
};

// micromark-extension-cjk-friendly@2.0.2, dist/ext/attention.js
const cjkAttentionOpens = (
  text: string,
  from: number,
  after: string,
  tildes: boolean
) => {
  const sides = cjkSides(text, from, after);
  const code = after ? after.charCodeAt(0) : null;
  const beforeNonCjkPunctuation = isNonCjkPunctuation(sides.beforePrimary);
  const beforeSpaceOrNonCjkPunctuation =
    beforeNonCjkPunctuation ||
    isUnicodeWhitespace(sides.beforePrimary) ||
    sides.previous === STAR ||
    sides.previous === UNDERSCORE;
  const afterNonCjkPunctuation = isNonCjkPunctuation(sides.after);
  const afterSpaceOrNonCjkPunctuation =
    afterNonCjkPunctuation ||
    isUnicodeWhitespace(sides.after) ||
    code === STAR ||
    code === UNDERSCORE;
  const open =
    !afterSpaceOrNonCjkPunctuation ||
    (afterNonCjkPunctuation &&
      (beforeSpaceOrNonCjkPunctuation || isCjkOrIvs(sides.beforePrimary))) ||
    (tildes && code === TILDE);

  if (text.charCodeAt(from) === STAR) return open;
  const close =
    !beforeSpaceOrNonCjkPunctuation ||
    (beforeNonCjkPunctuation &&
      (afterSpaceOrNonCjkPunctuation || isCjk(sides.after))) ||
    (tildes && sides.previous === TILDE);

  return open && (isSpaceOrPunctuation(sides.beforePrimary) || !close);
};

// micromark-extension-gfm-strikethrough@2.1.0, lib/syntax.js
const gfmTildesOpen = (text: string, from: number, after: string) => {
  const before = groupOf(from > 0 ? text.charCodeAt(from - 1) : null);
  const next = groupOf(after ? after.charCodeAt(0) : null);

  return !next || (next === 2 && before > 0);
};

// micromark-extension-cjk-friendly-gfm-strikethrough@2.0.1,
// dist/strikethrough.js
const cjkTildesOpen = (text: string, from: number, after: string) => {
  const sides = cjkSides(text, from, after);
  const beforeSpaceOrNonCjkPunctuation =
    isNonCjkPunctuation(sides.beforePrimary) ||
    isUnicodeWhitespace(sides.beforePrimary);
  const afterSpaceOrNonCjkPunctuation =
    isNonCjkPunctuation(sides.after) || isUnicodeWhitespace(sides.after);

  return (
    !afterSpaceOrNonCjkPunctuation ||
    (sides.after === 2 &&
      (beforeSpaceOrNonCjkPunctuation ||
        isCjk(sides.beforePrimary) ||
        isIvs(sides.before)))
  );
};

const opens = (
  grammar: MarkdownGrammar,
  text: string,
  from: number,
  length: number,
  after: string
) => {
  if (text.charCodeAt(from) === TILDE) {
    if (length > 2) return false;

    return grammar.strikethrough === 'cjkFriendly'
      ? cjkTildesOpen(text, from, after)
      : grammar.strikethrough === 'gfm' && gfmTildesOpen(text, from, after);
  }
  if (grammar.attention === 'cjkFriendly') {
    return cjkAttentionOpens(text, from, after, grammar.strikethrough !== null);
  }

  return (
    grammar.attention === 'commonmark' &&
    coreAttentionOpens(
      text,
      from,
      after,
      grammar.strikethrough ? [STAR, UNDERSCORE, TILDE] : [STAR, UNDERSCORE]
    )
  );
};

const readsAsArithmetic = (marker: string, before: string) =>
  marker === '*' && DIGIT.test(before);

const readsAsWordPart = (marker: string, length: number, before: string) =>
  LETTER.test(before) &&
  (marker === '_' ||
    (length === 1 && !isCjk(classifyCharacter(before.codePointAt(0) ?? null))));

const allows = (text: string, from: number, length: number) => {
  const marker = text.charAt(from);
  const before = codePointBefore(text, from);

  if (marker === '~') return length === 2;

  return (
    length <= 3 &&
    !readsAsArithmetic(marker, before) &&
    !readsAsWordPart(marker, length, before)
  );
};

const isOffered = (
  grammar: MarkdownGrammar,
  text: string,
  from: number,
  length: number,
  after: string
) => opens(grammar, text, from, length, after) && allows(text, from, length);

const findOpenLeaf = (text: string, tree: Root) => {
  let node: Nodes = tree;

  while (node.type !== 'heading' && node.type !== 'paragraph') {
    const last: Nodes | undefined =
      'children' in node ? node.children.at(-1) : undefined;

    if (!last) return null;
    node = last;
  }
  const leaf: Heading | Paragraph = node;
  const last = leaf.children.at(-1);
  const rest = last ? text.slice(endOf(last)) : '';

  return last &&
    leaf.children.every(isPlaced) &&
    (leaf.type === 'paragraph' ? PARAGRAPH_REST : HEADING_REST).test(rest)
    ? leaf
    : null;
};

// A closed code span is a node of its own, so a backtick left in text is
// unclosed. A later backtick can pair with it from any depth and turn what
// follows it into code.
const firstOpenBacktick = (text: string, node: Nodes): number => {
  if ('children' in node) {
    return Math.min(
      Number.POSITIVE_INFINITY,
      ...node.children.map((child) => firstOpenBacktick(text, child))
    );
  }
  if (node.type !== 'text') return Number.POSITIVE_INFINITY;
  for (let at = startOf(node); at < endOf(node); at += 1) {
    if (text[at] === '`' && !isEscaped(text, at)) return at;
  }

  return Number.POSITIVE_INFINITY;
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

const isHeld = (grammar: MarkdownGrammar, text: string, run: Run) => {
  if (text[run.from] === '\\') return true;
  if (run.to < text.length) {
    return isOffered(
      grammar,
      text,
      run.from,
      lengthOf(run),
      text.slice(run.to, run.to + 2)
    );
  }
  for (let length = lengthOf(run); length <= 3; length += 1) {
    if (isOffered(grammar, text, run.from, length, ANY_LETTER)) return true;
  }

  return false;
};

const trailingCluster = (text: string, from: number) => {
  const end = text.length;
  const escape = text.endsWith('\\') && !isEscaped(text, end - 1);
  const markersEnd = escape ? end - 1 : end;
  let start = markersEnd;

  while (start > from && MARKERS.includes(text.charAt(start - 1))) start -= 1;

  return {
    runs: [
      ...markerRuns(text, start, markersEnd),
      ...(escape ? [{ from: markersEnd, to: end }] : []),
    ],
    start,
  };
};

const opensSplit = (
  leaf: Heading | Paragraph,
  next: Nodes | undefined,
  run: Run,
  runEnd: number
) =>
  next?.type === 'emphasis' &&
  next === leaf.children.at(-1) &&
  run.to === startOf(next) &&
  runEnd > run.to;

const offeredRuns = (
  grammar: MarkdownGrammar,
  text: string,
  leaf: Heading | Paragraph,
  end: number,
  backtick: number
) => {
  const offers: Offer[] = [];
  const window = text.length - WINDOW;

  leaf.children.forEach((child, index) => {
    if (child.type !== 'text') return;
    const next = leaf.children[index + 1];

    for (const run of markerRuns(
      text,
      Math.max(startOf(child), window),
      Math.min(endOf(child), end, backtick)
    )) {
      const marker = text.charAt(run.from);
      let { from, to } = run;

      while (
        from > startOf(child) &&
        text[from - 1] === marker &&
        !isEscaped(text, from - 1)
      ) {
        from -= 1;
      }
      while (text[to] === marker) to += 1;
      if (
        from < window ||
        !isOffered(grammar, text, from, to - from, text.slice(to, to + 2))
      ) {
        continue;
      }
      offers.push({
        ...run,
        split: opensSplit(leaf, next, run, to),
      });
    }
  });

  return offers.length > MAX_OFFERS ? [] : offers;
};

const solidEnd = (
  text: string,
  last: Nodes,
  held: readonly Run[],
  marker: string
) => {
  if (last.type !== 'text') return endOf(last);
  let at = endOf(last);

  for (; at > startOf(last); at -= 1) {
    const char = text.charAt(at - 1);

    if (
      !/\s/u.test(char) &&
      !held.some((run) => run.from < at && at <= run.to) &&
      !((char === '\\' || char === marker) && !isEscaped(text, at - 1))
    ) {
      break;
    }
  }

  return at;
};

const holdTrailing = (
  grammar: MarkdownGrammar,
  text: string,
  runs: readonly Run[],
  budget: number
) => {
  const held: Run[] = [];
  let left = budget;

  for (const run of runs) {
    if (lengthOf(run) > left || !isHeld(grammar, text, run)) continue;
    held.push(run);
    left -= lengthOf(run);
  }

  return held;
};

const fromEnd = (text: string, runs: readonly Run[]) =>
  runs.map((run) => ({
    from: run.from - text.length,
    to: run.to - text.length,
  }));

const holdingPlan = (
  grammar: MarkdownGrammar,
  text: string,
  runs: readonly Run[]
): OpenTailPlan => ({
  copy: null,
  heldFromEnd: fromEnd(text, holdTrailing(grammar, text, runs, HIDDEN_BUDGET)),
});

const arrivingCloser = (
  text: string,
  inner: Offer,
  runs: readonly Run[],
  budgetLeft: number
) => {
  const [trailing, ...others] = runs;

  return trailing &&
    others.length === 0 &&
    text.charAt(trailing.from) === text.charAt(inner.from) &&
    lengthOf(trailing) < lengthOf(inner) &&
    lengthOf(trailing) <= budgetLeft &&
    !/\s/u.test(codePointBefore(text, trailing.from))
    ? trailing
    : null;
};

const characterCount = (node: Nodes): number => {
  if (node.type === 'break') return 1;
  if (
    node.type === 'text' ||
    node.type === 'inlineCode' ||
    node.type === 'html'
  ) {
    return Array.from(node.value.replaceAll(/\r\n?/g, '\n')).length;
  }

  return 'children' in node
    ? node.children.reduce((count, child) => count + characterCount(child), 0)
    : 0;
};

const planOpenTail = (
  text: string,
  tree: Root,
  read: CopyPlanRead | HoldPlanRead
): OpenTailPlan | null => {
  const leaf = findOpenLeaf(text, tree);
  const last = leaf?.children.at(-1);

  if (!leaf || !last) return null;
  const backtick = firstOpenBacktick(text, leaf);
  const cluster =
    last.type === 'text' &&
    endOf(last) === text.length &&
    backtick === Number.POSITIVE_INFINITY
      ? trailingCluster(text, startOf(last))
      : null;
  const runs = cluster?.runs ?? [];
  const segment = tree.children.at(-1);

  if (read.mode === 'planHold' || !segment || startOf(segment) < read.from) {
    return holdingPlan(read.grammar, text, runs);
  }
  const { from, grammar } = read;
  const offers = offeredRuns(
    grammar,
    text,
    leaf,
    cluster?.start ?? text.length,
    backtick
  );

  for (;;) {
    let budget = HIDDEN_BUDGET;
    const closing = offers.filter((offer) => {
      if (lengthOf(offer) > budget) return false;
      budget -= lengthOf(offer);

      return true;
    });
    const inner = closing.at(-1);

    if (!inner) return holdingPlan(grammar, text, runs);
    const marker = text.charAt(inner.from);
    const completion = arrivingCloser(text, inner, runs, budget);
    const held = completion ? [] : holdTrailing(grammar, text, runs, budget);
    const at = completion?.to ?? solidEnd(text, last, held, marker);

    if (inner.to >= at) {
      offers.splice(offers.indexOf(inner), 1);
      continue;
    }
    const drops = [...closing, ...(completion ? [completion] : [])];
    const dropped = drops.flatMap((run) =>
      Array.from({ length: lengthOf(run) }, (_, i) => run.from + i)
    );
    const widened = inner.split ? [startOf(last), endOf(last) - 1] : [];
    const closers = closing
      .map((offer) =>
        offer === inner && completion
          ? marker.repeat(lengthOf(inner) - lengthOf(completion))
          : text.slice(offer.from, offer.to)
      )
      .reverse()
      .join('');

    return {
      copy: {
        closers: { from: at - from, to: at - from + closers.length },
        delimiters: [...dropped, ...widened].map((offset) => offset - from),
        droppedRuns: drops.map((run) => text.slice(run.from, run.to)),
        splitEmphasisLength: inner.split ? characterCount(last) : null,
        text: text.slice(from, at) + closers + text.slice(at),
      },
      heldFromEnd: fromEnd(text, held),
    };
  }
};

const delimiterLength = (text: string, node: Nodes) => {
  if (node.type === 'emphasis') return 1;
  if (node.type === 'strong') return 2;
  let length = 0;

  while (text[startOf(node) + length] === '~') length += 1;

  return length;
};

const pairsAsPlanned = (
  text: string,
  tree: Root,
  { closers, delimiters }: OpenTailCopy
) => {
  const used = new Set<number>();
  const closing = new Set<number>();
  const visit = (node: Nodes): boolean => {
    if (
      node.type === 'emphasis' ||
      node.type === 'strong' ||
      node.type === 'delete'
    ) {
      const start = startOf(node);
      const end = endOf(node);

      if (Number.isNaN(start + end)) return false;
      const length = delimiterLength(text, node);

      if (end > closers.from && end - length < closers.to) {
        for (let at = 0; at < length; at += 1) {
          used.add(start + at);
          used.add(end - length + at);
          closing.add(end - length + at);
        }
      }
    }

    return !('children' in node) || node.children.every(visit);
  };

  if (!visit(tree)) return false;
  for (let at = closers.from; at < closers.to; at += 1) {
    if (!closing.has(at)) return false;
    used.delete(at);
  }

  return (
    used.size === delimiters.length && delimiters.every((at) => used.has(at))
  );
};

const cutHeld = (text: string, tree: Root, heldFromEnd: readonly Run[]) => {
  const [outermost] = heldFromEnd;
  const leaf = outermost ? findOpenLeaf(text, tree) : null;
  const last = leaf?.children.at(-1);

  if (!outermost || last?.type !== 'text' || endOf(last) !== text.length) {
    return;
  }
  const start = text.length + outermost.from;
  const tail = text.slice(start);

  if (!last.value.endsWith(tail)) return;
  let shown = '';
  let at = start;

  for (const run of heldFromEnd) {
    shown += text.slice(at, text.length + run.from);
    at = text.length + run.to;
  }
  last.value = last.value.slice(0, -tail.length) + shown + text.slice(at);
};

export const remarkOpenTail: UnifiedPlugin<[OpenTailRead], Root> =
  (read) => (tree, file) => {
    const text = String(file);

    if (read.mode === 'pairCopy') {
      if (!pairsAsPlanned(text, tree, read.copy)) {
        throw new Error('The closed copy pairs other runs than its plan.');
      }
      cutHeld(text, tree, read.heldFromEnd);

      return;
    }
    const plan = planOpenTail(text, tree, read);

    if (!plan) return;
    cutHeld(text, tree, plan.heldFromEnd);
    read.onPlan(plan);
  };

type Token =
  | string
  | Readonly<{ char: string; marks: Record<string, unknown> }>;

const tokensOf = (blocks: readonly Descendant[]) => {
  const tokens: Token[] = [];
  const lists = new Map<unknown, number>();
  const visit = (node: Descendant) => {
    const {
      children,
      id: _id,
      text,
      ...props
    }: Readonly<{ children?: readonly Descendant[]; text?: unknown }> &
      Record<string, unknown> = node;

    if (typeof text === 'string') {
      for (const char of text) tokens.push({ char, marks: props });

      return;
    }
    if ('listId' in props) {
      if (!lists.has(props.listId)) lists.set(props.listId, lists.size);
      props.listId = lists.get(props.listId);
    }
    tokens.push(
      JSON.stringify(Object.entries(props).sort(([a], [b]) => (a < b ? -1 : 1)))
    );
    children?.forEach(visit);
    tokens.push('/');
  };

  blocks.forEach(visit);

  return tokens;
};

const isActive = (value: unknown) =>
  value !== undefined && value !== null && value !== false;

const hasAny = (marks: Record<string, unknown>, keys: ReadonlySet<string>) =>
  [...keys].some((key) => isActive(marks[key]));

const keeps = (
  token: Token,
  other: Token | undefined,
  split: boolean,
  kinds: MarkdownMarkKinds
) => {
  if (typeof token === 'string' || typeof other === 'string') {
    return token === other;
  }

  return (
    other?.char === token.char &&
    [...kinds.exact].every(
      (key) => isActive(token.marks[key]) === isActive(other.marks[key])
    ) &&
    Object.entries(token.marks).every(
      ([key, value]) =>
        !isActive(value) ||
        JSON.stringify(other.marks[key]) === JSON.stringify(value) ||
        (split && kinds.emphasis.has(key) && hasAny(other.marks, kinds.strong))
    )
  );
};

type Walk = Readonly<{
  copyIndex: number;
  runIndex: number;
  runOffset: number;
  splitLeft: number;
}>;

export const keepsReceived = (
  received: readonly Descendant[],
  copy: readonly Descendant[],
  { droppedRuns, splitEmphasisLength }: OpenTailCopy,
  kinds: MarkdownMarkKinds
) => {
  const closed = tokensOf(copy);
  let walks: Walk[] = [
    { copyIndex: 0, runIndex: 0, runOffset: 0, splitLeft: 0 },
  ];

  for (const token of tokensOf(received)) {
    const next = new Map<string, Walk>();
    const add = (walk: Walk) =>
      next.set(
        `${walk.copyIndex} ${walk.runIndex} ${walk.runOffset} ${walk.splitLeft}`,
        walk
      );

    for (const { copyIndex, runIndex, runOffset, splitLeft } of walks) {
      if (
        runOffset === 0 &&
        keeps(token, closed[copyIndex], splitLeft > 0, kinds)
      ) {
        add({
          copyIndex: copyIndex + 1,
          runIndex,
          runOffset,
          splitLeft:
            typeof token !== 'string' && splitLeft > 0
              ? splitLeft - 1
              : splitLeft,
        });
      }
      const run = droppedRuns[runIndex];

      if (
        typeof token === 'string' ||
        token.char !== run?.[runOffset] ||
        Object.values(token.marks).some(isActive)
      ) {
        continue;
      }
      if (runOffset + 1 < run.length) {
        add({ copyIndex, runIndex, runOffset: runOffset + 1, splitLeft });
      } else {
        add({
          copyIndex,
          runIndex: runIndex + 1,
          runOffset: 0,
          splitLeft:
            runIndex + 1 === droppedRuns.length && splitEmphasisLength !== null
              ? splitEmphasisLength
              : splitLeft,
        });
      }
    }
    walks = [...next.values()];
    if (walks.length === 0) return false;
  }

  return walks.some(
    ({ copyIndex, runIndex }) =>
      copyIndex === closed.length && runIndex === droppedRuns.length
  );
};
