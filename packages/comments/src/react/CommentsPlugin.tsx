import {
  type ExtendConfig,
  type OmitFirst,
  bindFirst,
} from '@udecode/plate-common';
import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import {
  type BaseCommentsConfig,
  BaseCommentsPlugin,
} from '../lib/BaseCommentsPlugin';
import { insertComment } from './transforms';
import { useHooksComments } from './useHooksComments';

export type CommentsConfig = ExtendConfig<
  BaseCommentsConfig,
  {},
  {},
  {
    insert: {
      comment: OmitFirst<typeof insertComment>;
    };
  }
>;

/** Enables support for comments in the editor. */
export const CommentsPlugin = toPlatePlugin(BaseCommentsPlugin, {
  shortcuts: {
    toggleComment: {
      keys: [[Key.Mod, Key.Shift, 'm']],
    },
  },
  useHooks: useHooksComments,
}).extendEditorTransforms(({ editor }) => ({
  insert: { comment: bindFirst(insertComment, editor) },
}));
