import type {
  EditorUpdatePolicy,
  EditorUpdateTag,
  EditorUpdateTagInput,
} from '..';

export const PLITE_REACT_PRESERVE_SELECTION_TAGS = Object.freeze([
  'skip-dom-selection',
  'skip-selection-focus',
  'skip-scroll-into-view',
] as const);

/** Selection-effect policies owned by the Plite React runtime. */
export const PliteReactUpdatePolicy = Object.freeze({
  preserveSelection: Object.freeze({
    tags: PLITE_REACT_PRESERVE_SELECTION_TAGS,
  }),
});

const toTags = (tags: EditorUpdateTagInput | undefined) =>
  tags === undefined ? [] : typeof tags === 'string' ? [tags] : [...tags];

export const withPliteReactPreservedSelection = <
  TPolicy extends EditorUpdatePolicy,
>(
  policy: TPolicy
): TPolicy & Readonly<{ tags: EditorUpdateTag[] }> => ({
  ...policy,
  tags: [...toTags(policy.tags), ...PLITE_REACT_PRESERVE_SELECTION_TAGS],
});
