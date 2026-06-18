import { useCallback } from 'react';
import type { Editor } from '@platejs/slate';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  type EditableCompositionStateSetter,
  setEditableComposingState,
} from './input-controller';
import type { EditableInputController } from './input-state';

export const useRuntimeCompositionEngine = ({
  editor,
  inputController,
  setIsComposing,
}: {
  editor: Editor | ReactRuntimeEditor;
  inputController: EditableInputController;
  setIsComposing: EditableCompositionStateSetter;
}) =>
  useCallback(
    (nextValue: boolean) => {
      setEditableComposingState({
        editor,
        inputController,
        nextValue,
        setIsComposing,
      });
    },
    [editor, inputController, setIsComposing]
  );
