import type { AnyEditor, ContentSlice, RootKey } from '../interfaces/editor';
import { ElementApi, type Element } from '../interfaces/element';
import { NodeApi, type Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import type { DraftStep } from './change/builder';
import type { DocumentIndex } from './change/document-index';
import {
  type DraftGuardFrame,
  registerEditorDraftGuard,
} from './document-recorder';
import type { DraftSpan, DraftTrack } from './draft-track';
import { type JsonValue, TransferRefusalError } from './landing';
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

export const sameContent = (
  a: Descendant,
  aRoots: JsonValue['roots'],
  b: Descendant,
  bRoots: JsonValue['roots'],
  dropped: DroppedKeys = noDroppedKeys
): boolean => {
  if (NodeApi.isText(a) || NodeApi.isText(b)) {
    return (
      JSON.stringify(withoutDropped(a, b, dropped(a))) === JSON.stringify(b)
    );
  }

  const {
    children: aChildren,
    childRoots: aChildRoots,
    ...aProps
  } = a as Element & { childRoots?: Record<string, string> };
  const {
    children: bChildren,
    childRoots: bChildRoots,
    ...bProps
  } = b as Element & { childRoots?: Record<string, string> };

  if (stable(withoutDropped(aProps, bProps, dropped(a))) !== stable(bProps)) {
    return false;
  }
  if (aChildren.length !== bChildren.length) return false;

  const aRootNames = Object.keys(aChildRoots ?? {}).sort();
  const bRootNames = Object.keys(bChildRoots ?? {}).sort();

  if (aRootNames.join(',') !== bRootNames.join(',')) return false;

  for (const slot of aRootNames) {
    const aRoot = aRoots?.[aChildRoots?.[slot] as string] ?? [];
    const bRoot = bRoots?.[bChildRoots?.[slot] as string] ?? [];

    if (
      aRoot.length !== bRoot.length ||
      aRoot.some(
        (node, i) => !sameContent(node, aRoots, bRoot[i], bRoots, dropped)
      )
    ) {
      return false;
    }
  }

  return aChildren.every((child, i) =>
    sameContent(child, aRoots, bChildren[i], bRoots, dropped)
  );
};

export const textTokens = (fragment: readonly Descendant[]) => {
  const tokens: string[] = [];
  const visit = (
    nodes: readonly Descendant[],
    openStart: boolean,
    openEnd: boolean
  ) => {
    nodes.forEach((node, index) => {
      const isFirst = index === 0;
      const isLast = index === nodes.length - 1;

      // An empty text holds no content, whatever properties it carries.
      if (NodeApi.isText(node)) {
        if (node.text !== '') tokens.push(JSON.stringify(node));
        return;
      }

      const element = node;
      const open = (openStart && isFirst) || (openEnd && isLast);

      if (!open) {
        const { children: _children, ...props } = element;

        tokens.push(`<${JSON.stringify(props)}>`);
      }
      visit(element.children, openStart && isFirst, openEnd && isLast);
      if (!open) tokens.push('</>');
    });
  };

  visit(fragment, true, true);

  return tokens.join('\u0000');
};

export const stable = (value: unknown): string =>
  JSON.stringify(value, (_key, item: unknown) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([left], [right]) =>
            left.localeCompare(right)
          )
        )
      : item
  );

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
  items: readonly PayloadItem[];
  kind: LandedKind;
  replaced: Element | null;
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

const shellOf = (element: Element, skip: (key: string) => boolean) => {
  const { children: _children, ...props } = element;

  return stable(
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

  return {
    carried: movedChain.length - uncarried,
    followsDrop,
    head: movedChain[uncarried] ?? null,
    items: payloadItems(moved.content, new Set(movedChain.slice(0, uncarried))),
    kind,
    replaced,
    sources,
  };
};

export const landsMoved = (
  landed: readonly Descendant[],
  { carried, followsDrop, head, items, kind, replaced, sources }: MovedPayload,
  dropped: DroppedKeys = noDroppedKeys
) => {
  const landedChain = headChain(landed, kind);
  const atDrop = landedChain.length - carried;

  if (atDrop < 0) return false;

  const landedHead = landedChain[atDrop] ?? null;
  const found = payloadItems(landed, new Set(landedChain.slice(0, atDrop)));
  const droppedFrom = (node: object) => {
    const source = sources.get(node);

    return source ? dropped(source) : NO_KEYS;
  };

  return (
    found.length === items.length &&
    found.every((item, index) => {
      const expected = items[index];

      if (typeof item === 'string' || typeof expected === 'string') {
        return item === expected;
      }
      if ('text' in item || 'text' in expected) {
        if (!('text' in item) || !('text' in expected)) return false;

        return (
          stable(
            withoutDropped(expected.text, item.text, droppedFrom(expected.text))
          ) === stable(item.text)
        );
      }

      const skip = followsDrop(item.element, item.ancestors);
      const fromReplacedBlock = (key: string) =>
        item.element === landedHead &&
        !!replaced &&
        !!head &&
        !(key in head) &&
        stable(item.element[key]) === stable(replaced[key]);

      const dropsHere = droppedFrom(expected.element);

      return (
        shellOf(item.element, (key) => skip(key) || fromReplacedBlock(key)) ===
        shellOf(
          expected.element,
          (key) =>
            skip(key) ||
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

export type DraftLanding = Readonly<{
  kind: 'nodes' | 'range';
  track: DraftTrack;
}>;

export const trackedPaths = (
  index: DocumentIndex,
  spans: readonly DraftSpan[]
): Array<Path | null> =>
  spans.map(({ from, to }) => {
    const entry = index.nodeStartingAt(from);

    return entry && entry.to === to ? [...entry.path] : null;
  });

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
