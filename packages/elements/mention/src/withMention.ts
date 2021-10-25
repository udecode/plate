import { comboboxStore } from '@udecode/plate-combobox';
import { insertNodes } from '@udecode/plate-common';
import { SPEditor, WithOverride } from '@udecode/plate-core';
import { Editor, Node, Range, Transforms } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { removeMentionProposal } from './transforms/removeMentionProposal';
import { getMentionProposalType } from './options';
import {
  findMentionProposal,
  isNodeMentionProposal,
  isSelectionInMentionProposal,
} from './queries';

export const withMention = ({
  id,
  trigger,
}: {
  id: string;
  trigger: string;
}): WithOverride<ReactEditor & SPEditor> => (editor) => {
  const { apply, insertText, deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const currentMentionProposal = findMentionProposal(editor);
    if (
      currentMentionProposal &&
      Node.string(currentMentionProposal[0]) === ''
    ) {
      return removeMentionProposal(editor, trigger, currentMentionProposal[1]);
    }

    deleteBackward(unit);
  };

  editor.insertText = (text) => {
    if (isSelectionInMentionProposal(editor)) {
      return Transforms.insertText(editor, text);
    }

    if (!editor.selection || text !== trigger) {
      return insertText(text);
    }

    // Make sure a mention proposal is created at the beginning of line or after a whitespace
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

    insertNodes(editor, {
      type: getMentionProposalType(editor),
      children: [{ text: '' }],
    });
  };

  editor.apply = (operation) => {
    if (HistoryEditor.isHistoryEditor(editor) && findMentionProposal(editor)) {
      HistoryEditor.withoutSaving(editor, () => apply(operation));
    } else {
      apply(operation);
    }

    if (operation.type === 'insert_text' || operation.type === 'remove_text') {
      const currentMentionProposal = findMentionProposal(editor);
      if (currentMentionProposal) {
        comboboxStore.set.text(Node.string(currentMentionProposal[0]));
      }
    } else if (operation.type === 'set_selection') {
      const previousMentionProposalPath = Range.isRange(operation.properties)
        ? findMentionProposal(editor, { at: operation.properties })?.[1]
        : undefined;

      const currentMentionProposalPath = Range.isRange(operation.newProperties)
        ? findMentionProposal(editor, { at: operation.newProperties })?.[1]
        : undefined;

      if (previousMentionProposalPath && !currentMentionProposalPath) {
        removeMentionProposal(editor, trigger, previousMentionProposalPath);
      }

      if (currentMentionProposalPath) {
        comboboxStore.set.targetRange(editor.selection);
      }
    } else if (
      operation.type === 'insert_node' &&
      isNodeMentionProposal(editor, operation.node)
    ) {
      comboboxStore.set.open({
        activeId: id,
        text: '',
        targetRange: editor.selection,
      });
    } else if (
      operation.type === 'remove_node' &&
      isNodeMentionProposal(editor, operation.node)
    ) {
      comboboxStore.set.reset();
    }
  };

  return editor;
};
