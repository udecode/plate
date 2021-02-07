import { Transforms } from 'slate';
import { Ancestor, Editor, NodeEntry, Path, Element } from 'slate';
import { getLastChildPath } from '../../../common';


export function getNextBlockquoteItem (
    editor: Editor,
    currentBlockquote: NodeEntry<Ancestor>,
    currentBlockquoteItemNode: Element,
  ): NodeEntry | undefined {
    const nextItemPath = Path.next(getLastChildPath(currentBlockquote));
    Transforms.insertNodes(
        editor,
        currentBlockquoteItemNode,
        { at: nextItemPath, select: true})
    return Editor.node(editor, nextItemPath);
  }
