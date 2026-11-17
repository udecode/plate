import { getDefined } from '../../internal/get-defined';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
} from './document-change';
import type { DocumentIndex, IndexedNodeRange } from './document-index';
import {
  type Carry,
  type ChangeFacts,
  type Cut,
  type Heir,
  historyFollowsAllFacts,
  type Mend,
  type Merge,
  recordedFacts,
  UNKNOWN_FACTS,
} from './record';
import type { RootChange } from './root-change';
import { type JsonToken, type PreparedTokenSlice, tokenLength } from './tokens';

const spanning = (document: DocumentIndex, at: number) =>
  document
    .openContextAt(at)
    .filter((range) => range.from < at && range.to - 1 >= at);

const isLeafOrLine = (document: DocumentIndex, range: IndexedNodeRange) => {
  if (range.kind === 'text') return true;

  const [first] = document.slice(range.from + 1, range.from + 2).tokens;

  return first?.kind === 'open' && first.nodeKind === 'text';
};

const typeOf = (token: JsonToken | undefined) =>
  token?.kind === 'open' ? token.props.type : undefined;

const linesOrSameTypeHolders = (
  document: DocumentIndex,
  head: IndexedNodeRange,
  tail: IndexedNodeRange,
  open: JsonToken | undefined
) => {
  const type = typeOf(document.slice(head.from, head.from + 1).tokens[0]);

  if (open && typeOf(open) !== type) return false;
  if (isLeafOrLine(document, head) && isLeafOrLine(document, tail)) {
    return true;
  }

  return (
    type !== undefined &&
    typeOf(document.slice(tail.from, tail.from + 1).tokens[0]) === type
  );
};

const rootFacts = (change: RootChange, document: DocumentIndex) => {
  const all = historyFollowsAllFacts();
  const cuts: Cut[] = [];
  const heirs: Heir[] = [];
  const mends: Mend[] = [];
  const merges: Merge[] = [];
  let input = 0;
  let output = 0;

  for (let pair = 0; pair < change.sections.length; pair += 2) {
    const removed = getDefined(change.sections[pair]);
    const inserted = getDefined(change.sections[pair + 1]);

    if (inserted < 0) {
      input += removed;
      output += removed;
      continue;
    }

    const written =
      (change.data[pair >> 1] as PreparedTokenSlice | null)?.tokens ?? [];
    const before = spanning(document, input);
    const after = spanning(document, input + removed);
    const opens: Array<readonly [token: JsonToken, at: number]> = [];
    const closes: number[] = [];
    let at = output;

    for (const token of written) {
      if (token.kind === 'open') opens.push([token, at]);
      if (token.kind === 'close') {
        if (opens.length > 0) opens.pop();
        else closes.push(at);
      }
      at += tokenLength(token);
    }

    const kept = before.length - closes.length;

    if (kept < 0 || kept + opens.length !== after.length) return null;

    for (let depth = 0; depth < after.length; depth++) {
      const tail = getDefined(after[depth]);
      const head = before[depth];
      const open = depth < kept ? null : getDefined(opens[depth - kept]);

      if (!head || head.kind !== tail.kind) return null;
      if (open && (open[0].kind !== 'open' || open[0].nodeKind !== head.kind)) {
        return null;
      }
      if (head.from === tail.from && !open) continue;
      if (!linesOrSameTypeHolders(document, head, tail, open?.[0])) return null;
      if (head.from !== tail.from) {
        if (tail.from < input) return null;
        merges.push([tail.from, getDefined(change.mapPos(head.from, 1))]);
        if (all && head.kind === 'element') mends.push([head.to - 1]);
      }
      if (open) {
        heirs.push([open[1], head.from]);
        if (all && head.kind === 'element') {
          cuts.push([getDefined(closes[before.length - 1 - depth])]);
        }
      }
    }
    input += removed;
    output += inserted;
  }

  return { carries: [], cuts, heirs, mends, merges };
};

/** @internal */
export const sliceFacts = (
  change: DocumentChange,
  indexOf: (root: string) => DocumentIndex
): ChangeFacts => {
  const roots: Array<
    readonly [
      string,
      {
        carries: Carry[];
        cuts: Cut[];
        heirs: Heir[];
        mends: Mend[];
        merges: Merge[];
      },
    ]
  > = [];

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const facts = rootFacts(rootChange, indexOf(root));

    if (!facts) return UNKNOWN_FACTS;
    roots.push([root, facts]);
  }

  return recordedFacts(roots);
};
