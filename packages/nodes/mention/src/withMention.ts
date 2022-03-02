import { comboboxActions } from '@udecode/plate-combobox';
import { getPlugin, insertNodes, WithOverride } from '@udecode/plate-core';
import { Editor, Node, Range, Transforms } from 'slate';
import { HistoryEditor } from 'slate-history';
import { removeMentionInput } from './transforms/removeMentionInput';
import { ELEMENT_MENTION_INPUT } from './createMentionPlugin';
import {
  findMentionInput,
  isNodeMentionInput,
  isSelectionInMentionInput,
} from './queries';
import { MentionInputNode, MentionPlugin } from './types';

export const withMention: WithOverride<{}, MentionPlugin> = (
  editor,
  { options: { id, trigger } }
) => {
  const { type } = getPlugin(editor, ELEMENT_MENTION_INPUT);

  const { apply, insertBreak, insertText, deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const currentMentionInput = findMentionInput(editor);
    if (currentMentionInput && Node.string(currentMentionInput[0]) === '') {
      return removeMentionInput(editor, currentMentionInput[1]);
    }

    deleteBackward(unit);
  };

  editor.insertBreak = () => {
    const currentMentionInput = findMentionInput(editor);
    if (currentMentionInput) {
      return;
    }

    insertBreak();
  };

  editor.insertText = (text) => {
    if (isSelectionInMentionInput(editor)) {
      return Transforms.insertText(editor, text);
    }

    if (!editor.selection || text !== trigger) {
      return insertText(text);
    }

    // Make sure a mention input is created at the beginning of line or after a whitespace
    const previousChar = Editor.string(
      editor,
      Editor.range(
        editor,
        editor.selection,
        Editor.before(editor, editor.selection)
      )
    );

    const nextChar = Editor.string(
      editor,
      Editor.range(
        editor,
        editor.selection,
        Editor.after(editor, editor.selection)
      )
    );

    const beginningOfLine = previousChar === '';
    const endOfLine = nextChar === '';
    const precededByWhitespace = previousChar === ' ';
    const followedByWhitespace = nextChar === ' ';

    if (
      (beginningOfLine || precededByWhitespace) &&
      (endOfLine || followedByWhitespace)
    ) {
      return insertNodes<MentionInputNode>(editor, {
        type,
        children: [{ text: '' }],
        trigger,
      });
    }

    return insertText(text);
  };

  editor.apply = (operation) => {
    if (HistoryEditor.isHistoryEditor(editor) && findMentionInput(editor)) {
      HistoryEditor.withoutSaving(editor, () => apply(operation));
    } else {
      apply(operation);
    }

    if (operation.type === 'insert_text' || operation.type === 'remove_text') {
      const currentMentionInput = findMentionInput(editor);
      if (currentMentionInput) {
        comboboxActions.text(Node.string(currentMentionInput[0]));
      }
    } else if (operation.type === 'set_selection') {
      const previousMentionInputPath = Range.isRange(operation.properties)
        ? findMentionInput(editor, { at: operation.properties })?.[1]
        : undefined;

      const currentMentionInputPath = Range.isRange(operation.newProperties)
        ? findMentionInput(editor, { at: operation.newProperties })?.[1]
        : undefined;

      if (previousMentionInputPath && !currentMentionInputPath) {
        removeMentionInput(editor, previousMentionInputPath);
      }

      if (currentMentionInputPath) {
        comboboxActions.targetRange(editor.selection);
      }
    } else if (
      operation.type === 'insert_node' &&
      isNodeMentionInput(editor, operation.node)
    ) {
      if (operation.node.trigger !== trigger) {
        return;
      }

      comboboxActions.open({
        activeId: id!,
        text: '',
        targetRange: editor.selection,
      });
    } else if (
      operation.type === 'remove_node' &&
      isNodeMentionInput(editor, operation.node)
    ) {
      if (operation.node.trigger !== trigger) {
        return;
      }

      comboboxActions.reset();
    }
  };

  return editor;
};
