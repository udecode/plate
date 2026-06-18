import { getEditorOperationRoot } from '../core/public-state';
import type { EditorStaticApi } from '../interfaces/editor';
import type { Range } from '../interfaces/range';
import type { RangeRef } from '../interfaces/range-ref';
import {
  clearRangeRefDraftCurrent,
  getRangeRefDraftCurrent,
  getRangeRefVisibility,
  getRangeRoot,
  hasRangeRefDraftCurrent,
  setRangeRefDraftCurrent,
  setRangeRefRootMeta,
  setRangeRefVisibility,
} from '../internal/root-location';
import { ALL_RANGE_REFS, RANGE_REFS } from '../utils/weak-maps';

const cloneRange = (range: Range | null) =>
  range
    ? {
        anchor: {
          path: [...range.anchor.path],
          offset: range.anchor.offset,
          ...(range.anchor.root === undefined
            ? null
            : { root: range.anchor.root }),
        },
        focus: {
          path: [...range.focus.path],
          offset: range.focus.offset,
          ...(range.focus.root === undefined
            ? null
            : { root: range.focus.root }),
        },
      }
    : null;

const getAllRangeRefs = (
  editor: Parameters<EditorStaticApi['rangeRef']>[0]
) => {
  let refs = ALL_RANGE_REFS.get(editor);

  if (!refs) {
    refs = new Set();
    ALL_RANGE_REFS.set(editor, refs);
  }

  return refs;
};

const getPublicRangeRefs = (
  editor: Parameters<EditorStaticApi['rangeRef']>[0]
) => {
  let refs = RANGE_REFS.get(editor);

  if (!refs) {
    refs = new Set();
    RANGE_REFS.set(editor, refs);
  }

  return refs;
};

const createRangeRef = (
  editor: Parameters<EditorStaticApi['rangeRef']>[0],
  range: Range,
  options: {
    affinity?: RangeRef['affinity'];
    visibility?: 'public' | 'internal';
  } = {}
) => {
  const { affinity = 'inward', visibility = 'public' } = options;
  const rootMeta = getRangeRoot(range, getEditorOperationRoot(editor));
  const ref: RangeRef = {
    current: cloneRange(range),
    affinity,
    unref() {
      const current = cloneRange(
        hasRangeRefDraftCurrent(ref)
          ? (getRangeRefDraftCurrent(ref) ?? null)
          : ref.current
      );

      getAllRangeRefs(editor).delete(ref);

      if (getRangeRefVisibility(ref) === 'public') {
        getPublicRangeRefs(editor).delete(ref);
      }

      setRangeRefDraftCurrent(ref, null);
      ref.current = null;

      return current;
    },
  };

  setRangeRefRootMeta(ref, rootMeta);
  setRangeRefVisibility(ref, visibility);

  getAllRangeRefs(editor).add(ref);

  if (visibility === 'public') {
    getPublicRangeRefs(editor).add(ref);
  }

  return ref;
};

export const createInternalRangeRef = (
  editor: Parameters<EditorStaticApi['rangeRef']>[0],
  range: Range,
  options: { affinity?: RangeRef['affinity'] } = {}
) => createRangeRef(editor, range, { ...options, visibility: 'internal' });

export const rangeRef: EditorStaticApi['rangeRef'] = (
  editor,
  range,
  options = {}
) => createRangeRef(editor, range, { ...options, visibility: 'public' });

export const allRangeRefs = (
  editor: Parameters<EditorStaticApi['rangeRef']>[0]
) => getAllRangeRefs(editor);

export const publishRangeRefDrafts = (
  editor: Parameters<EditorStaticApi['rangeRef']>[0]
) => {
  for (const ref of getAllRangeRefs(editor)) {
    if (getRangeRefVisibility(ref) !== 'public') {
      continue;
    }

    if (hasRangeRefDraftCurrent(ref)) {
      ref.current = cloneRange(getRangeRefDraftCurrent(ref) ?? null);
      clearRangeRefDraftCurrent(ref);
    }

    if (ref.current == null) {
      getAllRangeRefs(editor).delete(ref);
      getPublicRangeRefs(editor).delete(ref);
    }
  }
};

export const resetRangeRefDrafts = (
  editor: Parameters<EditorStaticApi['rangeRef']>[0]
) => {
  for (const ref of getAllRangeRefs(editor)) {
    if (getRangeRefVisibility(ref) !== 'public') {
      continue;
    }

    clearRangeRefDraftCurrent(ref);
  }
};
