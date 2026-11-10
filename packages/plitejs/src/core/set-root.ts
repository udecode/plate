import type { EditorDocumentValue } from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import {
  type NodeSelection,
  type Selection,
  SelectionApi,
  type SelectionValue,
  type TextSelection,
} from '../interfaces/selection';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import { valueRoot, valueRootIndex } from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import { isElementNode, isTextNode } from './change/tokens';
import type { DocumentRead, InternalEditorSchemaApi } from './editor-schema';
import { EditorRefusalError } from './refusal';
import { cloneEditorJsonValue } from './value-codec';

declare const settled: unique symbol;

type Settled<T> = T & { readonly [settled]: true };

export type SettledCaret = Readonly<{
  root: string;
  selection: Settled<SelectionValue> | null;
  inSetRoot: boolean;
  /**
   * Counts runs of text selections in one top-level block. A placed write into
   * another block, root or kind starts the next run; a carried write never
   * does, and a landing does.
   */
  session: number;
}>;

export type SettledSelection = SettledCaret['selection'];

export type SettledRange = Settled<Range>;

export type SetSite = DocumentRead &
  Readonly<{ schema: InternalEditorSchemaApi }>;

export const valueSite = (
  schema: InternalEditorSchemaApi,
  value: () => EditorDocumentValue
): SetSite => ({
  rootChildren: (root) => valueRoot(value(), root),
  schema,
  value,
});

/**
 * `place` writes a selection as given and clamps one that crosses members.
 * `move` is keyboard motion, which never leaves the member it starts in.
 * `carry` re-expresses the same selection, as the authored recorder does, and
 * keeps the edit session.
 */
export type SettleLaw = 'carry' | 'move' | 'place';

export const NO_CARET: SettledCaret = Object.freeze({
  root: MAIN_ROOT_KEY,
  selection: null,
  session: 0,
  inSetRoot: false,
});

const brand = (selection: SelectionValue) =>
  selection as Settled<SelectionValue>;

const isSetRoot = (site: SetSite, root: string) =>
  site.schema.isSetRoot(root, site);

const memberOf = (selection: SelectionValue | null): number | null => {
  if (!selection) return null;
  if (SelectionApi.isNode(selection)) {
    const slot = selection.paths[0][0];

    return slot !== undefined &&
      selection.paths.every((path) => path[0] === slot)
      ? slot
      : null;
  }
  const { anchor, focus } = selection;

  return anchor.path[0] === focus.path[0] ? (anchor.path[0] ?? null) : null;
};

const memberEdge = (
  document: DocumentIndex,
  slot: number,
  edge: 'end' | 'start'
): Readonly<{ offset: number; path: Path }> | null => {
  let node = document.child(slot);
  const path = [slot];

  while (node && isElementNode(node)) {
    const index = edge === 'start' ? 0 : node.children.length - 1;

    node = node.children[index];
    path.push(index);
  }
  if (!node || !isTextNode(node)) return null;

  return { offset: edge === 'start' ? 0 : node.text.length, path };
};

const memberSelection = (root: string, slot: number): Settled<SelectionValue> =>
  brand(
    SelectionApi.nodes([[slot]], {
      mode: 'block',
      ...(root === MAIN_ROOT_KEY ? {} : { root }),
    })
  );

const clampToMember = (
  site: SetSite,
  root: string,
  selection: Range,
  slot: number
): Settled<SelectionValue> => {
  const document = valueRootIndex(site.value(), root);
  const start = memberEdge(document, slot, 'start');
  const end = memberEdge(document, slot, 'end');

  if (!start || !end) return memberSelection(root, slot);
  const clamp = (point: Point): Point => {
    const at = point.path[0] ?? slot;

    if (at === slot) return point;
    const edge = at < slot ? start : end;

    return {
      offset: edge.offset,
      path: edge.path,
      ...(point.root === undefined ? {} : { root: point.root }),
    };
  };
  const anchor = clamp(selection.anchor);
  const focus = clamp(selection.focus);

  if (anchor === selection.anchor && focus === selection.focus) {
    return brand(selection as SelectionValue);
  }
  const { marks: _marks, ...rest } = selection as Range & {
    marks?: unknown;
  };
  const clamped = { ...rest, anchor, focus };

  return brand(
    (RangeApi.isCollapsed(clamped)
      ? { ...selection, anchor, focus }
      : clamped) as SelectionValue
  );
};

