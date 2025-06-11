import {
  type SlateEditor,
  type TTagElement,
  type TTagProps,
  KEYS,
} from 'platejs';

/**
 * Compares two sets of tags/labels for equality, ignoring order
 *
 * @param currentTags Current set of tags in the editor
 * @param newTags New set of tags to compare against
 * @returns Boolean indicating if the sets contain the same values
 */
export function isEqualTags<T extends TTagProps>(
  editor: SlateEditor,
  newTags?: T[]
): boolean {
  const currentTags = [
    ...editor.api.nodes<TTagElement>({
      at: [],
      match: { type: KEYS.tag },
    }),
  ].map(([node]) => node);

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
