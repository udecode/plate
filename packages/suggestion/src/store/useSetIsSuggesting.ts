import { PlateEditor, usePlateEditorRef, Value } from '@udecode/plate-common';
import { SuggestionEditorProps } from '../types';
import { useSuggestionActions } from './SuggestionProvider';

export const useSetIsSuggesting = () => {
  const editor = usePlateEditorRef<
    Value,
    PlateEditor & SuggestionEditorProps
  >();
  const setIsSuggesting = useSuggestionActions().isSuggesting();

  return (value: boolean) => {
    setIsSuggesting(value);
    editor.isSuggesting = value;
  };
};
