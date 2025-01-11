import type { ExtendConfig } from '@udecode/plate';

import { Key, toPlatePlugin } from '@udecode/plate/react';

import {
  type BaseCommentsConfig,
  BaseCommentsPlugin,
} from '../lib/BaseCommentsPlugin';
import { useHooksComments } from './useHooksComments';

export type CommentsConfig = ExtendConfig<BaseCommentsConfig>;

/** Enables support for comments in the editor. */
export const CommentsPlugin = toPlatePlugin(BaseCommentsPlugin, {
  shortcuts: {
    toggleComment: {
      keys: [[Key.Mod, Key.Shift, 'm']],
    },
  },
  useHooks: useHooksComments,
});
