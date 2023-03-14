import { useEffect } from 'react';
import {
  findNode,
  isText,
  PlateEditor,
  usePlateSelectors,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { useSetActiveSuggestionId } from './store/useSetActiveSuggestionId';
import { getSuggestionId } from './utils/getSuggestionId';
import { MARK_SUGGESTION } from './constants';
import { SuggestionPlugin } from './types';

export const useHooksSuggestion = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: WithPlatePlugin<SuggestionPlugin>
) => {
  const key = usePlateSelectors().keyEditor();
  const setActiveSuggestionId = useSetActiveSuggestionId();

  useEffect(() => {
    const resetActiveSuggestion = () => {
      setActiveSuggestionId(null);
    };

    const suggestionEntry = findNode(editor, {
      match: (n) => isText(n) && n[MARK_SUGGESTION],
    });
    if (!suggestionEntry) return resetActiveSuggestion();

    const [suggestionNode] = suggestionEntry;

    const id = getSuggestionId(suggestionNode);
    if (!id) return resetActiveSuggestion();

    setActiveSuggestionId(id);
  }, [editor, key, setActiveSuggestionId]);
};
