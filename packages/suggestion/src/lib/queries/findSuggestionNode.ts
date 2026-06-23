import { type Path, TextApi } from '@platejs/slate';
import { type SlateEditor, type TSuggestionText, KEYS } from 'platejs';

type SuggestionNodeOptions<E extends SlateEditor> = NonNullable<
  Parameters<E['api']['nodes']>[0]
>;

const toArray = <T>(value: T | T[]) => (Array.isArray(value) ? value : [value]);

const matchesPredicateObject = (
  node: unknown,
  predicate: Record<string, unknown>
) =>
  Object.entries(predicate).every(([key, value]) =>
    toArray(value).includes((node as Record<string, unknown>)[key])
  );

const matchesSuggestionOptions = <E extends SlateEditor>(
  editor: E,
  node: unknown,
  path: Path,
  options: SuggestionNodeOptions<E>
) => {
  const { block, empty, id, match, text } = options;

  if (text !== undefined && TextApi.isText(node) !== text) return false;

  if (empty !== undefined) {
    const isEmpty = TextApi.isText(node)
      ? node.text.length === 0
      : editor.api.isEmpty(node as Parameters<E['api']['isEmpty']>[0]);

    if (isEmpty !== empty) return false;
  }

  if (
    block !== undefined &&
    editor.api.isBlock(node as Parameters<E['api']['isBlock']>[0]) !== block
  ) {
    return false;
  }

  if (id !== undefined) {
    const nodeId = (node as Record<string, unknown>).id;

    if (!((id === true && Boolean(nodeId)) || nodeId === id)) return false;
  }

  if (typeof match === 'function') {
    return (match as (node: unknown, path: Path) => boolean)(node, path);
  }
  if (match && typeof match === 'object') {
    return matchesPredicateObject(node, match as Record<string, unknown>);
  }

  return true;
};

export const findInlineSuggestionNode = <E extends SlateEditor>(
  editor: E,
  options: SuggestionNodeOptions<E> = {}
) =>
  editor.api.node<TSuggestionText>({
    ...options,
    match: (node, path) =>
      TextApi.isText(node) &&
      Boolean((node as Record<string, unknown>)[KEYS.suggestion]) &&
      matchesSuggestionOptions(editor, node, path, options),
  });
