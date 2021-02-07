import { getAbove, getLastChildPath, getNode, isNodeEntry } from '../../../common';
import { Editor, Transforms, NodeEntry, Ancestor, Element, Path } from 'slate';

export const insertBlockquoteItem = (
    editor: Editor,
    currentBlockquote: NodeEntry<Ancestor>,
    currentBlockquoteNodeItem: Element) => {

    const [currentBlockquoteNode] = currentBlockquote;
    const [,path] = currentBlockquote;

    editor.insertBreak();
    
    Transforms.mergeNodes(
        editor,
        { at: Path.next(path) }
    )
    Transforms.wrapNodes(editor, currentBlockquoteNode);

};
