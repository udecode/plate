import { countCoreWork } from '../work';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  valueRootIndex,
} from './document-change';
import type { DocumentIndex, IndexedNodeRange } from './document-index';
import type { ChangeFacts, RootFacts } from './record';
import type { RootChange } from './root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  type JsonToken,
  PreparedTokenSlice,
  tokensEqual,
} from './tokens';

/** @internal */
export type FactedChange = Readonly<{
  change: DocumentChange;
  facts: ChangeFacts;
}>;

/** @internal */
export type ElementSchema = Readonly<{
  allowsText: (element: JsonNode) => boolean;
  isInline: (element: JsonNode) => boolean;
}>;

/** @internal */
export type StepRejection =
  | 'a fact names no piece'
  | 'a merge does not name the element its mirror close ends'
  | 'a piece both drops and writes'
  | 'a run closes another kind of element'
  | 'a run closes more elements than its gap sits in'
  | 'a run mixes letters with structure'
  | 'a run splits or joins an element that holds blocks'
  | 'a run splits or joins an element whose content allows no text'
  | 'a run splits or joins more than a block and its text leaf'
  | 'a run that is no mirrored split or join'
  | 'a set that is not on a kept block'
  | 'an heir does not name the element its mirror close ends'
  | 'the step carries'
  | 'the step changes roots or records'
  | 'the step has unknown facts'
  | `the step holds ${number} pieces`;

/** @internal */
export type SkippedRejection =
  | 'the carries do not cover the moved block in order'
  | 'the skipped change changes roots or records'
  | 'the skipped change copies its block with other tokens'
  | 'the skipped change does not drop exactly one run'
  | 'the skipped change drops no whole block'
  | 'the skipped change has unknown facts'
  | 'the skipped change moves a block out of or into an element whose content allows text'
  | 'the skipped change moves nothing'
  | 'the skipped change sets a property'
  | 'the skipped change splits or joins'
  | 'the skipped change writes in more than one root'
  | 'the skipped change writes structure it does not carry';

type Piece = Readonly<{
  at: number;
  dropped: number;
  out: number;
  setLength: number;
  written: PreparedTokenSlice;
}>;

const piecesOf = (change: RootChange) => {
  const pieces: Piece[] = [];
  let at = 0;
  let out = 0;
  let open: {
    at: number;
    dropped: number;
    out: number;
    slices: PreparedTokenSlice[];
  } | null = null;
  const close = () => {
    if (!open) return;
    pieces.push({
      at: open.at,
      dropped: open.dropped,
      out: open.out,
      setLength: 0,
      written: PreparedTokenSlice.concat(open.slices),
    });
    open = null;
  };

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];

    if (inserted < 0) {
      close();
      if (inserted === -2) {
        pieces.push({
          at,
          dropped: 0,
          out,
          setLength: length,
          written: PreparedTokenSlice.empty,
        });
      }
      at += length;
      out += length;
      continue;
    }
    open ??= { at, dropped: 0, out, slices: [] };
    open.dropped += length;
    open.slices.push(change.data[index >> 1] as PreparedTokenSlice);
    at += length;
    out += inserted;
  }
  close();

  return pieces;
};

const writtenRoots = (change: DocumentChange) =>
  [...getInternalDocumentChangeEntries(change)].flatMap(
    ([root, rootChange]) => {
      const pieces = piecesOf(rootChange);

      return pieces.length === 0 ? [] : [{ pieces, root, rootChange }];
    }
  );

const changesRootsOrRecords = (change: DocumentChange) =>
  change.createRoots.size > 0 ||
  change.deleteRoots.size > 0 ||
  getInternalDocumentChangeRecords(change).size > 0;

const NO_ROOT_FACTS: RootFacts = {
  carries: [],
  heirs: [],
  merges: [],
};

const factsOf = (facts: ChangeFacts & { kind: 'recorded' }, root: string) =>
  facts.roots.get(root) ?? NO_ROOT_FACTS;

const factCount = (facts: RootFacts) =>
  facts.carries.length + facts.heirs.length + facts.merges.length;

const isText = (token: JsonToken) => token.kind === 'text';

const positionsOf = (tokens: readonly JsonToken[]) =>
  tokens.flatMap((token): Array<JsonToken | null> =>
    token.kind === 'text'
      ? Array.from({ length: token.text.length }, () => null)
      : [token]
  );

const readTokens = (document: DocumentIndex, from: number, to: number) => {
  countCoreWork('ruleTokens', to - from);

  return document.slice(from, to).tokens;
};

const enclosing = (document: DocumentIndex, gap: number) => {
  if (gap >= document.length) return [];

  const context = document
    .openContextAt(gap)
    .filter((range) => range.contentFrom <= gap && gap <= range.contentTo);

  countCoreWork('ruleTokens', context.length);

  return context;
};

