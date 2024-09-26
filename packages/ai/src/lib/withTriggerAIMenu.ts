import type { ExtendEditor } from '@udecode/plate-core';

import {
  getEditorString,
  getNodeString,
  getPointBefore,
  getRange,
} from '@udecode/slate';
import { getAncestorNode } from '@udecode/slate-utils';

import type { BaseAIPluginConfig } from './BaseAIPlugin';

export const withTriggerAIMenu: ExtendEditor<BaseAIPluginConfig> = ({
  editor,
  ...ctx
}) => {
  const { insertText } = editor;

  const matchesTrigger = (text: string) => {
    const { trigger } = ctx.getOptions();

    if (trigger instanceof RegExp) {
      return trigger.test(text);
    }
    if (Array.isArray(trigger)) {
      return trigger.includes(text);
    }

    return text === trigger;
  };

  editor.insertText = (text) => {
    const { triggerPreviousCharPattern, triggerQuery } = ctx.getOptions();

    if (
      !editor.selection ||
      !matchesTrigger(text) ||
      (triggerQuery && !triggerQuery(editor))
    ) {
      return insertText(text);
    }

    // Make sure an input is created at the beginning of line or after a whitespace
    const previousChar = getEditorString(
      editor,
      getRange(
        editor,
        editor.selection,
        getPointBefore(editor, editor.selection)
      )
    );

    const matchesPreviousCharPattern =
      triggerPreviousCharPattern?.test(previousChar);

    if (matchesPreviousCharPattern) {
      const nodeEntry = getAncestorNode(editor);

      if (!nodeEntry) return insertText(text);

      const [node] = nodeEntry;

      // Make sure can only open menu in the first point
      if (getNodeString(node).length > 0) return insertText(text);

      const { onOpenAI } = ctx.getOptions();

      if (onOpenAI) return onOpenAI(editor, nodeEntry);
    }

    return insertText(text);
  };

  return editor;
};
