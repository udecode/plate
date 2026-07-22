import { useEffect, useMemo } from 'react';
import { IS_ANDROID } from '@platejs/plite-dom';
import { EDITOR_TO_SCHEDULE_FLUSH } from '@platejs/plite-dom/internal';
import type { ReactRuntimeEditor } from '../../plugin/react-editor';
import { useEditor } from '../use-editor';
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect';
import {
  type CreateAndroidInputManagerOptions,
  createAndroidInputManager,
} from './android-input-manager';

type UseAndroidInputManagerOptions = Omit<
  CreateAndroidInputManagerOptions,
  'editor'
>;

export const useAndroidInputManagerForEditor = (
  editor: ReactRuntimeEditor,
  {
    inputController,
    onDOMSelectionChange,
    receivedUserInput,
    scheduleOnDOMSelectionChange,
    scheduleTask,
  }: UseAndroidInputManagerOptions
) => {
  const inputManager = useMemo(
    () =>
      createAndroidInputManager({
        editor,
        inputController,
        onDOMSelectionChange,
        receivedUserInput,
        scheduleOnDOMSelectionChange,
        scheduleTask,
      }),
    [
      editor,
      inputController,
      onDOMSelectionChange,
      receivedUserInput,
      scheduleOnDOMSelectionChange,
      scheduleTask,
    ]
  );

  useIsomorphicLayoutEffect(() => {
    EDITOR_TO_SCHEDULE_FLUSH.set(editor, inputManager.scheduleFlush);

    return () => {
      inputManager.prepareDOMTeardown();
      if (EDITOR_TO_SCHEDULE_FLUSH.get(editor) === inputManager.scheduleFlush) {
        EDITOR_TO_SCHEDULE_FLUSH.delete(editor);
      }
    };
  }, [editor, inputManager]);

  useEffect(() => {
    inputManager.flush();
  });

  return inputManager;
};

export const useAndroidInputManager = IS_ANDROID
  ? (options: UseAndroidInputManagerOptions) => {
      if (!IS_ANDROID) {
        return null;
      }

      const editor = useEditor<ReactRuntimeEditor>();

      return useAndroidInputManagerForEditor(editor, options);
    }
  : () => null;
