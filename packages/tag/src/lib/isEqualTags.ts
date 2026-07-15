import type { BaseEditor } from '@platejs/core';
import type { TTagElement, TTagProps } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

/**
 * Compares two sets of tags/labels for equality, ignoring order
 *
 * @param currentTags Current set of tags in the editor
 * @param newTags New set of tags to compare against
 * @returns Boolean indicating if the sets contain the same values
 */
export function isEqualTags<T extends TTagProps>(
  editor: BaseEditor<any, any>,
  newTags?: T[]
): boolean {
  const currentTags = Array.from(
    editor.read.nodes.entries<TTagElement>({
      at: [],
      match: { type: KEYS.tag },
    })
  ).map(([node]) => node);

  const current = currentTags.reduce(
    (acc, tag) => {
      acc[tag.value] = true;

      return acc;
    },
    {} as Record<string, boolean>
  );

  const next = (newTags ?? []).reduce(
    (acc, tag) => {
      acc[tag.value] = true;

      return acc;
    },
    {} as Record<string, boolean>
  );

  return (
    Object.keys(current).length === Object.keys(next).length &&
    Object.keys(current).every((key) => next[key])
  );
}
