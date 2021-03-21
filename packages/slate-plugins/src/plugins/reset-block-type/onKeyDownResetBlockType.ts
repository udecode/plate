import { isCollapsed, someNode } from '@udecode/slate-plugins-common';
import { OnKeyDown } from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { Transforms } from 'slate';
import { ResetBlockTypePluginOptions } from './types';

export const onKeyDownResetBlockType = ({
  rules,
}: ResetBlockTypePluginOptions): OnKeyDown => (editor) => (event) => {
  let reset: boolean | undefined;

  if (editor.selection && isCollapsed(editor.selection)) {
    rules.forEach(({ types, defaultType, hotkey, predicate, onReset }) => {
      if (!event || (hotkey && isHotkey(hotkey, event))) {
        if (predicate(editor) && someNode(editor, { match: { type: types } })) {
          event?.preventDefault();

          Transforms.setNodes(editor, { type: defaultType } as any);

          onReset?.(editor);

          reset = true;
        }
      }
    });
  }

  return reset;
};
