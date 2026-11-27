import type { AnyEditor, ContentSlice, RootKey } from '../interfaces/editor';
import { ElementApi, type Element } from '../interfaces/element';
import type { EditorJsonValue } from '../interfaces/json';
import { NodeApi, type Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import type { DraftStep } from './change/builder';
import type { DocumentIndex } from './change/document-index';
import { canonicalJsonKey } from './change/transform';
import {
  type DraftGuardFrame,
  registerEditorDraftGuard,
} from './document-recorder';
import {
  type DraftSpan,
  type DraftTrack,
  readDraftTrackAt,
} from './draft-track';
import { type JsonValue, TransferRefusalError } from './landing';
import {
  type CompiledEditorSchema,
  resolveCompiledSchemaProperty,
  toCompiledNodeContext,
  uniquePropertiesOf,
} from './schema-compiler';
import type { TransferDiagnostic } from './transfer-types';

export const rootChildren = (value: JsonValue, root: RootKey) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const childrenAt = (
  children: readonly Descendant[],
  path: Path
): readonly Descendant[] | null => {
  let current = children;

  for (const index of path) {
    const node = current[index];

    if (!node || !ElementApi.isElement(node)) return null;
    ({ children: current } = node);
  }

  return current;
};

export const nodeAt = (children: readonly Descendant[], path: Path) =>
  path.length === 0
    ? null
    : (childrenAt(children, path.slice(0, -1))?.[path.at(-1) as number] ??
      null);

/** The elements above `path` in `children`, nearest first. */
export const ancestorsAt = (children: readonly Descendant[], path: Path) => {
  const ancestors: Element[] = [];
  let current = children;

  for (const index of path.slice(0, -1)) {
    const node = current[index];

    if (!node || !ElementApi.isElement(node)) break;
    ancestors.unshift(node);
    ({ children: current } = node);
  }

  return ancestors;
};

/**
 * Visits each node of `nodes`, the fragment of a range that starts at `start`,
 * with its path in the children the range was read from.
 */
export const eachFragmentNode = (
  nodes: readonly Descendant[],
  start: Path,
  visit: (node: Descendant, path: Path) => void
) => {
  const walk = (
    list: readonly Descendant[],
    parent: Path,
    onStartEdge: boolean
  ) => {
    list.forEach((node, at) => {
      const path = [...parent, onStartEdge ? start[parent.length] + at : at];

      visit(node, path);
      if (ElementApi.isElement(node)) {
        walk(node.children, path, onStartEdge && at === 0);
      }
    });
  };

  walk(nodes, [], true);
};

/** The keys the canonical pass dropped from a node a move carried them on. */
export type DroppedKeys = (source: object) => ReadonlySet<string>;

const NO_KEYS: ReadonlySet<string> = new Set();

export const noDroppedKeys: DroppedKeys = () => NO_KEYS;

/** The drops `steps` recorded, by the node each value was carried from. */
export const droppedKeysOf = (steps: readonly DraftStep[]): DroppedKeys => {
  const keys = new Map<object, Set<string>>();

  for (const step of steps) {
    for (const { key, place } of step.drops ?? []) {
      const entry = place?.document.nodeStartingAt(place.at);

      if (!place || entry?.from !== place.at) continue;
      const node = place.document.node(entry.path);
      const found = keys.get(node) ?? new Set<string>();

      found.add(key);
      keys.set(node, found);
    }
  }

  return keys.size === 0
    ? noDroppedKeys
    : (source) => keys.get(source) ?? NO_KEYS;
};

const withoutDropped = <T extends object>(
  expected: T,
  landed: object,
  dropped: ReadonlySet<string>
): T =>
  dropped.size === 0
    ? expected
    : (Object.fromEntries(
        Object.entries(expected).filter(
          ([key]) => !dropped.has(key) || Object.hasOwn(landed, key)
        )
      ) as T);

type RootPairs = Readonly<{
  back: Map<string, string>;
  forth: Map<string, string>;
}>;

const rootPairs = (): RootPairs => ({ back: new Map(), forth: new Map() });

const pairRoots = (pairs: RootPairs, aName: string, bName: string) => {
  if (pairs.forth.has(aName) || pairs.back.has(bName)) {
    return pairs.forth.get(aName) === bName ? 'seen' : 'clash';
  }
  pairs.forth.set(aName, bName);
  pairs.back.set(bName, aName);

  return 'new';
};

const sameContents = (
  a: readonly Descendant[],
  aRoots: JsonValue['roots'],
  b: readonly Descendant[],
  bRoots: JsonValue['roots'],
  dropped: DroppedKeys = noDroppedKeys,
  held: ReadonlySet<string> = NO_KEYS,
  pairs: RootPairs = rootPairs()
): boolean => {
  const sameList = (
    aList: readonly Descendant[],
    bList: readonly Descendant[]
  ): boolean =>
    aList.length === bList.length &&
    aList.every((node, i) => same(node, bList[i]));
  const same = (aNode: Descendant, bNode: Descendant): boolean => {
    if (NodeApi.isText(aNode) || NodeApi.isText(bNode)) {
      return (
        canonicalJsonKey(withoutDropped(aNode, bNode, dropped(aNode))) ===
        canonicalJsonKey(bNode)
      );
    }

    const {
      children: aChildren,
      childRoots: aChildRoots,
      ...aProps
    } = aNode as Element & { childRoots?: Record<string, string> };
    const {
      children: bChildren,
      childRoots: bChildRoots,
      ...bProps
    } = bNode as Element & { childRoots?: Record<string, string> };

    if (
      canonicalJsonKey(withoutDropped(aProps, bProps, dropped(aNode))) !==
      canonicalJsonKey(bProps)
    ) {
      return false;
    }

    const aRootNames = Object.keys(aChildRoots ?? {}).sort();
    const bRootNames = Object.keys(bChildRoots ?? {}).sort();

    if (aRootNames.join(',') !== bRootNames.join(',')) return false;

    for (const slot of aRootNames) {
      const aName = aChildRoots?.[slot] as string;
      const bName = bChildRoots?.[slot] as string;

      const pairing = pairRoots(pairs, aName, bName);

      if (pairing === 'clash') return false;
      if (pairing === 'seen' || (aName === bName && held.has(aName))) continue;
      if (!sameList(aRoots?.[aName] ?? [], bRoots?.[bName] ?? [])) {
        return false;
      }
    }

    return sameList(aChildren, bChildren);
  };

  return sameList(a, b);
};

export type ClosedEdges = Readonly<{ end: number; start: number }>;

type Edge = <T>(list: readonly T[]) => T | undefined;

const firstOf: Edge = (list) => list[0];
const lastOf: Edge = (list) => list.at(-1);

const nonEmpty = (nodes: readonly Descendant[]) =>
  nodes.filter((node) => !NodeApi.isText(node) || node.text !== '');

const edgeDepth = (nodes: readonly Descendant[], edge: Edge) => {
  let depth = 0;

  for (
    let node = edge(nonEmpty(nodes));
    node && ElementApi.isElement(node);
    node = edge(nonEmpty(node.children))
  ) {
    depth += 1;
  }

  return depth;
};

export const closedEdges = ({
  content,
  openEnd,
  openStart,
}: ContentSlice): ClosedEdges => ({
  end: edgeDepth(content, lastOf) - openEnd,
  start: edgeDepth(content, firstOf) - openStart,
});

const openAtEdge = (
  node: Element,
  atStart: boolean,
  atEnd: boolean,
  closed: ClosedEdges | undefined
) =>
  !!closed &&
  ((atStart && edgeDepth([node], firstOf) > closed.start) ||
    (atEnd && edgeDepth([node], lastOf) > closed.end));

export const textTokens = (
  fragment: readonly Descendant[],
  closed: ClosedEdges,
  kind: LandedKind
) => {
  const tokens: string[] = [];
  const visit = (
    nodes: readonly Descendant[],
    onStart: boolean,
    onEnd: boolean
  ) => {
    const list = nonEmpty(nodes);

    list.forEach((node, index) => {
      if (NodeApi.isText(node)) {
        tokens.push(canonicalJsonKey(node));
        return;
      }

      const atStart = onStart && index === 0;
      const atEnd = onEnd && index === list.length - 1;
      const open = openAtEdge(node, atStart, atEnd, closed);

      if (!open) {
        const { children: _children, ...props } = node;

        tokens.push(`<${canonicalJsonKey(props)}>`);
      }
      if (kind(node) === 'void') {
        for (const child of node.children) tokens.push(canonicalJsonKey(child));
      } else {
        visit(node.children, atStart, atEnd);
      }
      if (!open) tokens.push('</>');
    });
  };

  visit(fragment, true, true);

  return tokens.join('\u0000');
};

type LandedKind = (element: Element) => 'block' | 'inline' | 'void';

type FollowsDrop = (
  element: Element,
  ancestors: readonly Element[]
) => (key: string) => boolean;

type PayloadItem =
  | '</>'
  | Readonly<{ ancestors: readonly Element[]; element: Element }>
  | Readonly<{ text: Descendant }>;

export type SourceByPayloadNode = ReadonlyMap<object, object>;

export type MovedPayload = Readonly<{
  carried: number;
  followsDrop: FollowsDrop;
  head: Element | null;
  /**
   * The properties of the empty block the landing replaced that `head` lacks,
   * which the landed head may carry.
   */
  inherited: Readonly<Record<string, unknown>> | null;
  items: readonly PayloadItem[];
  kind: LandedKind;
  sources: SourceByPayloadNode;
}>;

const headChain = (nodes: readonly Descendant[], kind: LandedKind) => {
  const chain: Element[] = [];
  let node = nodes[0];

  while (node && ElementApi.isElement(node) && kind(node) === 'block') {
    chain.push(node);
    node = node.children[0];
  }

  return chain;
};

const openPrefix = (slice: ContentSlice, chain: readonly Element[]) => {
  let nodes = slice.content;
  let count = 0;

  while (
    count < slice.openStart &&
    count < chain.length &&
    nodes[0] === chain[count]
  ) {
    nodes = chain[count].children;
    count += 1;
  }

  return count;
};

const payloadItems = (
  nodes: readonly Descendant[],
  exempt: ReadonlySet<Element>
) => {
  const items: PayloadItem[] = [];
  const visit = (
    list: readonly Descendant[],
    ancestors: readonly Element[]
  ) => {
    for (const node of list) {
      if (NodeApi.isText(node)) {
        if (node.text !== '') items.push({ text: node });
        continue;
      }

      const shown = !exempt.has(node);

      if (shown) items.push({ ancestors, element: node });
      visit(node.children, [node, ...ancestors]);
      if (shown) items.push('</>');
    }
  };

  visit(nodes, []);

  return items;
};

const belowCarried = (
  nodes: readonly Descendant[],
  kind: LandedKind,
  carried: number
) => {
  const chain = headChain(nodes, kind);
  const atDrop = chain.length - carried;

  return atDrop < 0
    ? null
    : {
        head: chain[atDrop] ?? null,
        items: payloadItems(nodes, new Set(chain.slice(0, atDrop))),
      };
};

const shellOf = (element: Element, skip: (key: string) => boolean) => {
  const { children: _children, ...props } = element;

  return canonicalJsonKey(
    Object.fromEntries(Object.entries(props).filter(([key]) => !skip(key)))
  );
};

export const carryMove = ({
  followsDrop,
  kind,
  moved,
  replaced,
  sources = new Map(),
  written,
}: Readonly<{
  followsDrop: FollowsDrop;
  kind: LandedKind;
  moved: ContentSlice;
  replaced: Element | null;
  sources?: SourceByPayloadNode;
  written: ContentSlice;
}>): MovedPayload | null => {
  const movedChain = headChain(moved.content, kind);
  const writtenChain = headChain(written.content, kind);
  const peeled = movedChain.length - writtenChain.length;
  const uncarried = peeled + openPrefix(written, writtenChain);
  const addsShell = uncarried < 0;
  const losesShell = uncarried > openPrefix(moved, movedChain);

  if (addsShell || losesShell) return null;

  const head = movedChain[uncarried] ?? null;

  return {
    carried: movedChain.length - uncarried,
    followsDrop,
    head,
    inherited:
      head && replaced
        ? Object.fromEntries(
            Object.entries(replaced).filter(([key]) => !(key in head))
          )
        : null,
    items: payloadItems(moved.content, new Set(movedChain.slice(0, uncarried))),
    kind,
    sources,
  };
};

export const landsMoved = (
  landed: readonly Descendant[],
  { carried, followsDrop, head, inherited, items, kind, sources }: MovedPayload,
  dropped: DroppedKeys = noDroppedKeys
) => {
  const below = belowCarried(landed, kind, carried);

  if (!below) return false;

  const droppedFrom = (node: object) => {
    const source = sources.get(node);

    return source ? dropped(source) : NO_KEYS;
  };
  const inheritedBy = (element: Element, isHead: boolean) => (key: string) =>
    isHead &&
    !!inherited &&
    Object.hasOwn(inherited, key) &&
    canonicalJsonKey(element[key]) === canonicalJsonKey(inherited[key]);

  return (
    below.items.length === items.length &&
    below.items.every((item, index) => {
      const expected = items[index];

      if (typeof item === 'string' || typeof expected === 'string') {
        return item === expected;
      }
      if ('text' in item || 'text' in expected) {
        if (!('text' in item) || !('text' in expected)) return false;

        return (
          canonicalJsonKey(
            withoutDropped(expected.text, item.text, droppedFrom(expected.text))
          ) === canonicalJsonKey(item.text)
        );
      }

      const skip = followsDrop(item.element, item.ancestors);
      const landedInherits = inheritedBy(
        item.element,
        item.element === below.head
      );
      const expectedInherits = inheritedBy(
        expected.element,
        expected.element === head
      );
      const dropsHere = droppedFrom(expected.element);

      return (
        shellOf(item.element, (key) => skip(key) || landedInherits(key)) ===
        shellOf(
          expected.element,
          (key) =>
            skip(key) ||
            expectedInherits(key) ||
            (dropsHere.has(key) && !Object.hasOwn(item.element, key))
        )
      );
    })
  );
};

export const selectionRange = (from: Point, to: Point): Range => ({
  anchor: from,
  focus: to,
});

export const trackedRange = (
  index: DocumentIndex,
  { from, to }: DraftSpan
): Range | null => {
  const start = index.pointAt(from, 1);
  const end = index.pointAt(to, -1);

  return start && end
    ? selectionRange(
        { offset: start.offset, path: [...start.path] },
        { offset: end.offset, path: [...end.path] }
      )
    : null;
};

/** What a transfer's landing must still hold once commands and corrections wrote it. */
export type LandingExpectation =
  | Readonly<{
      aliased: ReadonlySet<string>;
      content: readonly Descendant[];
      independent: boolean;
      kind: 'nodes';
      roots: JsonValue['roots'];
    }>
  | Readonly<{
      aliased: ReadonlySet<string>;
      closed: ClosedEdges;
      content: readonly Descendant[];
      independent: boolean;
      kind: 'range-copy';
      landedKind: LandedKind;
      landedNameBySource: ReadonlyMap<string, string>;
      roots: JsonValue['roots'];
      sourceRoots: JsonValue['roots'];
    }>
  | Readonly<{ kind: 'range-move'; moved: MovedPayload }>;

export type DraftLanding = Readonly<{
  expected: LandingExpectation;
  track: DraftTrack;
}>;

type Copied = Readonly<{
  nodes: readonly Descendant[];
  roots: JsonValue['roots'];
  inputOf: (node: object) => object;
}>;

export type CopyNormalizer = (
  nodes: readonly Descendant[],
  roots: JsonValue['roots'],
  of?: Readonly<{
    /** Numbered last: the expected side lacks their content and the landed side holds the target's. */
    aliased?: ReadonlySet<string>;
    closed?: ClosedEdges;
    nearestAncestorsOf?: (index: number) => readonly Element[];
  }>
) => Copied;

const childRootNames = (element: Element) => {
  const { childRoots } = element as Element & {
    childRoots?: Record<string, string>;
  };

  return childRoots
    ? Object.keys(childRoots)
        .sort()
        .map((slot) => childRoots[slot])
    : [];
};

const PLACE_MARK = '\u0000';

const apartFromPlaces = (name: string) =>
  name.startsWith(PLACE_MARK) ? `${PLACE_MARK}${name}` : undefined;

export const copyNormalizer = (
  schema: CompiledEditorSchema,
  copyChildren: (
    children: readonly Descendant[],
    root: RootKey,
    ancestors?: readonly Element[]
  ) => readonly Descendant[],
  root: RootKey
): CopyNormalizer => {
  const unique = uniquePropertiesOf(schema);
  const referenced = new Set(
    [...schema.properties.byId.values()].flatMap(({ references }) =>
      references && unique.has(references.key) ? [references.key] : []
    )
  );

  return (
    nodes,
    roots,
    { aliased, closed, nearestAncestorsOf = () => [] } = {}
  ) => {
    const places = new Map<string, Map<string, string>>();
    const walked = new Set<string>();
    const deferred: string[] = [];
    const inputs = new WeakMap<object, object>();
    const walkRoot = (name: string) => {
      walked.add(name);
      placeHolders(roots?.[name] ?? [], `${PLACE_MARK}${walked.size}`);
    };
    const placeHolders = (
      list: readonly Descendant[],
      rootPlace: string,
      edges?: ClosedEdges
    ) => {
      let carried = 0;
      const visit = (
        children: readonly Descendant[],
        onStart: boolean,
        onEnd: boolean
      ) => {
        const kept = nonEmpty(children);

        kept.forEach((node, index) => {
          if (!ElementApi.isElement(node)) return;
          const atStart = onStart && index === 0;
          const atEnd = onEnd && index === kept.length - 1;

          if (!openAtEdge(node, atStart, atEnd, edges)) {
            const place = `${rootPlace}.${(carried += 1)}`;

            for (const key of referenced) {
              if (node[key] === undefined) continue;
              const byValue = places.get(key) ?? new Map<string, string>();
              const value = canonicalJsonKey(node[key]);

              places.set(key, byValue);
              if (!byValue.has(value)) byValue.set(value, place);
            }
          }
          visit(node.children, atStart, atEnd);
          for (const name of childRootNames(node)) {
            if (walked.has(name)) continue;
            if (aliased?.has(name)) deferred.push(name);
            else walkRoot(name);
          }
        });
      };

      visit(list, true, true);
    };

    placeHolders(nodes, `${PLACE_MARK}0`, closed);
    for (const name of deferred) {
      if (!walked.has(name)) walkRoot(name);
    }

    const nameByPlace = (
      list: readonly Descendant[],
      ancestors: readonly Element[],
      at: RootKey
    ): readonly Descendant[] => {
      const out = list.map((node) => {
        if (!ElementApi.isElement(node)) return node;
        const context = toCompiledNodeContext(node, ancestors, at);
        const renamed: Record<string, EditorJsonValue> = {};

        for (const [key, value] of Object.entries(node)) {
          const references = resolveCompiledSchemaProperty(
            schema,
            'element',
            key,
            context
          )?.references;
          const byValue = references && places.get(references.key);

          if (!references || !byValue) continue;
          const mapped = references.map(
            value as EditorJsonValue,
            (name) =>
              byValue.get(canonicalJsonKey(name)) ?? apartFromPlaces(name)
          );

          if (canonicalJsonKey(mapped) !== canonicalJsonKey(value)) {
            renamed[key] = mapped;
          }
        }
        const element =
          Object.keys(renamed).length === 0 ? node : { ...node, ...renamed };
        const children = nameByPlace(
          node.children,
          [element, ...ancestors],
          at
        );

        return element === node && children === node.children
          ? node
          : { ...element, children };
      });

      return out.every((node, index) => node === list[index]) ? list : out;
    };
    const copyRecordingInputs = (
      list: readonly Descendant[],
      ancestors: readonly Element[],
      at: RootKey
    ) => {
      const renamed =
        places.size === 0 ? list : nameByPlace(list, ancestors, at);
      const result = copyChildren(renamed, at, ancestors);
      const trace = (
        out: readonly Descendant[],
        input: readonly Descendant[]
      ) => {
        out.forEach((node, index) => {
          const from = input[index];

          if (node === from) return;
          inputs.set(node, from);
          if (ElementApi.isElement(node) && ElementApi.isElement(from)) {
            trace(node.children, from.children);
          }
        });
      };

      trace(result, list);

      return result;
    };

    return {
      nodes: nodes.flatMap((node, index) =>
        copyRecordingInputs([node], nearestAncestorsOf(index), root)
      ),
      roots: roots && {
        ...roots,
        ...Object.fromEntries(
          [...walked].map((name) => [
            name,
            copyRecordingInputs(roots[name] ?? [], [], name),
          ])
        ),
      },
      inputOf: (node) => inputs.get(node) ?? node,
    };
  };
};

const rootsNamedBy = (
  nodes: readonly Descendant[],
  roots: JsonValue['roots']
) => {
  const named = new Set<string>();
  const visit = (list: readonly Descendant[]) => {
    for (const node of list) {
      if (!ElementApi.isElement(node)) continue;
      for (const name of childRootNames(node)) {
        if (named.has(name)) continue;
        named.add(name);
        visit(roots?.[name] ?? []);
      }
      visit(node.children);
    }
  };

  visit(nodes);

  return named;
};

const fragmentOf = (children: readonly Descendant[], range: Range) =>
  NodeApi.fragment({ children, type: '' }, range);

/** A landing as one draft holds it. */
export type LandingSample = Readonly<{
  children: readonly Descendant[];
  /** The drops the draft's canonical pass recorded. */
  dropped: DroppedKeys;
  index: DocumentIndex;
  roots: JsonValue['roots'];
  spans: readonly DraftSpan[];
}>;

export const trackedPaths = (
  index: DocumentIndex,
  spans: readonly DraftSpan[]
): Array<Path | null> =>
  spans.map(({ from, to }) => {
    const entry = index.nodeStartingAt(from);

    return entry && entry.to === to ? [...entry.path] : null;
  });

export const landingHolds = (
  expected: LandingExpectation,
  { children, dropped, index, roots, spans }: LandingSample,
  copy: CopyNormalizer | null
) => {
  const asCopied: CopyNormalizer = (nodes, from, of) =>
    copy
      ? copy(nodes, from, of)
      : { inputOf: (node) => node, nodes, roots: from };

  if (expected.kind === 'nodes') {
    const paths = trackedPaths(index, spans);
    const nodes = paths.map((path) => path && nodeAt(children, path));

    if (
      paths.length !== expected.content.length ||
      nodes.some((node) => !node)
    ) {
      return false;
    }

    const of = {
      aliased: expected.aliased,
      nearestAncestorsOf: (at: number) =>
        ancestorsAt(children, paths[at] as Path),
    };
    const want = asCopied(expected.content, expected.roots, of);
    const landed = asCopied(nodes as Descendant[], roots, of);

    return sameContents(
      want.nodes,
      want.roots,
      landed.nodes,
      landed.roots,
      (source) => dropped(want.inputOf(source)),
      expected.independent ? NO_KEYS : expected.aliased
    );
  }

  const [span] = spans;
  const range = span && trackedRange(index, span);

  if (!range) return false;

  const landed = fragmentOf(children, range);

  if (expected.kind === 'range-move') {
    return landsMoved(landed, expected.moved, dropped);
  }

  const {
    aliased,
    closed,
    independent,
    landedKind,
    landedNameBySource,
    sourceRoots,
  } = expected;
  const got = asCopied(landed, roots, { aliased, closed });
  const want = asCopied(
    expected.content,
    { ...roots, ...expected.roots },
    { aliased, closed }
  );
  const pairs = rootPairs();
  const keepsSource = (name: string) => {
    const source = asCopied(sourceRoots?.[name] ?? [], sourceRoots);
    const target = asCopied(roots?.[name] ?? [], roots);

    return sameContents(
      source.nodes,
      source.roots,
      target.nodes,
      target.roots,
      noDroppedKeys,
      NO_KEYS,
      pairs
    );
  };

  if (
    textTokens(got.nodes, closed, landedKind) !==
    textTokens(want.nodes, closed, landedKind)
  ) {
    return false;
  }
  if (!independent) return true;
  for (const [source, name] of landedNameBySource) {
    pairRoots(pairs, source, name);
  }
  const named = rootsNamedBy(landed, roots);

  return [...aliased].every((name) => !named.has(name) || keepsSource(name));
};

/**
 * What a command frame's draft must hold: the landing as the projection the
 * frame started from shows it, or `null` when the projection cannot place the
 * landing.
 */
export const rebaseLanding = (
  { expected, track }: DraftLanding,
  frame: DraftGuardFrame,
  root: RootKey
): LandingExpectation | null => {
  const start = readDraftTrackAt(track, frame);

  if (!start) return null;

  const { value } = frame.start;
  const children = rootChildren(value, root);

  if (expected.kind === 'nodes') {
    const content: Descendant[] = [];

    for (const path of trackedPaths(start.index, start.spans)) {
      const node = path && nodeAt(children, path);

      if (!path || !node) return null;
      content.push(node);
    }

    return { ...expected, content, roots: value.roots };
  }

  const [span] = start.spans;
  const range = span && trackedRange(start.index, span);

  if (!range) return null;

  const started = fragmentOf(children, range);

  if (expected.kind === 'range-copy') {
    return { ...expected, content: started, roots: value.roots };
  }

  const { moved } = expected;
  const below = belowCarried(started, moved.kind, moved.carried);

  if (!below) return null;

  const sources = new Map<object, object>();

  eachFragmentNode(started, range.anchor.path, (node, path) => {
    const source = nodeAt(children, path);

    if (source) sources.set(node, source);
  });

  return {
    kind: 'range-move',
    moved: { ...moved, ...below, sources },
  };
};

export const guardLanding = (
  editor: AnyEditor,
  copy: boolean,
  draft: { current: DraftLanding | null },
  check: (
    landed: DraftLanding,
    after: JsonValue,
    frame?: DraftGuardFrame
  ) => boolean,
  diagnostics: TransferDiagnostic[]
) =>
  // Every plain draft checks the landing as commands and corrections wrote it,
  // before a recorder adds review marks, which are not a loss. Corrections in
  // a command frame run after the first recording, so a pass decides nothing.
  registerEditorDraftGuard(
    editor,
    (written, frame) => {
      const landing = draft.current;

      if (!landing || check(landing, written, frame)) return;
      draft.current = null;
      if (!copy) throw new TransferRefusalError('lossy');
      diagnostics.push({
        impact: 'lossy',
        message: 'Some dragged content does not fit here.',
      });
    },
    'plain',
    'transaction'
  );
