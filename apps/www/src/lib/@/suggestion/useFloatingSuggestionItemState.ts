import {
  TSuggestionDescription,
  useCurrentSuggestionUser,
  usePlateEditorRef,
  useSuggestionSelectors,
} from '@udecode/plate';

export const useFloatingSuggestionItemState = ({
  description,
}: {
  description: TSuggestionDescription;
}) => {
  const editor = usePlateEditorRef();
  const currentUser = useCurrentSuggestionUser();
  const suggestions = useSuggestionSelectors().suggestions();
  const users = useSuggestionSelectors().users();

  const suggestion = suggestions[description?.suggestionId];
  const user = users[description?.userId];

  return {
    editor,
    suggestion,
    user,
    currentUser,
  };
};
