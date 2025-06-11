import {
  type ElementOf,
  type NodeEntry,
  type SlateEditor,
  type TElement,
  type TLocation,
  ElementApi,
  KEYS,
} from 'platejs';

/** If at (default = selection) is in ul>li>p, return li and ul node entries. */
export const getCodeLineEntry = <N extends ElementOf<E>, E extends SlateEditor>(
  editor: E,
  { at = editor.selection }: { at?: TLocation | null } = {}
) => {
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
      editor.api.above<TElement>({
        at,
        match: { type: editor.getType(KEYS.codeLine) },
      }) || editor.api.parent<N>(parentPath);

    if (!codeLine) return;

    const [codeLineNode, codeLinePath] = codeLine;

    if (
      ElementApi.isElement(codeLineNode) &&
      codeLineNode.type !== editor.getType(KEYS.codeLine)
    )
      return;

    const codeBlock = editor.api.parent<N>(codeLinePath);

    if (!codeBlock) return;

    return {
      codeBlock,
      codeLine: codeLine as NodeEntry<N>,
    };
  }
};
