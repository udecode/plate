import {
  type NodeEntry,
  type BasePlateEditor,
  ElementApi,
  KEYS,
} from 'platejs';
import type { Element, Location } from '@platejs/plite';

/** If at (default = selection) is in ul>li>p, return li and ul node entries. */
export const getCodeLineEntry = (
  editor: BasePlateEditor,
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
      (editor.api.above({
        at,
        match: { type: editor.getType(KEYS.codeLine) },
      }) as NodeEntry<Element> | undefined) ||
      (editor.api.parent(parentPath) as NodeEntry<Element> | undefined);

    if (!codeLine) return;

    const [codeLineNode, codeLinePath] = codeLine;

    if (
      ElementApi.isElement(codeLineNode) &&
      codeLineNode.type !== editor.getType(KEYS.codeLine)
    )
      return;

    const codeBlock = editor.api.parent(codeLinePath) as
      | NodeEntry<Element>
      | undefined;

    if (!codeBlock) return;

    return {
      codeBlock,
      codeLine,
    };
  }
};
