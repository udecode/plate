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
import type { PropertyModification } from './transform';

/** @internal */
export type FactedChange = Readonly<{
  change: DocumentChange;
  facts: ChangeFacts;
}>;

/** @internal */
export type ElementContent = Readonly<{
  allowedElementTypes: ReadonlySet<string>;
  allowsText: boolean;
  allowsUnknownElements: boolean;
  max: number | null;
  min: number;
  prefix?: readonly unknown[];
}>;

/** @internal */
export type ElementSchema = Readonly<{
  content: (element: JsonNode) => ElementContent | 'unknown';
  isInline: (element: JsonNode) => boolean;
  ownsContentRoot: (element: JsonNode) => boolean;
  propertiesReadParents: () => boolean;
  rootContent: (
    document: JsonEditorValue,
    root: string
  ) => ElementContent | 'unknown';
}>;

/** @internal */
export type StepRejection =
  | 'a fact names no piece'
  | 'a merge does not name the element its mirror close ends'
  | 'a piece both drops and writes'
  | 'a run closes another kind of element'
  | 'a run closes more elements than its gap sits in'
  | 'a run mixes letters with structure'
  | 'a run splits or joins an element whose content allows blocks'
  | 'a run splits or joins an element of a type the schema does not know'
  | 'a run splits or joins an element whose content allows no text'
  | 'a run splits or joins more than a block and its text leaf'
  | 'a run that is no mirrored split or join'
  | 'a set that is not on a kept block'
  | 'a set writes a type other than one text block for another'
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
  | 'the skipped change moves a block out of or into an element of a type the schema does not know'
  | 'the skipped change moves a block out of or into a parent whose content bounds its children'
  | 'the skipped change moves a block out of or into an element whose content allows text'
  | 'the skipped change moves a block into a parent that refuses an element type the parent it leaves allows'
  | 'the skipped change moves a block inside a parent whose content has a prefix'
  | 'the skipped change moves a block to another parent while a property target reads the parent'
  | 'the skipped change moves nothing'
  | 'the skipped change sets a property'
  | 'the skipped change splits or joins'
  | 'the skipped change writes in more than one root'
  | 'the skipped change writes structure it does not carry';

