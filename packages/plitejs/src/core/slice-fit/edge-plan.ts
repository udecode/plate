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
import type { SliceFitCandidate } from './frontier';
import { type FitSection, markFit } from './origin';
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
      blockPath: readonly number[];
      blockRange: Readonly<{ from: number; to: number }>;
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

  if (input.replaceEmpty && emptyPath) {
    dest = document.node(emptyPath) as Descendant;
    const first = inputSlice.content[0];
    if (replacesEmptyBlockHead(dest, first, getElementBehavior, isMove)) {
      return replace;
    }
    blockPath = emptyPath;
    rewrite = first as Element;
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
    const sEdge = getTextEdge(dest, blockPath, 'start');
    const eEdge = getTextEdge(dest, blockPath, 'end');
    const coversBlock =
      (emptyPath?.length === blockPath.length &&
        emptyPath.every((p, i) => p === blockPath[i])) ||
      (!input.collapsed &&
        end.path.length > blockPath.length &&
        blockPath.every((p, i) => p === end.path[i]) &&
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
    head: { blockPath, blockRange, kind: 'keep', propertyWrite },
    receiving,
    tail,
  };
};

export const applyTailEdgePlan = (
  document: DocumentIndex,
  edgePlan: PasteEdgePlan | null,
  candidate: SliceFitCandidate,
  exactTo: number
): SliceFitCandidate => {
  if (!('insert' in candidate) || !edgePlan || edgePlan.tail.kind !== 'split') {
    return candidate;
  }
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

export const applyPasteEdgePlan = (
  document: DocumentIndex,
  edgePlan: PasteEdgePlan | null,
  changes: readonly FitSection[],
  declarative: CompiledEditorSchema | null,
  splitAtKeptCloses: (
    change: FitSection,
    replaced: PreparedTokenSlice,
    kept: number
  ) => readonly FitSection[]
) => {
  if (!edgePlan || edgePlan.head.kind === 'replace') {
    return {
      changes,
      properties: [] as RootChangeSection[],
      sections: changes as readonly RootChangeSection[],
    };
  }
  const headFrom = edgePlan.head.blockRange.from;
  const headTo = edgePlan.head.blockRange.to;
  const outChanges: FitSection[] = [];
  const outProperties: RootChangeSection[] = [];
  const outSections: RootChangeSection[] = [];
  let headCovered = false;

  for (const change of changes) {
    const { from, insert, to } = change;
    const coversHead = from <= headFrom;
    const closesHead = to >= headTo;
    const replaced =
      (coversHead || closesHead) && to !== from && insert.length > 0
        ? document.slice(from, to)
        : null;
    const ownKeys =
      coversHead && replaced ? getDocumentSliceNodeKeys(insert) : null;
    const props: RootChangeSection[] = [];
    let head = 0;
    if (replaced && ownKeys) {
      for (const t of replaced.tokens) {
        countCoreWork('pasteEdgeTokens');
        const l = insert.tokens[head];
        if (
          t.kind !== 'open' ||
          t.nodeKind !== 'element' ||
          l?.kind !== 'open' ||
          l.nodeKind !== 'element' ||
          t.props.type !== l.props.type ||
          ownKeys.has(head)
        ) {
          break;
        }
        if (from + head === headFrom) headCovered = true;
        const w = createKeptBlockPropertyWrite(
          from + head,
          t.props,
          l.props,
          declarative
        );
        if (w) props.push({ from: w.from, properties: w.properties });
        head += 1;
      }
    }
    const split =
      replaced && (head > 0 || closesHead)
        ? splitAtKeptCloses(change, replaced, head)
        : [];
    if (split.length === 0) {
      outChanges.push(change);
      outSections.push(change);
    } else {
      outProperties.push(...props);
      outChanges.push(...split);
      outSections.push(...props, ...split);
    }
  }
  if (
    !headCovered &&
    edgePlan.head.propertyWrite &&
    !outChanges.some((c) => c.from <= headFrom && headFrom < c.to)
  ) {
    const { from, properties } = edgePlan.head.propertyWrite;
    outProperties.unshift({ from, properties });
    outSections.unshift({ from, properties });
  }
  return {
    changes: outChanges,
    properties: outProperties,
    sections: outSections,
  };
};
