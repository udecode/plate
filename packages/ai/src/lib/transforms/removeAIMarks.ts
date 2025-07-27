import { type SlateEditor, type TLocation, getPluginType, KEYS } from 'platejs';

export const removeAIMarks = (
  editor: SlateEditor,
  { at = [] }: { at?: TLocation } = {}
) => {
  const nodeType = getPluginType(editor, KEYS.ai);

  editor.tf.unsetNodes(nodeType, {
    at,
    match: (n) => (n as any)[nodeType],
  });
};
