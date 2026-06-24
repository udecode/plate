import type { RefObject } from 'react';
import { isTrackedMutation } from '@platejs/plite-dom';
import type { ReactRuntimeEditor } from '../../plugin/react-editor';

export type RestoreDOMManager = {
  registerMutations: (mutations: MutationRecord[]) => void;
  restoreDOM: () => void;
  clear: () => void;
};

export const createRestoreDomManager = (
  editor: ReactRuntimeEditor,
  receivedUserInput: RefObject<boolean>
): RestoreDOMManager => {
  let bufferedMutations: MutationRecord[] = [];

  const clear = () => {
    bufferedMutations = [];
  };

  const registerMutations = (mutations: MutationRecord[]) => {
    const trackedMutations = mutations.filter((mutation) =>
      isTrackedMutation(editor, mutation, mutations)
    );

    if (trackedMutations.length === 0) {
      return;
    }

    if (!receivedUserInput.current) {
      return;
    }

    bufferedMutations.push(...trackedMutations);
  };

  function restoreDOM() {
    if (bufferedMutations.length > 0) {
      bufferedMutations.reverse().forEach((mutation) => {
        if (mutation.type === 'characterData') {
          // We don't want to restore the DOM for characterData mutations
          // because this interrupts the composition.
          return;
        }

        mutation.removedNodes.forEach((node) => {
          if (node.parentNode === mutation.target) {
            return;
          }

          mutation.target.insertBefore(
            node,
            mutation.nextSibling?.parentNode === mutation.target
              ? mutation.nextSibling
              : null
          );
        });

        mutation.addedNodes.forEach((node) => {
          if (node.parentNode === mutation.target) {
            mutation.target.removeChild(node);
          }
        });
      });

      // Clear buffered mutations to ensure we don't undo them twice
      clear();
    }
  }

  return {
    registerMutations,
    restoreDOM,
    clear,
  };
};
