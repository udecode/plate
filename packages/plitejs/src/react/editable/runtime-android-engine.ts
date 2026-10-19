import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { useAndroidInputManager } from '../hooks/android-input-manager/use-android-input-manager';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { useRebuildLine } from '../hooks/use-plite-node-ref';
import { setAndroidCompositionLineRebuild } from './android-composition';
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
  const rebuildLine = useRebuildLine(runtime.editor);
  const inputManager = useAndroidInputManager(
    {
      inputController: runtime.inputController,
      onDOMSelectionChange,
      rebuildLine,
      receivedUserInput: runtime.receivedUserInput,
      scheduleTask: runtime.domPhaseScheduler.schedule,
      scheduleOnDOMSelectionChange,
    },
    runtime
  );

  usePublishedAndroidInputManager({ inputManager, runtime });

  useIsomorphicLayoutEffect(() => {
    setAndroidCompositionLineRebuild(
      runtime.inputController,
      rebuildLine,
      (callback) => runtime.runOwnedDOMMutation('composition', callback)
    );

    return () => {
      // Layout cleanup runs while the line is still in the document.
      try {
        runtime.finishAndroidComposition('teardown');
      } finally {
        setAndroidCompositionLineRebuild(runtime.inputController, null);
      }
    };
  }, [rebuildLine, runtime]);
};
