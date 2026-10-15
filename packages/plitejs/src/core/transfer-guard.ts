import type { AnyEditor, ContentSlice, RootKey } from '../interfaces/editor';
import { ElementApi, type Element } from '../interfaces/element';
import { NodeApi, type Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import { DocumentChange } from './change/document-change';
import { DocumentIndex } from './change/document-index';
import {
  type DraftGuardFrame,
  registerEditorDraftGuard,
} from './document-recorder';
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

export const sameContent = (
  a: Descendant,
  aRoots: JsonValue['roots'],
  b: Descendant,
  bRoots: JsonValue['roots']
): boolean => {
  if (NodeApi.isText(a) || NodeApi.isText(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
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

  if (JSON.stringify(aProps) !== JSON.stringify(bProps)) return false;
  if (aChildren.length !== bChildren.length) return false;

  const aRootNames = Object.keys(aChildRoots ?? {}).sort();
  const bRootNames = Object.keys(bChildRoots ?? {}).sort();

  if (aRootNames.join(',') !== bRootNames.join(',')) return false;

  for (const slot of aRootNames) {
    const aRoot = aRoots?.[aChildRoots?.[slot] as string] ?? [];
    const bRoot = bRoots?.[bChildRoots?.[slot] as string] ?? [];

    if (
      aRoot.length !== bRoot.length ||
      aRoot.some((node, i) => !sameContent(node, aRoots, bRoot[i], bRoots))
    ) {
      return false;
    }
  }

  return aChildren.every((child, i) =>
    sameContent(child, aRoots, bChildren[i], bRoots)
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
  | string
  | Readonly<{ ancestors: readonly Element[]; element: Element }>;

export type MovedPayload = Readonly<{
  carried: number;
  followsDrop: FollowsDrop;
  head: Element | null;
  items: readonly PayloadItem[];
  kind: LandedKind;
  replaced: Element | null;
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

const openEdge = (
  slice: ContentSlice,
  side: 'end' | 'start',
  kind: LandedKind
) => {
  const open = side === 'start' ? slice.openStart : slice.openEnd;
  let nodes = slice.content;
  let block: Element | null = null;
  let inlines = 0;

  for (let depth = 0; depth < open; depth++) {
    const node = side === 'start' ? nodes[0] : nodes.at(-1);

    if (!node || !ElementApi.isElement(node)) break;
    if (kind(node) === 'inline') inlines += 1;
    else if (kind(node) === 'block' && inlines === 0) block = node;
    else break;
    nodes = node.children;
  }

  return {
    empty:
      !!block &&
      block.children.every(
        (child) => NodeApi.isText(child) && child.text === ''
      ),
    inlines,
  };
};

const outsideInlines = (
  children: readonly Descendant[],
  point: Point,
  side: 'after' | 'before',
  isInline: (element: Element) => boolean,
  skipOuter: number
): Point => {
  let nodes = children;
  let outer = 0;

  for (const [depth, index] of point.path.entries()) {
    const node = nodes[index];

    if (!node || !ElementApi.isElement(node)) return point;
    if (isInline(node) && outer === skipOuter) {
      const at = side === 'after' ? index + 1 : index - 1;
      const text = nodes[at];

      return text && NodeApi.isText(text)
        ? {
            ...point,
            offset: side === 'after' ? 0 : text.text.length,
            path: [...point.path.slice(0, depth), at],
          }
        : point;
    }
    if (isInline(node)) outer += 1;
    nodes = node.children;
  }

  return point;
};

type DraftPositions = Readonly<{ from: number; to: number }>;

/**
 * The range runs from the first to the last content the landing inserted
 * (`span`), since anchors at a text's edge miss a slice that lands as leaves
 * of its own. Each end reads outward, so an inline void at the edge stays in,
 * unless that leaves the block the content's edge lies in. An empty open head
 * merges into the text block that holds the drop point, and an empty open end
 * becomes the one that holds the drop point's following text, so such an edge
 * reaches from the insertion's `tokenSpan` into that block, outside the inline
 * elements the drop point splits beyond those the slice is open into; between
 * blocks, into the blocks the fit inserted.
 */
export const landedRange = ({
  children,
  fallback,
  isInline,
  kind,
  span,
  tokenSpan,
  written,
}: Readonly<{
  children: readonly Descendant[];
  fallback: Readonly<{ end: Point; start: Point }>;
  isInline: (element: Element) => boolean;
  kind: LandedKind;
  span: DraftPositions | null;
  tokenSpan: DraftPositions | null;
  written: ContentSlice;
}>): Range => {
  const index = DocumentIndex.fromValue(children);
  const blockKeyOf = (path: readonly number[]) => {
    let nodes = children;
    let block = '';

    for (const [depth, at] of path.entries()) {
      const node = nodes[at];

      if (!node || !ElementApi.isElement(node)) break;
      if (!isInline(node)) block = path.slice(0, depth + 1).join('/');
      nodes = node.children;
    }

    return block;
  };
  const pointAt = (position: number, assoc: -1 | 1, otherwise: Point) => {
    const found = index.pointAt(position, assoc);

    return found
      ? { ...otherwise, offset: found.offset, path: [...found.path] }
      : otherwise;
  };
  const contentEdge = (position: number, outward: -1 | 1, otherwise: Point) => {
    const out = pointAt(position, outward, otherwise);
    const into = pointAt(position, outward === 1 ? -1 : 1, otherwise);

    return blockKeyOf(out.path) === blockKeyOf(into.path) ? out : into;
  };
  const textBlockAt = (position: number) => {
    const context = index.openContextAt(position);

    for (let at = context.length - 1; at >= 0; at--) {
      const { path } = context[at];
      const node = nodeAt(children, [...path]);

      if (node && ElementApi.isElement(node) && !isInline(node)) {
        return node.children.every(
          (child) => NodeApi.isText(child) || isInline(child)
        )
          ? ([node, [...path]] as const)
          : null;
      }
    }

    return null;
  };
  const insertionEdge = (
    position: number,
    toward: -1 | 1,
    carried: number,
    otherwise: Point
  ) => {
    const block = textBlockAt(position);

    if (!block) return pointAt(position, toward === 1 ? -1 : 1, otherwise);

    const [element, path] = block;
    const read = pointAt(position, toward, otherwise);
    const at = toward === -1 ? 0 : element.children.length - 1;
    const text = element.children[at];

    return outsideInlines(
      children,
      blockKeyOf(read.path) === path.join('/') || !NodeApi.isText(text)
        ? read
        : {
            ...otherwise,
            offset: toward === -1 ? 0 : text.text.length,
            path: [...path, at],
          },
      toward === -1 ? 'after' : 'before',
      isInline,
      carried
    );
  };
  const edge = (side: 'end' | 'start') => {
    const toward = side === 'start' ? -1 : 1;
    const open = openEdge(written, side, kind);

    if (span && !open.empty) {
      return contentEdge(
        side === 'start' ? span.from : span.to,
        toward,
        fallback[side]
      );
    }

    return tokenSpan
      ? insertionEdge(
          side === 'start' ? tokenSpan.from : tokenSpan.to,
          toward,
          open.inlines,
          fallback[side]
        )
      : fallback[side];
  };

  return selectionRange(edge('start'), edge('end'));
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
        if (node.text !== '') items.push(stable(node));
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
  written,
}: Readonly<{
  followsDrop: FollowsDrop;
  kind: LandedKind;
  moved: ContentSlice;
  replaced: Element | null;
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
  };
};

export const landsMoved = (
  landed: readonly Descendant[],
  { carried, followsDrop, head, items, kind, replaced }: MovedPayload
) => {
  const landedChain = headChain(landed, kind);
  const atDrop = landedChain.length - carried;

  if (atDrop < 0) return false;

  const landedHead = landedChain[atDrop] ?? null;
  const found = payloadItems(landed, new Set(landedChain.slice(0, atDrop)));

  return (
    found.length === items.length &&
    found.every((item, index) => {
      const expected = items[index];

      if (typeof item === 'string' || typeof expected === 'string') {
        return item === expected;
      }

      const skip = followsDrop(item.element, item.ancestors);
      const fromReplacedBlock = (key: string) =>
        item.element === landedHead &&
        !!replaced &&
        !!head &&
        !(key in head) &&
        stable(item.element[key]) === stable(replaced[key]);

      return (
        shellOf(item.element, (key) => skip(key) || fromReplacedBlock(key)) ===
        shellOf(expected.element, skip)
      );
    })
  );
};

export const selectionRange = (from: Point, to: Point): Range => ({
  anchor: from,
  focus: to,
});

export type DraftLanding = Readonly<{
  children: readonly Descendant[];
  landed: Readonly<{ paths: readonly Path[] }> | Readonly<{ range: Range }>;
}>;

type DraftMap = Readonly<{
  path: (path: Path) => Path | null;
  point: (point: Point, association?: 'backward' | 'forward') => Point | null;
}>;

export const mapDraft = (
  draft: readonly Descendant[],
  after: readonly Descendant[],
  frame?: Readonly<{
    mapPosition: (
      position: number,
      association: 'backward' | 'forward'
    ) => number | null;
    stored: readonly Descendant[];
  }>
): DraftMap => {
  // A command frame wrote another document than the draft's, so the landing
  // maps to the stored document and then to what the frame wrote.
  if (frame) {
    const toStored = mapDraft(draft, frame.stored);
    const stored = DocumentIndex.fromValue(frame.stored);
    const next = DocumentIndex.fromValue(after);
    const through = frame.mapPosition;

    return {
      path: (path) => {
        const at = toStored.path(path);
        const mapped = at && through(stored.nodeRange(at).from, 'forward');
        const entry = mapped == null ? null : next.nodeStartingAt(mapped);

        return entry ? [...entry.path] : null;
      },
      point: (point, association = 'backward') => {
        const at = toStored.point(point, association);
        const mapped = at && through(stored.positionAt(at), association);

        return mapped == null
          ? null
          : next.pointAt(mapped, association === 'backward' ? -1 : 1);
      },
    };
  }
  if (draft === after) {
    return {
      path: (path: Path): Path | null => path,
      point: (point: Point): Point | null => point,
    };
  }

  const before = DocumentIndex.fromValue(draft);
  const next = DocumentIndex.fromValue(after);
  const change = DocumentChange.between(
    { children: draft },
    { children: after }
  );

  return {
    path: (path: Path): Path | null => {
      const mapped = change.mapPosition(before.nodeRange(path).from, {
        association: 'forward',
      });
      const entry = mapped == null ? null : next.nodeStartingAt(mapped);

      return entry ? [...entry.path] : null;
    },
    point: (point: Point, association: 'backward' | 'forward' = 'backward') => {
      const mapped = change.mapPosition(before.positionAt(point), {
        association,
      });
      const mappedPoint =
        mapped == null
          ? null
          : next.pointAt(mapped, association === 'backward' ? -1 : 1);

      return mappedPoint;
    },
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
    'plain'
  );
