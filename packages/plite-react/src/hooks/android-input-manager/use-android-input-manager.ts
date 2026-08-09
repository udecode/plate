import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { EDITOR_TO_SCHEDULE_FLUSH } from '@platejs/plite-dom/internal';
import type { EditableDOMRuntime } from '../../editable/editable-dom-runtime';
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
  }: UseAndroidInputManagerOptions,
  enabled = true
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
    if (!enabled) return;

    EDITOR_TO_SCHEDULE_FLUSH.set(editor, inputManager.scheduleFlush);

    return () => {
      inputManager.prepareDOMTeardown();
      if (EDITOR_TO_SCHEDULE_FLUSH.get(editor) === inputManager.scheduleFlush) {
        EDITOR_TO_SCHEDULE_FLUSH.delete(editor);
      }
    };
  }, [editor, enabled, inputManager]);

  useEffect(() => {
    if (enabled) inputManager.flush();
  }, [enabled, inputManager]);

  return enabled ? inputManager : null;
};

export const useAndroidInputManager = (
  options: UseAndroidInputManagerOptions,
  runtime: EditableDOMRuntime
) => {
  const editor = useEditor();
  const enabled = useSyncExternalStore(
    runtime.subscribeHostFacts,
    () => runtime.isAndroidHost,
    () => false
  );

  return useAndroidInputManagerForEditor(editor, options, enabled);
};
