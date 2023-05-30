import {
  findNodePath,
  getBlockAbove,
  getSuggestionId,
  getSuggestionUserId,
  MARK_SUGGESTION,
  PlateRenderLeafProps,
  TSuggestionText,
  useSuggestionSelectors,
  useSuggestionUserById,
  Value,
} from '@udecode/plate';

export const useSuggestionLeafState = ({
  text,
  editor,
}: Pick<PlateRenderLeafProps<Value, TSuggestionText>, 'editor' | 'text'>) => {
  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();
  const userId = getSuggestionUserId(text);
  const user = useSuggestionUserById(userId);
  const isActive = activeSuggestionId === getSuggestionId(text);
  const isDeletion = Boolean(text.suggestionDeletion);

  const hue = user?.hue ?? 0;

  const suggestionBlockAbove = getBlockAbove(editor, {
    at: findNodePath(editor, text),
    match: (n) => n[MARK_SUGGESTION],
  });

  return {
    isDeletion,
    isActive,
    suggestionBlockAbove,
    hue,
  };
};
