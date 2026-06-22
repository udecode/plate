import { type NodeEntry, type SlateEditor, ElementApi, KEYS } from 'platejs';
import type { Element, Location } from '@platejs/slate';

/** If at (default = selection) is in ul>li>p, return li and ul node entries. */
export const getCodeLineEntry = (
  editor: SlateEditor,
  { at = editor.selection }: { at?: Location | null } = {}
):
  | { codeBlock: NodeEntry<Element>; codeLine: NodeEntry<Element> }
  | undefined => {
  if (
    at &&
    editor.api.some({
      at,
      match: { type: editor.getType(KEYS.codeLine) },
    })
  ) {
    const selectionParent = editor.api.parent(at);

    if (!selectionParent) return;

    const [, parentPath] = selectionParent;

    const codeLine =
      editor.api.above<Element>({
        at,
        match: { type: editor.getType(KEYS.codeLine) },
      }) || editor.api.parent<Element>(parentPath);

    if (!codeLine) return;

    const [codeLineNode, codeLinePath] = codeLine;

    if (
      ElementApi.isElement(codeLineNode) &&
      codeLineNode.type !== editor.getType(KEYS.codeLine)
    )
      return;

    const codeBlock = editor.api.parent<Element>(codeLinePath);

    if (!codeBlock) return;

    return {
      codeBlock,
      codeLine,
    };
  }
};
