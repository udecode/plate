import { type RefObject, useEffect, useState } from 'react';
import { IS_ANDROID } from '@platejs/slate-dom';
import { EDITOR_TO_SCHEDULE_FLUSH } from '@platejs/slate-dom/internal';
import type { ReactRuntimeEditor } from '../../plugin/react-editor';
import { useEditor } from '../use-editor';
import { useMutationObserver } from '../use-mutation-observer';
import {
  type CreateAndroidInputManagerOptions,
  createAndroidInputManager,
} from './android-input-manager';

type UseAndroidInputManagerOptions = {
  node: RefObject<HTMLElement | null>;
} & Omit<CreateAndroidInputManagerOptions, 'editor'>;

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
};

export const useAndroidInputManager = IS_ANDROID
  ? ({ node, ...options }: UseAndroidInputManagerOptions) => {
      if (!IS_ANDROID) {
        return null;
      }

      const editor = useEditor<ReactRuntimeEditor>();

      const [inputManager] = useState(() =>
        createAndroidInputManager({
          editor,
          ...options,
        })
      );

      useMutationObserver(
        node,
        inputManager.handleDomMutations,
        MUTATION_OBSERVER_CONFIG
      );

      EDITOR_TO_SCHEDULE_FLUSH.set(editor, inputManager.scheduleFlush);

      useEffect(() => {
        inputManager.flush();
      });

      return inputManager;
    }
  : () => null;