const keepNodeMember = (
  selection: NodeSelection,
  member: number | null
): Settled<SelectionValue> => {
  if (selection.paths.every((path) => path.length === 1)) {
    return brand(selection);
  }
  const slots = new Set(selection.paths.map((path) => path[0]));

  if (slots.size === 1) return brand(selection);
  const keep =
    member !== null && slots.has(member) ? member : selection.anchorPath[0];
  const paths = selection.paths.filter((path) => path[0] === keep) as [
    Path,
    ...Path[],
  ];
  const inside = (path: Path) => path[0] === keep;

  return brand(
    SelectionApi.nodes(paths, {
      anchorPath: inside(selection.anchorPath)
        ? selection.anchorPath
        : paths[0],
      focusPath: inside(selection.focusPath)
        ? selection.focusPath
        : (paths.at(-1) ?? paths[0]),
      mode: paths.length === 1 ? selection.mode : 'block',
      ...(selection.root === undefined ? {} : { root: selection.root }),
    })
  );
};

const settleText = (
  site: SetSite,
  root: string,
  selection: TextSelection,
  member: number | null,
  law: SettleLaw
): Settled<SelectionValue> => {
  const anchorSlot = selection.anchor.path[0];
  const focusSlot = selection.focus.path[0];

  if (anchorSlot === undefined || focusSlot === undefined) {
    return brand(selection);
  }
  if (law === 'move' && member !== null) {
    return anchorSlot === member && focusSlot === member
      ? brand(selection)
      : clampToMember(site, root, selection, member);
  }
  if (anchorSlot === focusSlot) return brand(selection);
  const keep =
    member !== null &&
    member >= Math.min(anchorSlot, focusSlot) &&
    member <= Math.max(anchorSlot, focusSlot)
      ? member
      : anchorSlot;

  return clampToMember(site, root, selection, keep);
};

const nextSession = (
  previous: SettledCaret,
  root: string,
  selection: SelectionValue | null
) => {
  if (!previous.selection && !selection) return previous.session;
  const sameRun =
    !!previous.selection &&
    !!selection &&
    !SelectionApi.isNode(previous.selection) &&
    !SelectionApi.isNode(selection) &&
    previous.root === root &&
    previous.selection.anchor.path[0] === selection.anchor.path[0];

  return sameRun ? previous.session : previous.session + 1;
};

export const settleCaret = (
  site: SetSite,
  previous: SettledCaret,
  write: Readonly<{ root: string; selection: Selection }>,
  law: SettleLaw
): SettledCaret => {
  const { root } = write;
  const written = write.selection ?? null;
  const sessionOf = (selection: SelectionValue | null) =>
    law === 'carry' ? previous.session : nextSession(previous, root, selection);

  if (!written) {
    return Object.freeze({
      root,
      selection: null,
      session: sessionOf(null),
      inSetRoot: false,
    });
  }
  const inSetRoot = isSetRoot(site, root);

  if (!inSetRoot) {
    return Object.freeze({
      root,
      selection: brand(written),
      session: sessionOf(written),
      inSetRoot,
    });
  }
  const member = root === previous.root ? memberOf(previous.selection) : null;
  const selection = SelectionApi.isNode(written)
    ? keepNodeMember(written, member)
    : settleText(site, root, written, member, law);

  return Object.freeze({
    root,
    selection,
    session: sessionOf(selection),
    inSetRoot,
  });
};

/**
 * The caret an editor starts with, before its schema exists. Installing the
 * schema settles it again through `initializeEditorSchemaSelection`.
 */
export const bootstrapCaret = (
  root: string,
  selection: Selection
): SettledCaret =>
  Object.freeze({
    root,
    selection: selection ? brand(selection) : null,
    session: 0,
    inSetRoot: false,
  });

