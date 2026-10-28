import { useLayoutEffect } from 'react';

import { subscribeEditorDOMScope } from '../../dom/plugin/dom-editor';
import {
  type DOMRootRuntime,
  findDOMRootRuntime,
} from '../../dom/plugin/dom-root-runtime';

/**
 * Runs `read` in a DOM read phase after mount, after each DOM scope change and
 * after each DOM change the root's integrity observer reports, then runs the
 * write it returns in the same flush, before paint.
 */
export const useEditableLayoutPass = (
  editor: object,
  root: HTMLElement | null,
  label: string,
  read: (root: HTMLElement) => (() => void) | null
) => {
  useLayoutEffect(() => {
    if (!root) return undefined;

    let cancelRead: (() => void) | null = null;
    let runtime: DOMRootRuntime | null = null;
    let stopLayout: (() => void) | null = null;

    const schedule = () => {
      const current = runtime;

      if (!current || cancelRead) return;

      cancelRead = current.domPhaseScheduler.schedule(
        'dom-read',
        label,
        () => {
          cancelRead = null;
          const write = read(root);

          if (write) {
            current.domPhaseScheduler.schedule('dom-write', label, write, {
              timing: 'immediate',
            });
          }
        },
        { timing: 'microtask' }
      );
    };
    const bind = () => {
      const next = findDOMRootRuntime(root);

      if (next === runtime) return;

      cancelRead?.();
      cancelRead = null;
      stopLayout?.();
      runtime = next;
      stopLayout = next?.subscribeLayout(schedule) ?? null;
    };
    const stopBinding = subscribeEditorDOMScope(editor, () => {
      bind();
      schedule();
    });

    bind();
    schedule();

    return () => {
      stopBinding();
      stopLayout?.();
      cancelRead?.();
    };
  }, [editor, label, read, root]);
};
