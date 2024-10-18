import type { PlateEditor } from '@udecode/plate-common/react';

import {
  type TElement,
  getEndPoint,
  insertNodes,
  isEditorEmpty,
  isElementEmpty,
  nanoid,
  withMerging,
} from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';
import {
  BlockSelectionPlugin,
  removeBlockSelectionNodes,
} from '@udecode/plate-selection/react';
import { cloneDeep } from 'lodash';
import { Path, Range } from 'slate';

import type { AIChatPluginConfig } from '../AIChatPlugin';

export const acceptAIChat = (editor: PlateEditor) => {
  // const isBlockSelecting = editor.getOption(
  //   BlockSelectionPlugin,
  //   'isSelectingSome'
  // );
  // editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();
};

export const replaceSelectionAIChat = (
  editor: PlateEditor,
  sourceEditor: PlateEditor
) => {
  const isBlockSelecting = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();
  focusEditor(editor, getEndPoint(editor, editor.selection!));

  if (isBlockSelecting) {
    const firstBlockPath = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes()[0][1];

    editor.withoutNormalizing(() => {
      withMerging(editor, () => {
        removeBlockSelectionNodes(editor);
        insertBlocksAndSelect(editor, sourceEditor, { at: firstBlockPath });
      });
    });
  } else {
    if (isElementEmpty(editor, sourceEditor.children[0])) return;

    editor.insertFragment(sourceEditor.children);
    focusEditor(editor);
  }
};

export const insertBelowAIChat = (
  editor: PlateEditor,
  sourceEditor: PlateEditor
) => {
  const isBlockSelecting = editor.getOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();

  if (isBlockSelecting) {
    const selectedBlocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes();

    const selectedIds = editor.getOptions(BlockSelectionPlugin).selectedIds;

    if (!selectedIds || selectedIds.size === 0) return;

    const lastBlock = selectedBlocks.at(-1);

    if (!lastBlock) return;

    const nextPath = Path.next(lastBlock[1]);

    insertBlocksAndSelect(editor, sourceEditor, { at: nextPath });
  } else {
    const [, end] = Range.edges(editor.selection!);
    const endPath = [end.path[0]];
    insertBlocksAndSelect(editor, sourceEditor, { at: Path.next(endPath) });
  }
};

const insertBlocksAndSelect = (
  editor: PlateEditor,
  sourceEditor: PlateEditor,
  { at }: { at: Path }
) => {
  if (!sourceEditor) return;
  if (isEditorEmpty(sourceEditor)) return;

  const nodes: TElement[] = cloneDeep(sourceEditor.children);

  const ids: string[] = [];

  nodes.forEach((node) => {
    const id = nanoid();
    ids.push(id);
    node.id = id;
  });

  insertNodes(editor, nodes, { at: at });

  // TODO check needed?
  focusEditor(editor, getEndPoint(editor, editor.selection!));

  setTimeout(() => {
    editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.setSelectedIds({ ids } as any);
  }, 0);
};
