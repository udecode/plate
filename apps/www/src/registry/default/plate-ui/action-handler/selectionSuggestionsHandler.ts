'use client';
import type { PlateEditor } from '@udecode/plate-core/react';

import {
  AIPlugin,
  getContent,
  streamInsertTextSelection,
} from '@udecode/plate-ai/react';
import { nanoid } from '@udecode/plate-core';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { insertNodes, isBlock, removeNodes, withMerging } from '@udecode/slate';
import { Path, Range } from 'slate';

import {
  ACTION_SELECTION_SUGGESTION_CONTINUE_WRITE,
  ACTION_SELECTION_SUGGESTION_DONE,
  ACTION_SELECTION_SUGGESTION_INSERT_BELOW,
  ACTION_SELECTION_SUGGESTION_MAKE_LONGER,
  ACTION_SELECTION_SUGGESTION_REPLACE,
  ACTION_SELECTION_SUGGESTION_TRY_AGAIN,
} from '@/registry/default/plate-ui/ai-actions';

import type { ActionHandlerOptions } from './useActionHandler';

export const selectionSuggestionsHandler = (
  editor: PlateEditor,
  aiEditor: PlateEditor,
  { group: _, value }: ActionHandlerOptions
) => {
  switch (value) {
    case ACTION_SELECTION_SUGGESTION_REPLACE: {
      editor.getApi(AIPlugin).ai.hide();
      const nodes = aiEditor.children;

      let path: Path = [];

      const selectedBlocks = editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getSelectedBlocks();

      const selectedIds = editor.getOptions(BlockSelectionPlugin).selectedIds;

      if (selectedBlocks.length > 0 && selectedIds?.size) {
        path = selectedBlocks[0][1];

        removeNodes(editor, {
          at: [],
          match: (n) => selectedIds.has(n.id),
        });
      } else {
        const start = Range.start(editor.selection!);
        path = [start.path[0]];

        removeNodes(editor, {
          at: editor.selection!,
          match: (n) => isBlock(editor, n),
          mode: 'highest',
        });
      }

      const ids: string[] = [];

      nodes.forEach((node) => {
        const id = nanoid();
        ids.push(id);
        node.id = id;
      });

      withMerging(editor, () => {
        insertNodes(editor, nodes, { at: path });
      });

      setTimeout(() => {
        editor.getApi(BlockSelectionPlugin).blockSelection.resetSelectedIds();
        ids.forEach((id) =>
          editor
            .getApi(BlockSelectionPlugin)
            .blockSelection.addSelectedRow(id, { clear: false })
        );
      }, 0);

      break;
    }
    case ACTION_SELECTION_SUGGESTION_INSERT_BELOW: {
      editor.getApi(AIPlugin).ai.hide();
      const nodes = aiEditor.children;

      const selectedBlocks = editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getSelectedBlocks();

      let path: Path = [];

      if (selectedBlocks.length > 0) {
        const lastBlockPath = selectedBlocks.at(-1)![1];
        path = Path.next(lastBlockPath);
      } else {
        const end = Range.end(editor.selection!);
        path = Path.next([end.path[0]]);
      }

      const ids: string[] = [];

      nodes.forEach((node) => {
        const id = nanoid();
        ids.push(id);
        node.id = id;
      });

      insertNodes(editor, nodes, { at: path });

      setTimeout(() => {
        editor.getApi(BlockSelectionPlugin).blockSelection.resetSelectedIds();
        ids.forEach((id) =>
          editor
            .getApi(BlockSelectionPlugin)
            .blockSelection.addSelectedRow(id, { clear: false })
        );
      }, 0);

      break;
    }
    case ACTION_SELECTION_SUGGESTION_CONTINUE_WRITE: {
      const content = getContent(editor, aiEditor);

      void streamInsertTextSelection(editor, aiEditor, {
        prompt: `continue write the following: ${content}`,
      });

      break;
    }
    case ACTION_SELECTION_SUGGESTION_MAKE_LONGER: {
      const content = getContent(editor, aiEditor);

      void streamInsertTextSelection(editor, aiEditor, {
        prompt: `make longer with the following content: ${content}`,
      });

      break;
    }
    case ACTION_SELECTION_SUGGESTION_TRY_AGAIN: {
      const content = getContent(editor, aiEditor);

      void streamInsertTextSelection(editor, aiEditor, {
        prompt: `rewrite the following content: ${content}`,
      });

      break;
    }
    case ACTION_SELECTION_SUGGESTION_DONE: {
      editor.getApi(AIPlugin).ai.hide();

      break;
    }
  }
};