const isBlock = (
  document: DocumentIndex,
  range: IndexedNodeRange | null | undefined,
  schema: ElementSchema
) => range?.kind === 'element' && !schema.isInline(document.node(range.path));

const childrenOf = (document: DocumentIndex, range: IndexedNodeRange) => {
  const children = document.node(range.path).children ?? [];

  countCoreWork('ruleTokens', children.length);

  return children;
};

const holdsBlock = (
  document: DocumentIndex,
  range: IndexedNodeRange | null,
  schema: ElementSchema
) =>
  range !== null &&
  childrenOf(document, range).some(
    (child) => child.children !== undefined && !schema.isInline(child)
  );

const allowsText = (
  document: DocumentIndex,
  range: IndexedNodeRange,
  schema: ElementSchema
) => schema.allowsText(document.node(range.path));

// schema-compiler.ts refuses a root grammar that allows text
// ('text-in-root-content').
const ROOT_CONTENT_ALLOWS_TEXT = false;

const parentAllowsText = (
  document: DocumentIndex,
  gap: number,
  schema: ElementSchema
) => {
  const parent = enclosing(document, gap).at(-1);

  return parent === undefined
    ? ROOT_CONTENT_ALLOWS_TEXT
    : allowsText(document, parent, schema);
};

const mirrors = (run: ReadonlyArray<JsonToken | null>) => {
  const levels = run.length / 2;

  if (!Number.isInteger(levels) || levels === 0) return false;

  for (let level = 0; level < levels; level++) {
    const close = run[levels - 1 - level];
    const open = run[levels + level];

    if (
      close?.kind !== 'close' ||
      open?.kind !== 'open' ||
      close.nodeKind !== open.nodeKind
    ) {
      return false;
    }
  }

  return true;
};

/** @internal */
export const stepRejection = (
  document: JsonEditorValue,
  step: FactedChange,
  schema: ElementSchema
): StepRejection | null => {
  const { change, facts } = step;

  if (facts.kind === 'unknown') return 'the step has unknown facts';
  if (changesRootsOrRecords(change)) return 'the step changes roots or records';

  const roots = writtenRoots(change);
  const pieceCount = roots.reduce((sum, { pieces }) => sum + pieces.length, 0);

  if ([...facts.roots.values()].some(({ carries }) => carries.length > 0)) {
    return 'the step carries';
  }
  if (pieceCount !== 1) return `the step holds ${pieceCount} pieces`;

  const [{ pieces, root }] = roots;
  const [piece] = pieces;
  const { heirs, merges } = factsOf(facts, root);

  if (
    [...facts.roots].some(
      ([other, rootFacts]) => other !== root && factCount(rootFacts) > 0
    )
  ) {
    return 'a fact names no piece';
  }

  const index = valueRootIndex(document, root);

  if (piece.setLength > 0) {
    if (heirs.length + merges.length > 0) return 'a fact names no piece';

    countCoreWork('ruleTokens');

    return piece.setLength === 1 &&
      isBlock(index, index.nodeStartingAt(piece.at), schema)
      ? null
      : 'a set that is not on a kept block';
  }
  if (piece.dropped > 0 && piece.written.length > 0) {
    return 'a piece both drops and writes';
  }

  const writes = piece.written.length > 0;
  const tokens = writes
    ? piece.written.tokens
    : readTokens(index, piece.at, piece.at + piece.dropped);

  if (tokens.every(isText)) {
    return heirs.length + merges.length > 0 ? 'a fact names no piece' : null;
  }

  const run = positionsOf(tokens);

  if (!mirrors(run)) {
    return run.includes(null)
      ? 'a run mixes letters with structure'
      : 'a run that is no mirrored split or join';
  }

  const levels = run.length / 2;
  const around = enclosing(index, piece.at);

  if (around.length < levels) {
    return 'a run closes more elements than its gap sits in';
  }

  const outer = around[around.length - levels];

  if (!isBlock(index, outer, schema)) {
    return 'a run that is no mirrored split or join';
  }
  if (levels > 2 || (levels === 2 && around.at(-1)?.kind !== 'text')) {
    return 'a run splits or joins more than a block and its text leaf';
  }

  const dropped = writes ? null : index.nodeStartingAt(piece.at + levels);

  // A quote splits between two of its lines and joins the quote beside it by
  // the same mirrored run as a line, and both keep today's path.
  if (holdsBlock(index, outer, schema) || holdsBlock(index, dropped, schema)) {
    return 'a run splits or joins an element that holds blocks';
  }
  if (
    !allowsText(index, outer, schema) ||
    (dropped !== null && !allowsText(index, dropped, schema))
  ) {
    return 'a run splits or joins an element whose content allows no text';
  }

  for (let level = 0; level < levels; level++) {
    const source = around[around.length - levels + level];

    const open = run[levels + level];

    if (open?.kind !== 'open' || source.kind !== open.nodeKind) {
      return 'a run closes another kind of element';
    }
    if (writes) {
      const heir = heirs.find(([at]) => at === piece.out + levels + level);

      if (heir?.[1] !== source.from) {
        return 'an heir does not name the element its mirror close ends';
      }
    } else {
      const merge = merges.find(([at]) => at === piece.at + levels + level);

      // The element the run closes opens before the run, where the step
      // keeps every position.
      if (merge?.[1] !== source.from) {
        return 'a merge does not name the element its mirror close ends';
      }
    }
  }

  const named = writes
    ? heirs.length === levels && merges.length === 0
    : merges.length === levels && heirs.length === 0;

  return named ? null : 'a fact names no piece';
};

