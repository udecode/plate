import {
  type ContentSlice,
  type Descendant,
  type EditorElementBehavior,
  type Element,
  ElementApi,
  NodeApi,
  type Range,
  RangeApi,
  type RootKey,
} from '../../interfaces';
import { getDefined } from '../../internal/get-defined';
import type { DocumentIndex } from '../change/document-index';
import { type JsonRecord, jsonEqual } from '../change/json';
import {
  type RootChangeSection,
  propertyDeltaFromModifications,
  semanticPropertyModifications,
} from '../change/root-change';
import {
  PreparedTokenSlice,
  getDocumentSliceNodeKeys,
  openToken,
} from '../change/tokens';
import {
  type CompiledEditorSchema,
  type CompiledSchemaContentProgram,
  type CompiledSchemaElement,
  uniquePropertiesOf,
} from '../schema-compiler';
import { countCoreWork } from '../work';
import {
  type FitOrigins,
  FitOriginLog,
  type FitSection,
  type FitSource,
  fitSections,
  markFit,
} from './origin';
import { getTextEdge, pointsEqual } from './provenance';

declare const nonIdentityBlockPropertiesBrand: unique symbol;

export type KeptBlockPropertyWrite = Readonly<{
  readonly [nonIdentityBlockPropertiesBrand]: true;
  readonly from: number;
  readonly properties: ReturnType<typeof propertyDeltaFromModifications>;
}>;

export type TailLevelPlan =
  | Readonly<{ kind: 'text' }>
  | Readonly<{
      dropsIdentity: boolean;
      kind: 'element';
      path: readonly number[];
      splitProps: Readonly<JsonRecord> | null;
      type: string | null | undefined;
    }>;

export type TailEdgePlan =
  | Readonly<{
      destination: ReadonlyArray<
        Readonly<{ from: number; path: readonly number[]; to: number }>
      >;
      kind: 'split';
      levels: readonly TailLevelPlan[];
      receiving: number;
    }>
  | Readonly<{ kind: 'pasted'; receiving: number }>;

export type HeadEdgePlan =
  | Readonly<{
      blockDepth: number;
      blockPath: readonly number[];
      blockRange: Readonly<{ from: number; to: number }>;
      closeAt: 'head-end' | 'tail-end';
      kind: 'keep';
      propertyWrite: KeptBlockPropertyWrite | null;
    }>
  | Readonly<{ kind: 'replace' }>;

export type PasteEdgePlan = Readonly<{
  head: HeadEdgePlan;
  receiving: number;
  tail: TailEdgePlan;
}>;

type FitToken = DocumentIndex['tokens']['tokens'][number];

const tokenLength = (token: FitToken) =>
  token.kind === 'text' ? token.text.length : 1;

const openContextAt = (document: DocumentIndex, position: number) =>
  document
    .openContextAt(position)
    .filter((entry) => entry.from < position && position < entry.to);

const propsOf = ({ children: _c, ...props }: Element) =>
  props as Readonly<JsonRecord>;

export const identityKeysOf = (
  declarative: CompiledEditorSchema | null
): ReadonlySet<string> | null => {
  if (!declarative) return null;
  const keys = new Set(uniquePropertiesOf(declarative).keys());
  if (declarative.everyElementHasId) keys.add('id');
  return keys.size === 0 ? null : keys;
};

export const createKeptBlockPropertyWrite = (
  from: number,
  before: Readonly<JsonRecord>,
  after: Readonly<JsonRecord>,
  declarative: CompiledEditorSchema | null
): KeptBlockPropertyWrite | null => {
  const keys = identityKeysOf(declarative);
  const mods = semanticPropertyModifications(before, after, () => false).filter(
    (m) => !keys?.has(m.key)
  );
  if (mods.length === 0) return null;
  const properties = propertyDeltaFromModifications(mods);
  return Object.freeze({ from, properties }) as KeptBlockPropertyWrite;
};

export const replacesEmptyBlockHead = (
  target: Descendant | undefined,
  head: Descendant | undefined,
  behavior: (node: Element) => EditorElementBehavior,
  isMove: boolean
) =>
  isMove ||
  !ElementApi.isElement(target) ||
  !ElementApi.isElement(head) ||
  target.type !== head.type ||
  Boolean(behavior(head).object || behavior(head).void);