export const carryCaret = (
  site: SetSite,
  previous: SettledCaret,
  write: Readonly<{ root: string; selection: Selection }>
) => settleCaret(site, previous, write, 'carry');

/**
 * Lands a selection whose place a change removed. The session moves, because
 * the selection is not where its edit session started.
 */
export const landCaret = (
  site: SetSite,
  previous: SettledCaret,
  write: Readonly<{ root: string; selection: Selection }>
): SettledCaret => {
  const landed = settleCaret(
    site,
    { ...previous, selection: null },
    write,
    'carry'
  );

  return Object.freeze({ ...landed, session: previous.session + 1 });
};

export const holderSelection = (root: string, path: Path): NodeSelection =>
  SelectionApi.nodes([path], {
    mode: 'block',
    ...(root === MAIN_ROOT_KEY ? {} : { root }),
  });

/**
 * For display and shown snapshots: a range with no previous selection, kept
 * in its anchor's member.
 */
export const settleRange = (
  site: SetSite,
  range: Range,
  root: string
): SettledRange | null => {
  const anchorSlot = range.anchor.path[0];

  if (anchorSlot === range.focus.path[0] || !isSetRoot(site, root)) {
    return range as SettledRange;
  }
  const kept = clampToMember(site, root, range, anchorSlot ?? 0);

  return SelectionApi.isNode(kept)
    ? null
    : ({ anchor: kept.anchor, focus: kept.focus } as SettledRange);
};

export const settleShown = (
  site: SetSite,
  root: string,
  selection: Selection
): SettledSelection =>
  settleCaret(site, NO_CARET, { root, selection }, 'place').selection;

export const crossesMembers = (site: SetSite, range: Range, root: string) =>
  range.anchor.path[0] !== range.focus.path[0] && isSetRoot(site, root);

export const refuseCrossing = (site: SetSite, range: Range, root: string) => {
  if (!crossesMembers(site, range, root)) return;

  throw new EditorRefusalError(
    { reason: 'crosses-set-members', root },
    `A range removal cannot cross two members of the set root "${root}".`
  );
};

export const sealsText = (
  site: SetSite,
  target: Readonly<{ root: string; selection: Selection }>
): boolean => {
  const { root, selection } = target;

  if (!SelectionApi.isNode(selection)) return false;
  if (
    selection.paths.every((path) => path.length === 1) &&
    isSetRoot(site, root)
  ) {
    return true;
  }
  if (site.schema.declaresSetRoots()) {
    const document = valueRootIndex(site.value(), root);

    return selection.paths.some((path) => {
      const type = document.node(path)?.type;

      return typeof type === 'string' && site.schema.holdsSetRoot(type);
    });
  }

  return false;
};

export const storedCaret = (caret: SettledCaret): SettledCaret => {
  const selection = cloneEditorJsonValue(caret.selection);
  const { root, session, inSetRoot } = caret;

  if (!selection) {
    return Object.freeze({ root, selection: null, session, inSetRoot });
  }
  if (SelectionApi.isNode(selection)) {
    return Object.freeze({
      root,
      session,
      inSetRoot,
      selection: brand(
        SelectionApi.nodes(selection.paths, {
          anchorPath: selection.anchorPath,
          focusPath: selection.focusPath,
          mode: selection.mode,
          ...(root === MAIN_ROOT_KEY ? {} : { root }),
        })
      ),
    });
  }
  if (!RangeApi.isRange(selection)) {
    return Object.freeze({ root, selection, session, inSetRoot });
  }
  const rooted = <TPoint extends { root?: string }>(point: TPoint) => {
    const { root: _root, ...rest } = point;

    return root === MAIN_ROOT_KEY ? rest : { ...rest, root };
  };

  return Object.freeze({
    root,
    session,
    inSetRoot,
    selection: brand({
      ...selection,
      anchor: rooted(selection.anchor),
      focus: rooted(selection.focus),
    }),
  });
};