/** @internal */
export const skippedRejection = (
  document: JsonEditorValue,
  skipped: FactedChange,
  schema: ElementSchema
): SkippedRejection | null => {
  const { change, facts } = skipped;

  if (facts.kind === 'unknown') return 'the skipped change has unknown facts';
  if (changesRootsOrRecords(change)) {
    return 'the skipped change changes roots or records';
  }
  const tables = [...facts.roots.values()];

  if (tables.some((each) => each.heirs.length + each.merges.length > 0)) {
    return 'the skipped change splits or joins';
  }
  // Most skipped changes, such as a lint fix or a teammate's typing, move
  // nothing, so this check reads only the facts.
  if (tables.every((each) => each.carries.length === 0)) {
    return 'the skipped change moves nothing';
  }

  const roots = writtenRoots(change);

  if (roots.some(({ pieces }) => pieces.some((piece) => piece.setLength > 0))) {
    return 'the skipped change sets a property';
  }

  const drops = roots.flatMap(({ pieces, root }) =>
    pieces
      .filter((piece) => piece.dropped > 0)
      .map((piece) => ({ piece, root }))
  );

  if (drops.length !== 1 || drops[0].piece.written.length > 0) {
    return 'the skipped change does not drop exactly one run';
  }
  if (roots.length > 1) {
    return 'the skipped change writes in more than one root';
  }

  const [{ piece: drop, root }] = drops;
  const index = valueRootIndex(document, root);

  countCoreWork('ruleTokens');

  const block = index.nodeStartingAt(drop.at);

  if (!isBlock(index, block, schema) || block?.to !== drop.at + drop.dropped) {
    return 'the skipped change drops no whole block';
  }

  const { carries } = factsOf(facts, root);
  const [first] = carries;
  let next = drop.at;

  for (const [, from, length] of carries) {
    if (from !== next) {
      return 'the carries do not cover the moved block in order';
    }
    next += length;
  }
  if (next !== drop.at + drop.dropped) {
    return 'the carries do not cover the moved block in order';
  }

  const copy = roots[0].pieces.find(
    (piece) =>
      piece.out <= first[0] && first[0] < piece.out + piece.written.length
  );
  const last = carries.at(-1);

  if (!copy || !last || last[0] + last[2] > copy.out + copy.written.length) {
    return 'the carries do not cover the moved block in order';
  }

  if (
    parentAllowsText(index, drop.at, schema) ||
    parentAllowsText(index, copy.at, schema)
  ) {
    return 'the skipped change moves a block out of or into an element whose content allows text';
  }

  for (const piece of roots[0].pieces) {
    let position = piece.out;
    let carry = 0;

    for (const token of piece.written.tokens) {
      const length = token.kind === 'text' ? token.text.length : 1;

      if (token.kind !== 'text') {
        while (
          carry < carries.length &&
          carries[carry][0] + carries[carry][2] <= position
        ) {
          carry += 1;
        }

        const carried =
          carry < carries.length &&
          carries[carry][0] <= position &&
          position < carries[carry][0] + carries[carry][2];

        if (!carried) {
          return 'the skipped change writes structure it does not carry';
        }
      }
      position += length;
    }
  }

  // The one value check: a set made with the move changes the copy's opens,
  // which the facts allow but the crossing does not follow.
  for (const [at, from, length] of carries) {
    const source = readTokens(index, from, from + length);
    const written = copy.written.slice(
      at - copy.out,
      at - copy.out + length
    ).tokens;

    if (
      source.length !== written.length ||
      source.some((token, position) => !tokensEqual(token, written[position]))
    ) {
      return 'the skipped change copies its block with other tokens';
    }
  }

  return null;
};
