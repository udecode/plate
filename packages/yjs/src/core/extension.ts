import { defineEditorExtension } from '@platejs/slate';

import { YjsController } from './controller';
import type { YjsExtensionOptions } from './types';

export const createYjsExtension = (
  options: YjsExtensionOptions = {}
): ReturnType<typeof defineEditorExtension> =>
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
        state: {
          yjs: () => controller.state(),
        },
        tx: {
          yjs: () => controller.tx(),
        },
      };
    },
  });