export const planPasteEdges = (
  document: DocumentIndex,
  input: Readonly<{
    at: Range;
    callerBounds: Readonly<{ from: number; to: number }> | undefined;
    collapsed: boolean;
    contentAllowsAt: (
      declarative: CompiledEditorSchema,
      content: CompiledSchemaContentProgram,
      node: Element,
      index: number,
      options: Readonly<{ ancestors: readonly Element[]; root: RootKey }>
    ) => boolean;
    declarative: CompiledEditorSchema | null;
    elementPropertiesForSplitUnder: (
      node: Element,
      ancestors: readonly Element[],
      root: RootKey
    ) => Readonly<JsonRecord>;
    emptyPath: readonly number[] | null;
    exactTo: number;
    getCompiledElement: (
      node: Element
    ) => CompiledSchemaElement | null | undefined;
    getElementAncestors: (
      rootChildren: readonly Descendant[],
      path: readonly number[]
    ) => readonly Element[];
    getElementBehavior: (node: Element) => EditorElementBehavior;
    getElementType: (node: Element) => string | null | undefined;
    inputSlice: ContentSlice;
    isMove: boolean;
    replaceEmpty: boolean;
    root: RootKey;
    rootChildren: readonly Descendant[];
    targetRootProgram: CompiledSchemaContentProgram | null;
  }>
): PasteEdgePlan => {
  const {
    declarative,
    emptyPath,
    exactTo,
    getElementBehavior,
    inputSlice,
    isMove,
    root,
    rootChildren,
  } = input;
  const destination = openContextAt(document, exactTo);
  let closed = 0;

  while (
    closed < destination.length &&
    destination[destination.length - 1 - closed].to - 1 === exactTo + closed
  ) {
    closed += 1;
  }

  const receiving = destination.length - closed;
  const hasIdentity = (identityKeysOf(declarative)?.size ?? 0) > 0;
  const tail: TailEdgePlan =
    receiving === 0 || isMove || input.callerBounds
      ? { kind: 'pasted', receiving }
      : {
          destination,
          kind: 'split',
          levels: destination.map((entry, depth): TailLevelPlan => {
            const node = document.node(entry.path) as Descendant;

            if (NodeApi.isText(node)) return { kind: 'text' };
            if (depth >= receiving || getElementBehavior(node).inline) {
              return {
                dropsIdentity: hasIdentity,
                kind: 'element',
                path: entry.path,
                splitProps: null,
                type: input.getElementType(node),
              };
            }
            const ancestors = input.getElementAncestors(
              rootChildren,
              entry.path
            );
            const content = ancestors[0]
              ? input.getCompiledElement(ancestors[0])?.content
              : input.targetRootProgram;
            const admitsCopyAfter =
              !declarative ||
              !content ||
              input.contentAllowsAt(
                declarative,
                content,
                node,
                getDefined(entry.path.at(-1)) + 1,
                { ancestors, root }
              );

            return {
              dropsIdentity: hasIdentity,
              kind: 'element',
              path: entry.path,
              splitProps: admitsCopyAfter
                ? input.elementPropertiesForSplitUnder(node, ancestors, root)
                : null,
              type: input.getElementType(node),
            };
          }),
          receiving,
        };
  const replace: PasteEdgePlan = {
    head: { kind: 'replace' },
    receiving,
    tail,
  };
  let blockPath: readonly number[];
  let dest: Descendant | null;
  let rewrite: Element | null = null;
  let closeAt: 'head-end' | 'tail-end' = 'tail-end';

  if (input.replaceEmpty && emptyPath) {
    dest = document.node(emptyPath) as Descendant;
    const first = inputSlice.content[0];
    if (replacesEmptyBlockHead(dest, first, getElementBehavior, isMove)) {
      return replace;
    }
    blockPath = emptyPath;
    rewrite = first as Element;
    closeAt = 'head-end';
  } else {
    if (input.callerBounds) return replace;
    const [start, end] = RangeApi.edges(input.at);
    blockPath = start.path.slice(0, -1);
    while (blockPath.length > 0) {
      const node = document.node(blockPath) as Descendant;
      if (ElementApi.isElement(node) && !getElementBehavior(node).inline) break;
      blockPath = blockPath.slice(0, -1);
    }
    dest =
      blockPath.length > 0 ? (document.node(blockPath) as Descendant) : null;
    if (!ElementApi.isElement(dest)) return replace;
    const sameBlock =
      end.path.length > blockPath.length &&
      blockPath.every((p, i) => p === end.path[i]);
    if (sameBlock && blockPath.length - 1 >= receiving) {
      closeAt = 'head-end';
    }
    const sEdge = getTextEdge(dest, blockPath, 'start');
    const eEdge = getTextEdge(dest, blockPath, 'end');
    const coversBlock =
      (emptyPath?.length === blockPath.length &&
        emptyPath.every((p, i) => p === blockPath[i])) ||
      (!input.collapsed &&
        sameBlock &&
        Boolean(
          sEdge && eEdge && pointsEqual(start, sEdge) && pointsEqual(end, eEdge)
        ));
    const first = inputSlice.openStart === 0 ? inputSlice.content[0] : null;
    if (
      coversBlock &&
      !isMove &&
      ElementApi.isElement(first) &&
      input.getElementType(first) === input.getElementType(dest)
    ) {
      rewrite = first;
    }
  }

  const blockRange = document.nodeRange(blockPath);
  const propertyWrite = rewrite
    ? createKeptBlockPropertyWrite(
        blockRange.from,
        propsOf(dest as Element),
        propsOf(rewrite),
        declarative
      )
    : null;
  return {
    head: {
      blockDepth: blockPath.length - 1,
      blockPath,
      blockRange,
      closeAt,
      kind: 'keep',
      propertyWrite,
    },
    receiving,
    tail,
  };
};