type Piece = Readonly<{
  at: number;
  dropped: number;
  out: number;
  properties: readonly PropertyModification[];
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
      properties: [],
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
          properties: change.data[
            index >> 1
          ] as readonly PropertyModification[],
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

const contentAt = (
  document: DocumentIndex,
  range: IndexedNodeRange,
  schema: ElementSchema
) => schema.content(document.node(range.path));

const allowsBlocks = (content: ElementContent, schema: ElementSchema) =>
  content.allowsUnknownElements ||
  [...content.allowedElementTypes].some(
    (type) => !schema.isInline({ children: [], type })
  );

const isTextBlock = (element: JsonNode, schema: ElementSchema) => {
  const content = schema.content(element);

  return (
    content !== 'unknown' &&
    content.allowsText &&
    !allowsBlocks(content, schema) &&
    !schema.isInline(element) &&
    !schema.ownsContentRoot(element)
  );
};

const retypesNoParent = (
  element: JsonNode,
  properties: readonly PropertyModification[],
  schema: ElementSchema
) => {
  const retype = properties.find(({ key }) => key === 'type');

  return (
    !retype ||
    (retype.type === 'set' &&
      typeof retype.value === 'string' &&
      isTextBlock(element, schema) &&
      isTextBlock({ children: [], type: retype.value }, schema))
  );
};

// schema-compiler.ts refuses a root grammar that allows text
// ('text-in-root-content').
const ROOT_CONTENT_ALLOWS_TEXT = false;

const parentAt = (document: DocumentIndex, gap: number) =>
  enclosing(document, gap).at(-1) ?? null;

const parentAllowsText = (
  document: DocumentIndex,
  parent: IndexedNodeRange | null,
  schema: ElementSchema
): boolean | 'unknown' => {
  if (parent === null) return ROOT_CONTENT_ALLOWS_TEXT;

  const content = contentAt(document, parent, schema);

  return content === 'unknown' ? content : content.allowsText;
};

const destinationInside = (
  parent: IndexedNodeRange | null,
  destination: number
) =>
  parent === null ||
  (parent.contentFrom <= destination && destination <= parent.contentTo);

const contentRejection = (
  document: JsonEditorValue,
  index: DocumentIndex,
  root: string,
  [leaves, enters]: readonly [IndexedNodeRange | null, IndexedNodeRange | null],
  destination: number,
  schema: ElementSchema
): SkippedRejection | null => {
  const contentOf = (parent: IndexedNodeRange | null) =>
    parent === null
      ? schema.rootContent(document, root)
      : contentAt(index, parent, schema);

  if (leaves?.from === enters?.from) {
    const parent = contentOf(leaves);

    return parent !== 'unknown' && (parent.prefix?.length ?? 0) > 0
      ? 'the skipped change moves a block inside a parent whose content has a prefix'
      : null;
  }
  if (schema.propertiesReadParents()) {
    return 'the skipped change moves a block to another parent while a property target reads the parent';
  }

  const left = contentOf(leaves);
  const entered = contentOf(enters);

  if (left === 'unknown' || entered === 'unknown') {
    return 'the skipped change moves a block out of or into an element of a type the schema does not know';
  }

  const keptChildren = destinationInside(leaves, destination) ? 1 : 0;

  if (
    left.min > keptChildren ||
    entered.max !== null ||
    (left.prefix?.length ?? 0) > 0 ||
    (entered.prefix?.length ?? 0) > 0
  ) {
    return 'the skipped change moves a block out of or into a parent whose content bounds its children';
  }

  return (left.allowsUnknownElements && !entered.allowsUnknownElements) ||
    [...left.allowedElementTypes].some(
      (type) => !entered.allowedElementTypes.has(type)
    )
    ? 'the skipped change moves a block into a parent that refuses an element type the parent it leaves allows'
    : null;
};

const mirrors = (run: readonly JsonToken[]) => {
  const levels = run.length / 2;

  if (!Number.isInteger(levels) || levels === 0) return false;

  for (let level = 0; level < levels; level++) {
    const close = run[levels - 1 - level];
    const open = run[levels + level];

    if (
      close.kind !== 'close' ||
      open.kind !== 'open' ||
      close.nodeKind !== open.nodeKind
    ) {
      return false;
    }
  }

  return true;
};

const MOST_MIRRORED_LEVELS = 2;

const droppedRun = (
  document: DocumentIndex,
  { at, dropped }: Piece
): readonly JsonToken[] | 'letters' | 'long' => {
  const leaf = enclosing(document, at).at(-1);

  if (leaf?.kind === 'text' && at + dropped <= leaf.contentTo) {
    return 'letters';
  }

  return dropped > 2 * MOST_MIRRORED_LEVELS
    ? 'long'
    : readTokens(document, at, at + dropped);
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

    const target = index.nodeStartingAt(piece.at);

    if (piece.setLength !== 1 || !target || !isBlock(index, target, schema)) {
      return 'a set that is not on a kept block';
    }

    return retypesNoParent(index.node(target.path), piece.properties, schema)
      ? null
      : 'a set writes a type other than one text block for another';
  }
  if (piece.dropped > 0 && piece.written.length > 0) {
    return 'a piece both drops and writes';
  }

  const writes = piece.written.length > 0;
  const run = writes ? piece.written.tokens : droppedRun(index, piece);

  if (run === 'letters' || (run !== 'long' && run.every(isText))) {
    return heirs.length + merges.length > 0 ? 'a fact names no piece' : null;
  }
  if (run === 'long') return 'a run that is no mirrored split or join';
  if (run.some(isText)) return 'a run mixes letters with structure';
  if (!mirrors(run)) return 'a run that is no mirrored split or join';

  const levels = run.length / 2;
  const around = enclosing(index, piece.at);

  if (around.length < levels) {
    return 'a run closes more elements than its gap sits in';
  }

  const outer = around[around.length - levels];

  if (!isBlock(index, outer, schema)) {
    return 'a run that is no mirrored split or join';
  }
  if (
    levels > MOST_MIRRORED_LEVELS ||
    (levels === MOST_MIRRORED_LEVELS && around.at(-1)?.kind !== 'text')
  ) {
    return 'a run splits or joins more than a block and its text leaf';
  }

  const dropped = writes ? null : index.nodeStartingAt(piece.at + levels);
  const contents = [outer, dropped].flatMap((range) =>
    range === null ? [] : [contentAt(index, range, schema)]
  );

  if (contents.includes('unknown')) {
    return 'a run splits or joins an element of a type the schema does not know';
  }

  const known = contents.filter((content) => content !== 'unknown');

  if (known.some((content) => !content.allowsText)) {
    return 'a run splits or joins an element whose content allows no text';
  }
  if (known.some((content) => allowsBlocks(content, schema))) {
    return 'a run splits or joins an element whose content allows blocks';
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

  const ends = [parentAt(index, drop.at), parentAt(index, copy.at)] as const;
  const parents = new Set(
    ends.map((parent) => parentAllowsText(index, parent, schema))
  );

  if (parents.has('unknown')) {
    return 'the skipped change moves a block out of or into an element of a type the schema does not know';
  }
  if (parents.has(true)) {
    return 'the skipped change moves a block out of or into an element whose content allows text';
  }

  const refused = contentRejection(
    document,
    index,
    root,
    ends,
    copy.at,
    schema
  );

  if (refused) return refused;

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
