import type {
  EditorUpdatePolicy,
  EditorUpdateTag,
  EditorUpdateTagInput,
} from '../interfaces/editor';

const HISTORY_TAGS = [
  'history-push',
  'history-merge',
  'history-skip',
] as const satisfies readonly EditorUpdateTag[];

const HISTORY_TAG_SET = new Set<EditorUpdateTag>(HISTORY_TAGS);

const historyPolicyTags = {
  merge: 'history-merge',
  'new-batch': 'history-push',
  skip: 'history-skip',
} as const satisfies Record<
  NonNullable<EditorUpdatePolicy['history']>,
  EditorUpdateTag
>;

export type CompiledEditorUpdatePolicy = Readonly<{
  tags: readonly EditorUpdateTag[];
}>;

export type InternalEditorUpdateOptions = {
  skipNormalize?: boolean;
  tags?: readonly EditorUpdateTag[];
};

export const normalizeUpdateTags = (
  tags?: EditorUpdateTagInput
): EditorUpdateTag[] =>
  tags ? (typeof tags === 'string' ? [tags] : [...tags]) : [];

export const applyEditorUpdateTag = (
  tags: Set<EditorUpdateTag>,
  tag: EditorUpdateTag
) => {
  if (HISTORY_TAG_SET.has(tag)) {
    for (const historyTag of HISTORY_TAGS) {
      tags.delete(historyTag);
    }
  }

  tags.add(tag);
};

export const applyEditorUpdateTags = (
  target: Set<EditorUpdateTag>,
  tags: readonly EditorUpdateTag[]
) => {
  for (const tag of tags) {
    applyEditorUpdateTag(target, tag);
  }
};

export const reduceEditorUpdateTags = (
  tags: readonly EditorUpdateTag[]
): readonly EditorUpdateTag[] => {
  const reduced = new Set<EditorUpdateTag>();
  applyEditorUpdateTags(reduced, tags);

  return Object.freeze([...reduced]);
};

export const compileEditorUpdatePolicy = (
  policy: EditorUpdatePolicy = {}
): CompiledEditorUpdatePolicy => {
  const tags = normalizeUpdateTags(policy.tags);

  if (policy.history) {
    const historyTag = historyPolicyTags[policy.history];

    if (!historyTag) {
      throw new Error(`Unknown editor update history mode: ${policy.history}`);
    }

    tags.push(historyTag);
  }

  return Object.freeze({ tags: reduceEditorUpdateTags(tags) });
};

export const EMPTY_EDITOR_UPDATE_POLICY = compileEditorUpdatePolicy();