export type EdgeAppliedCandidate<T> = Readonly<{
  candidate: T;
  edgeOnlySections: readonly FitSection[] | null;
  propertyWrites: readonly KeptBlockPropertyWrite[];
}>;

const rewriteTailSplit = <
  T extends Readonly<{
    from: number;
    insert: PreparedTokenSlice;
    origins: FitOrigins;
    to: number;
  }>,
>(
  document: DocumentIndex,
  edgePlan: PasteEdgePlan,
  candidate: T,
  exactTo: number
): T => {
  if (edgePlan.tail.kind !== 'split') return candidate;
  const { from, insert, origins, to } = candidate;
  const { destination, levels, receiving } = edgePlan.tail;
  let tailAt = to === exactTo ? insert.length : null;
  let runAt = 0;

  for (const { length, source } of origins.runs) {
    if (tailAt !== null) break;
    if (
      source.kind === 'document' &&
      source.at <= exactTo &&
      exactTo < source.at + length
    ) {
      tailAt = runAt + exactTo - source.at;
    }
    runAt += length;
  }
  if (tailAt === null) return candidate;
  const stack: Array<Readonly<{ at: number; index: number }> | null> =
    openContextAt(document, from).map(() => null);
  let position = 0;

  for (const [index, token] of insert.tokens.entries()) {
    if (position >= tailAt) break;
    if (token.kind === 'open') stack.push({ at: position, index });
    else if (token.kind === 'close') stack.pop();
    position += tokenLength(token);
  }
  if (stack.length !== destination.length) return candidate;
  const replaced = new Map<number, FitToken>();
  const replacedAt: number[] = [];

  for (let depth = stack.length - 1; depth >= 0; depth -= 1) {
    const written = stack[depth];

    if (!written) break;
    if (depth >= receiving) continue;
    const token = insert.tokens[written.index];
    const level = levels[depth];

    if (level.kind === 'text') {
      if (token.kind !== 'open' || token.nodeKind !== 'text') break;
      continue;
    }
    if (
      token.kind !== 'open' ||
      token.nodeKind !== 'element' ||
      token.props.type !== level.type
    ) {
      break;
    }
    if (!level.splitProps || jsonEqual(level.splitProps, token.props)) continue;
    replaced.set(written.index, openToken('element', level.splitProps));
    replacedAt.push(written.at);
  }
  if (replaced.size === 0) return candidate;
  const rewritten = PreparedTokenSlice.fromTokens(
    insert.tokens.map((token, index) => replaced.get(index) ?? token)
  );

  return Object.freeze({
    ...candidate,
    insert: rewritten,
    origins: markFit(origins, replacedAt, rewritten),
  });
};

