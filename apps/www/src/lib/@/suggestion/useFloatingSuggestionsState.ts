import { useEffect, useState } from 'react';
import {
  getSuggestionNodeEntries,
  toDOMNode,
  useHotkeys,
  usePlateEditorState,
  useSuggestionSelectors,
} from '@udecode/plate';

export const useFloatingSuggestionsState = () => {
  const editor = usePlateEditorState();
  const activeSuggestionId = useSuggestionSelectors().activeSuggestionId();

  const [isOpen, setIsOpen] = useState(activeSuggestionId !== null);

  useEffect(() => setIsOpen(activeSuggestionId !== null), [activeSuggestionId]);

  useHotkeys(
    'escape',
    () => setIsOpen(false),
    {
      enabled: isOpen,
      enableOnFormTags: true,
      enableOnContentEditable: true,
      preventDefault: true,
    },
    []
  );

  return {
    isOpen,
    getBoundingClientRect: () => {
      const suggestionRects = Array.from(
        getSuggestionNodeEntries(editor, activeSuggestionId!)
      ).map(([node]) => toDOMNode(editor, node)!.getBoundingClientRect());

      const top = Math.min(...suggestionRects.map((r) => r.top));
      const bottom = Math.max(...suggestionRects.map((r) => r.bottom));
      const left = Math.min(...suggestionRects.map((r) => r.left));
      const right = Math.max(...suggestionRects.map((r) => r.right));

      const width = right - left;
      const height = bottom - top;

      return { top, bottom, left, right, width, height } as DOMRect;
    },
  };
};
