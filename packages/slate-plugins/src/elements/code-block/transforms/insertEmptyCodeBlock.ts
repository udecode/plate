import { Editor, Path, Transforms } from 'slate';
import { InsertNodesOptions, setDefaults } from '../../../common';
import { DEFAULT_ELEMENT } from '../../../common/types/node.types';
import { exitBreakAtEdges } from '../../../handlers';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockOptions, CodeLineOptions } from '../types';
import { insertCodeBlock } from './insertCodeBlock';

/**
 * Called by toolbars to make sure a code-block gets inserted below a paragraph
 * rather than awkwardly splitting the current selection.
 */
export const insertEmptyCodeBlock = (
  editor: Editor,
  options: Omit<InsertNodesOptions, 'match'> = {},
  pluginsOptions: CodeBlockOptions & CodeLineOptions = {},
  defaultType: string = DEFAULT_ELEMENT,
  level = 1
) => {
  if (!editor.selection) return;
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
  insertCodeBlock(editor, options, pluginsOptions);
};
