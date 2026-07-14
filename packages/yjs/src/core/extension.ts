import { defineEditorExtension } from '@platejs/plite';

import { YjsController } from './controller';
import type { YjsExtensionOptions } from './types';

export const createYjsExtension = (options: YjsExtensionOptions = {}) =>
  defineEditorExtension({
    name: 'yjs',
    setup(context) {
      const controller = new YjsController(context.editor, options);

      controller.seed();

      return {
        cleanup(): void {
          controller.destroy();
        },
        onCommit({ commit, snapshot }): void {
          controller.handleCommit(commit, snapshot);
        },
        operations: {
          apply({ operation, next, tx }): void {
            controller.handleOperationApply(operation, tx);
            next(operation);
          },
        },
        state: {
          yjs: () => controller.state(),
        },
        tx: {
          yjs: () => controller.tx(),
        },
      };
    },
  });
