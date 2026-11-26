import {
  type ContentSlice,
  type Descendant,
  type EditorElementBehavior,
  type Element,
  ElementApi,
  type Range,
  RangeApi,
} from '../../interfaces';
import type { DocumentIndex } from '../change/document-index';
import type { JsonRecord } from '../change/json';
import {
  type RootChangeSection,
  propertyDeltaFromModifications,
  semanticPropertyModifications,
} from '../change/root-change';
import {
  type PreparedTokenSlice,
  getDocumentSliceNodeKeys,
} from '../change/tokens';
import {
  type CompiledEditorSchema,
  uniquePropertiesOf,
} from '../schema-compiler';
import { countCoreWork } from '../work';
import type { FitSection } from './origin';
import { getTextEdge, pointsEqual } from './provenance';

declare const nonIdentityBlockPropertiesBrand: unique symbol;

export type KeptBlockPropertyWrite = Readonly<{
  readonly [nonIdentityBlockPropertiesBrand]: true;
  readonly from: number;
  readonly properties: ReturnType<typeof propertyDeltaFromModifications>;
}>;

export type HeadEdgePlan =
  | Readonly<{
      blockPath: readonly number[];
      blockRange: Readonly<{ from: number; to: number }>;
      kind: 'keep';
      propertyWrite: KeptBlockPropertyWrite | null;
    }>
  | Readonly<{ kind: 'replace' }>;

export type PasteEdgePlan = Readonly<{ head: HeadEdgePlan }>;

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
    declarative: CompiledEditorSchema | null;
    emptyPath: readonly number[] | null;
    getElementBehavior: (node: Element) => EditorElementBehavior;
    getElementType: (node: Element) => string | null | undefined;
    inputSlice: ContentSlice;
    isMove: boolean;
    replaceEmpty: boolean;
  }>
): PasteEdgePlan => {
  const replace: PasteEdgePlan = { head: { kind: 'replace' } };
  const { emptyPath, getElementBehavior, inputSlice, isMove } = input;
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
        input.declarative
      )
    : null;
  return { head: { blockPath, blockRange, kind: 'keep', propertyWrite } };
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
  const outChanges: FitSection[] = [];
  const outProperties: RootChangeSection[] = [];
  const outSections: RootChangeSection[] = [];
  let headCovered = false;

  for (const change of changes) {
    const { from, insert, to } = change;
    const replaced =
      from <= headFrom && to !== from && insert.length > 0
        ? document.slice(from, to)
        : null;
    const ownKeys = replaced ? getDocumentSliceNodeKeys(insert) : null;
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
      replaced && head > 0 ? splitAtKeptCloses(change, replaced, head) : [];
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
