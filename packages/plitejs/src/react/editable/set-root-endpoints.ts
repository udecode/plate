import { type Path, PathApi, type Point, type RootKey } from '../..';
import { getSetSite } from '../../core/public-state';
import type { AnyEditor } from '../../interfaces/editor';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  type ContentRootOwner,
  findContentRootOwners,
  getContentRootViewBoundaryPoint,
} from './content-root-owners';
import { getEditorRuntimeOwner } from './runtime-editor-api';

type ViewEndpoint = {
  affinity?: 'backward' | 'forward';
  owner?: ContentRootOwner | null;
  point: Point;
  root: RootKey;
};

const edgeEndpoint = <T extends ViewEndpoint>(
  editor: AnyEditor,
  focus: T,
  target: Readonly<{
    owner: ContentRootOwner | null | undefined;
    path: Path;
    root: RootKey;
  }>,
  edge: 'end' | 'start'
): T => {
  const boundary = getContentRootViewBoundaryPoint(
    editor,
    {
      ...(target.owner ? { owner: target.owner } : {}),
      path: target.path,
      root: target.root,
    },
    edge
  );

  if (!boundary) return focus;
  const { owner: _owner, ...rest } = focus;

  return {
    ...rest,
    affinity: boundary.affinity,
    ...(target.owner ? { owner: target.owner } : {}),
    point: boundary.point,
    root: target.root,
  } as T;
};

export const isSetRootOf = (editor: AnyEditor, root: RootKey) => {
  if (root === MAIN_ROOT_KEY) return false;
  const site = getSetSite(getEditorRuntimeOwner(editor));

  return site.schema.isSetRoot(root, site);
};

/**
 * Keeps a dragged or imported focus inside the anchor's member of a set root.
 * A focus outside that member goes to the member's edge on the side it left.
 * A focus in a set root whose anchor sits outside it goes to the edge of the
 * block that holds the set, so the range selects over that block.
 */
export const settleViewFocus = <T extends ViewEndpoint>(
  editor: AnyEditor,
  anchor: ViewEndpoint,
  focus: T
): T => {
  const site = getSetSite(getEditorRuntimeOwner(editor));

  if (!site.schema.declaresSetRoots()) return focus;
  const value = site.value();
  const isSet = (root: RootKey) => site.schema.isSetRoot(root, site);

  if (isSet(anchor.root)) {
    const slot = anchor.point.path[0];

    if (slot === undefined) return focus;
    if (focus.root === anchor.root && focus.point.path[0] === slot) {
      return focus;
    }
    const holder =
      focus.root === anchor.root
        ? null
        : site.schema.findRootOwner(anchor.root, value);
    const after =
      focus.root === anchor.root
        ? (focus.point.path[0] ?? slot) > slot
        : !holder ||
          holder.root !== focus.root ||
          PathApi.compare(focus.point.path, holder.path) > 0;

    return edgeEndpoint(
      editor,
      focus,
      { owner: anchor.owner, path: [slot], root: anchor.root },
      after ? 'end' : 'start'
    );
  }
  if (focus.root === anchor.root || !isSet(focus.root)) return focus;
  let holder = site.schema.findRootOwner(focus.root, value);

  while (holder && holder.root !== anchor.root && isSet(holder.root)) {
    holder = site.schema.findRootOwner(holder.root, value);
  }
  if (!holder) return focus;
  const holderRoot = holder.root;
  const owner =
    holderRoot === anchor.root
      ? anchor.owner
      : holderRoot === MAIN_ROOT_KEY
        ? null
        : (findContentRootOwners(editor).find(
            (candidate) => candidate.childRoot === holderRoot
          ) ?? null);
  const after =
    holder.root !== anchor.root ||
    PathApi.compare(holder.path, anchor.point.path) > 0;

  return edgeEndpoint(
    editor,
    focus,
    { owner, path: holder.path, root: holder.root },
    after ? 'end' : 'start'
  );
};
