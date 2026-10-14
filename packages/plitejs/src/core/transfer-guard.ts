import type { AnyEditor, RootKey } from '../interfaces/editor';
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
    change: DocumentChange;
    root: RootKey;
    stored: readonly Descendant[];
  }>
): DraftMap => {
  // A command frame wrote another document than the draft's, so the landing
  // maps to the stored document and then through the frame's own change.
  if (frame) {
    const toStored = mapDraft(draft, frame.stored);
    const stored = DocumentIndex.fromValue(frame.stored);
    const next = DocumentIndex.fromValue(after);
    const through = (position: number, association: 'backward' | 'forward') =>
      frame.change.mapPosition(position, {
        association,
        ...(frame.root === 'main' ? {} : { root: frame.root }),
      });

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
