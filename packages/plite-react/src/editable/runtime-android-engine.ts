import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { useAndroidInputManager } from '../hooks/android-input-manager/use-android-input-manager';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import type { RuntimeSelectionChangeHandler } from './runtime-selection-engine';

export const usePublishedAndroidInputManager = ({
  inputManager,
  runtime,
}: {
  inputManager: AndroidInputManager | null;
  runtime: EditableDOMRuntime;
}) => {
  useIsomorphicLayoutEffect(() => {
    runtime.publishAndroidInputManager(inputManager);

    return () => {
      runtime.clearAndroidInputManager(inputManager);
    };
  }, [inputManager, runtime]);
};

export const useRuntimeAndroidEngine = ({
  onDOMSelectionChange,
  runtime,
  scheduleOnDOMSelectionChange,
}: {
  onDOMSelectionChange: RuntimeSelectionChangeHandler;
  runtime: EditableDOMRuntime;
  scheduleOnDOMSelectionChange: RuntimeSelectionChangeHandler;
}) => {
  const inputManager = useAndroidInputManager(
    {
      inputController: runtime.inputController,
      onDOMSelectionChange,
      receivedUserInput: runtime.receivedUserInput,
      scheduleTask: runtime.domPhaseScheduler.schedule,
      scheduleOnDOMSelectionChange,
    },
    runtime
  );

  usePublishedAndroidInputManager({ inputManager, runtime });
};
