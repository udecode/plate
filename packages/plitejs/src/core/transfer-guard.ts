import type { AnyEditor, RootKey } from '../interfaces/editor';
import { ElementApi, type Element } from '../interfaces/element';
import { NodeApi, type Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import { DocumentChange } from './change/document-change';
import { DocumentIndex } from './change/document-index';
import { type JsonValue, TransferRefusalError } from './landing';
import { registerEditorDraftGuard } from './public-state';
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

      if (NodeApi.isText(node)) {
        tokens.push(JSON.stringify(node));
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

  const emptyText = JSON.stringify({ text: '' });

  return tokens.filter((token) => token !== emptyText).join('\u0000');
};

export const selectionRange = (from: Point, to: Point): Range => ({
  anchor: from,
  focus: to,
});

export type DraftLanding = Readonly<{
  children: readonly Descendant[];
  landed: Readonly<{ paths: readonly Path[] }> | Readonly<{ range: Range }>;
}>;

export const mapDraft = (
  draft: readonly Descendant[],
  after: readonly Descendant[]
) => {
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
  check: (landed: DraftLanding, after: JsonValue) => boolean,
  diagnostics: TransferDiagnostic[]
) =>
  registerEditorDraftGuard(editor, (written) => {
    const landing = draft.current;

    if (!landing) return;
    draft.current = null;
    if (check(landing, written)) return;
    if (!copy) throw new TransferRefusalError('lossy');
    diagnostics.push({
      impact: 'lossy',
      message: 'Some dragged content does not fit here.',
    });
  });
