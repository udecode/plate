import { comboboxStore } from '@udecode/plate-combobox';
import { insertNodes } from '@udecode/plate-common';
import { getPlugin, WithOverride } from '@udecode/plate-core';
import { defaults } from 'lodash';
import { Editor, Node, Range, Transforms } from 'slate';
import { HistoryEditor } from 'slate-history';
import { removeMentionInput } from './transforms/removeMentionInput';
import { COMBOBOX_TRIGGER_MENTION, ELEMENT_MENTION } from './defaults';
import { getMentionInputType } from './options';
import {
  findMentionInput,
  isNodeMentionInput,
  isSelectionInMentionInput,
} from './queries';
import { MentionInputNode, MentionPluginOptions } from './types';

export const withMention = ({
  key = ELEMENT_MENTION,
  ...options
}: MentionPluginOptions = {}): WithOverride => (editor) => {
  // TODO: extend plate-core to register options
  editor.pluginsByKey[key] = defaults(options, {
    key,
    type: key,
    id: key,
    trigger: COMBOBOX_TRIGGER_MENTION,
    createMentionNode: (item) => ({ value: item.text }),
  } as MentionPluginOptions);

  return editor;
};

export const withMentionInput = ({
  key = ELEMENT_MENTION,
}: MentionPluginOptions = {}): WithOverride => (editor) => {
  const { apply, insertText, deleteBackward } = editor;

  const { trigger, id } = getPlugin<MentionPluginOptions>(editor, key);

  editor.deleteBackward = (unit) => {
    const currentMentionInput = findMentionInput(editor);
    if (currentMentionInput && Node.string(currentMentionInput[0]) === '') {
      return removeMentionInput(editor, currentMentionInput[1]);
    }

    deleteBackward(unit);
  };

  editor.insertText = (text) => {
    if (isSelectionInMentionInput(editor)) {
      return Transforms.insertText(editor, text);
    }

    if (!editor.selection || text !== trigger) {
      return insertText(text);
    }

    // Make sure a mention input is created at the beginning of line or after a whitespace
    const previousCharLocation = Editor.before(editor, editor.selection);
    if (previousCharLocation) {
      const previousChar = Editor.string(
        editor,
        Editor.range(editor, editor.selection, previousCharLocation)
      );
      if (previousChar !== '' && previousChar !== ' ') {
        return insertText(text);
      }
    }

    insertNodes<MentionInputNode>(editor, {
      type: getMentionInputType(editor),
      children: [{ text: '' }],
      trigger,
    });
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
        comboboxStore.set.text(Node.string(currentMentionInput[0]));
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
        comboboxStore.set.targetRange(editor.selection);
      }
    } else if (
      operation.type === 'insert_node' &&
      isNodeMentionInput(editor, operation.node)
    ) {
      if (operation.node.trigger !== trigger) {
        return;
      }

      comboboxStore.set.open({
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

      comboboxStore.set.reset();
    }
  };

  return editor;
};
