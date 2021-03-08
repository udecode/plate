import { Editor, Path, Transforms } from 'slate';
import {
  InsertNodesOptions,
  isBlockAboveEmpty,
  isExpanded,
} from '../../../common';
import { DEFAULT_ELEMENT } from '../../../common/types/node.types';
import {
  CodeBlockInsertOptions,
  CodeBlockOptions,
  CodeLineOptions,
} from '../types';
import { insertCodeBlock } from './insertCodeBlock';

/**
 * Called by toolbars to make sure a code-block gets inserted below a paragraph
 * rather than awkwardly splitting the current selection.
 */
export const insertEmptyCodeBlock = (
  editor: Editor,
  options: Omit<InsertNodesOptions, 'match'> = {},
  pluginsOptions: CodeBlockInsertOptions &
    CodeBlockOptions &
    CodeLineOptions = {}
) => {
  if (!editor.selection) return;

  const defaultType = pluginsOptions.defaultType || DEFAULT_ELEMENT;
  const level = pluginsOptions.level || 1;

  if (isExpanded(editor.selection) || !isBlockAboveEmpty(editor)) {
    const selectionPath = Editor.path(editor, editor.selection);
    const insertPath = Path.next(selectionPath.slice(0, level + 1));
    Transforms.insertNodes(
      editor,
      { type: defaultType, children: [{ text: '' }] },
      {
        at: insertPath,
        select: true,
      }
    );
  }
  insertCodeBlock(editor, options, pluginsOptions);
};
