import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  EditorEffect,
} from '../interfaces/editor';
import { getPluginRegistry } from './plugin-registry';
import { readElementPropertyWrites } from './public-state';
import { defineUpdateAnnotation } from './transaction-values';

/**
 * Annotate an update so history skips recording it when the entire commit
 * writes only element properties whose keys appear in the annotated list
 * (with no roots created/deleted, no records, no persisted state, no effects,
 * and no anchor recovery). Composite updates that also edit content still
 * record normally.
 *
 * @internal
 */
export const skipHistoryIfOnlyProperties = defineUpdateAnnotation<
  readonly string[]
>({
  combine: (previous, next) => [...new Set([...previous, ...next])],
  key: 'history.skip-if-only-properties',
});

/** @internal */
export const shouldSkipHistoryForOnlyProperties = (
  editor: Editor,
  before: EditorDocumentValue,
  commit: EditorCommit,
  effects: readonly EditorEffect[],
  hasRecovery = false
): boolean => {
  const keys = commit.annotations[skipHistoryIfOnlyProperties.key] as
    | readonly string[]
    | undefined;

  if (!keys || keys.length === 0 || effects.length > 0 || hasRecovery) {
    return false;
  }

  const writes = readElementPropertyWrites(editor, { before, commit });

  if (!writes || writes.length === 0) return false;

  const allowed = new Set(keys);
  const fields = getPluginRegistry(editor).stateFieldIdentities;

  if (
    commit.dirtyStateKeys.some((key) => {
      const field = fields.get(key);

      return field ? Boolean(field.persist) : true;
    })
  ) {
    return false;
  }

  return writes.every(({ modifications }) =>
    modifications.every((modification) => allowed.has(modification.key))
  );
};
