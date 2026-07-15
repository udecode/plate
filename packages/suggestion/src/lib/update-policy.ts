import type { EditorUpdatePolicy } from '@platejs/plite';

/** Tag applied when an update must bypass suggestion tracking. */
export const SUGGESTION_SKIP_TAG = 'skip-suggestion' as const;

const SUGGESTION_SKIP_TAGS = Object.freeze([SUGGESTION_SKIP_TAG] as const);

/** Semantic update policies owned by the Suggestion plugin. */
export const SuggestionUpdatePolicy = Object.freeze({
  skip: Object.freeze({
    tags: SUGGESTION_SKIP_TAGS,
  }) satisfies EditorUpdatePolicy,
});
