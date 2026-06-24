import type { RefObject } from 'react';
import { useAndroidInputManager } from '../hooks/android-input-manager/use-android-input-manager';
import type { EditableInputController } from './input-state';
import type { RuntimeSelectionChangeHandler } from './runtime-selection-engine';

export const useRuntimeAndroidEngine = ({
  inputController,
  node,
  onDOMSelectionChange,
  receivedUserInput,
  scheduleOnDOMSelectionChange,
}: {
  inputController: EditableInputController;
  node: RefObject<HTMLElement | null>;
  onDOMSelectionChange: RuntimeSelectionChangeHandler;
  receivedUserInput: RefObject<boolean>;
  scheduleOnDOMSelectionChange: RuntimeSelectionChangeHandler;
}) =>
  useAndroidInputManager({
    inputController,
    node,
    onDOMSelectionChange,
    receivedUserInput,
    scheduleOnDOMSelectionChange,
  });
