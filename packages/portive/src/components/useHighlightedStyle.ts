import { useFocused, useSelected } from 'slate-react';

export function useHighlightedStyle() {
  const selected = useSelected();
  const focused = useFocused();
  const highlighted = selected && focused;
  const boxShadow = highlighted ? '0 0 0 3px DodgerBlue' : 'none';
  return { boxShadow };
}