export const applyPasteEdgePlan = <
  T extends Readonly<{
    from: number;
    insert: PreparedTokenSlice;
    origins: FitOrigins;
    to: number;
  }>,
>(
  input: Readonly<{
    candidate: T;
    declarative: CompiledEditorSchema | null;
    document: DocumentIndex;
    edgePlan: PasteEdgePlan;
    exactTo: number;
  }>
): EdgeAppliedCandidate<T> => {
  const { declarative, document, edgePlan, exactTo } = input;
  const candidate = rewriteTailSplit(
    document,
    edgePlan,
    input.candidate,
    exactTo
  );
  let { insert } = candidate;
  const { from, origins, to } = candidate;
  const { head, receiving } = edgePlan;

  if (head.kind === 'replace') {
    return {
      candidate,
      edgeOnlySections: null,
      propertyWrites: [],
    };
  }

  const propertyWrites: KeptBlockPropertyWrite[] = [];
  const docOrigins = new Map<number, number>();
  const keptHeadEntries: Array<
    Readonly<{
      depth: number;
      docFrom: number;
      docTo: number;
      isKeptHead: true;
      nodeKind: 'element' | 'text';
    }>
  > = [];
  const baseContext = openContextAt(document, from);
  let headKeptCount = 0;

  if (from < to && insert.length > 0 && from <= head.blockRange.from) {
    const replaced = document.slice(from, to);
    const ownKeys = getDocumentSliceNodeKeys(insert);

    for (let i = 0; i < replaced.tokens.length; i += 1) {
      countCoreWork('pasteEdgeTokens');
      const before = replaced.tokens[i];
      const after = insert.tokens[i];
      const docPos = from + i;

      if (
        before.kind !== 'open' ||
        before.nodeKind !== 'element' ||
        after?.kind !== 'open' ||
        after.nodeKind !== 'element' ||
        before.props.type !== after.props.type ||
        ownKeys.has(i)
      ) {
        break;
      }
      const write = createKeptBlockPropertyWrite(
        docPos,
        before.props,
        after.props,
        declarative
      );

      if (write) propertyWrites.push(write);
      docOrigins.set(i, docPos);
      const entry = document.nodeStartingAt(docPos);

      if (entry) {
        keptHeadEntries.push({
          depth: baseContext.length + i,
          docFrom: entry.from,
          docTo: entry.to,
          isKeptHead: true,
          nodeKind: 'element',
        });
      }
      headKeptCount += 1;
    }
  } else if (from > head.blockRange.from && head.propertyWrite) {
    propertyWrites.push(head.propertyWrite);
  }

  const headSurvived =
    from > head.blockRange.from ||
    keptHeadEntries.some((entry) => entry.docFrom === head.blockRange.from);
  let maxClaimedClose = -1;
  let extendedTo = to;

  if (
    headSurvived &&
    (head.closeAt === 'head-end' || keptHeadEntries.length > 0)
  ) {
    let firstTailDocOffset = Number.POSITIVE_INFINITY;

    if (head.closeAt !== 'head-end') {
      let runAt = 0;

      for (const { length, source } of origins.runs) {
        if (source.kind === 'document' && source.at >= exactTo) {
          firstTailDocOffset = runAt;
          break;
        }
        runAt += length;
      }
    }
    const stack: Array<Readonly<{
      depth: number;
      docFrom: number;
      docTo: number;
      isKeptHead?: true;
      nodeKind: 'element' | 'text';
    }> | null> = [
      ...baseContext.map((entry, depth) => ({
        depth,
        docFrom: entry.from,
        docTo: entry.to,
        nodeKind: entry.kind,
      })),
      ...keptHeadEntries,
    ];
    let offset = headKeptCount;
    const minStackLength =
      head.closeAt === 'head-end' ? receiving : baseContext.length;

    for (
      let i = headKeptCount;
      i < insert.tokens.length && stack.length > minStackLength;
      i += 1
    ) {
      const token = insert.tokens[i];

      if (token.kind === 'open') {
        stack.push(null);
      } else if (token.kind === 'close') {
        const popped = stack.pop();
        const closePos = popped ? popped.docTo - 1 : -1;
        const canClaim =
          popped &&
          popped.nodeKind === token.nodeKind &&
          closePos > maxClaimedClose &&
          (head.closeAt === 'head-end'
            ? (popped.nodeKind === 'element' ||
                insert.tokens[i + 1]?.kind === 'close') &&
              popped.depth >= receiving &&
              closePos >= exactTo &&
              (closePos < to ||
                (to === exactTo && popped.docTo <= document.length))
            : Boolean(popped.isKeptHead) &&
              closePos < exactTo &&
              closePos < to &&
              offset < firstTailDocOffset);

        if (canClaim && popped) {
          docOrigins.set(offset, closePos);
          maxClaimedClose = closePos;
          if (popped.docTo > extendedTo) extendedTo = popped.docTo;
        }
      }
      offset += tokenLength(token);
    }
  }

  let nextTo = to;

  if (extendedTo > to) {
    const trailingCloses = document.slice(to, extendedTo);

    if (trailingCloses.tokens.every((token) => token.kind === 'close')) {
      insert = PreparedTokenSlice.concat([insert, trailingCloses]);
      nextTo = extendedTo;
    } else {
      for (const [k, v] of [...docOrigins]) {
        if (v >= to) docOrigins.delete(k);
      }
      maxClaimedClose = Math.max(
        -1,
        ...[...docOrigins.values()].filter((v) => v >= exactTo)
      );
    }
  }

  if (docOrigins.size === 0) {
    return {
      candidate:
        insert === candidate.insert && origins === candidate.origins
          ? candidate
          : Object.freeze({ ...candidate, insert, origins }),
      edgeOnlySections: null,
      propertyWrites,
    };
  }

  const sortedClaims = [...docOrigins.entries()].sort(([a], [b]) => a - b);
  const rebuildOrigins = (keepNonEdgeRuns: boolean) => {
    const log = new FitOriginLog();
    let runAt = 0;
    let claimIdx = 0;
    const emit = (
      segStart: number,
      segLen: number,
      source: FitSource,
      runOriginAt: number
    ) => {
      if (segLen <= 0) return;
      if (source.kind !== 'document') {
        log.add(segLen, keepNonEdgeRuns ? source.kind : 'slice');
        return;
      }
      const docStart = source.at + (segStart - runOriginAt);

      if (!keepNonEdgeRuns && maxClaimedClose === -1) {
        log.add(segLen, 'slice');
        return;
      }
      if (maxClaimedClose === -1 || docStart > maxClaimedClose) {
        log.add(segLen, 'document', docStart);
      } else if (docStart + segLen <= maxClaimedClose + 1) {
        log.add(segLen, 'slice');
      } else {
        const cleared = maxClaimedClose + 1 - docStart;

        log.add(cleared, 'slice');
        log.add(segLen - cleared, 'document', maxClaimedClose + 1);
      }
    };

    for (const { length, source } of origins.runs) {
      const runEnd = runAt + length;
      let cursor = runAt;

      while (
        claimIdx < sortedClaims.length &&
        sortedClaims[claimIdx][0] < runEnd
      ) {
        const [claimPos, docPos] = sortedClaims[claimIdx];

        claimIdx += 1;
        emit(cursor, claimPos - cursor, source, runAt);
        log.add(1, 'document', docPos);
        cursor = claimPos + 1;
      }
      emit(cursor, runEnd - cursor, source, runAt);
      runAt = runEnd;
    }
    if (nextTo > to) log.add(nextTo - to, 'slice');

    return log.seal(insert);
  };

  const nextOrigins = rebuildOrigins(true);
  const edgeSections = fitSections({
    from,
    insert,
    origins: rebuildOrigins(false),
    to: nextTo,
  }).filter(
    (section) => section.from !== section.to || section.insert.length > 0
  );

  return {
    candidate: Object.freeze({
      ...candidate,
      insert,
      origins: nextOrigins,
      to: nextTo,
    }),
    edgeOnlySections:
      edgeSections.length > 0 || propertyWrites.length > 0
        ? edgeSections
        : null,
    propertyWrites,
  };
};

export const keptPropertySections = (
  writes: readonly KeptBlockPropertyWrite[]
): readonly RootChangeSection[] =>
  writes.map(({ from, properties }) => ({ from, properties }));
