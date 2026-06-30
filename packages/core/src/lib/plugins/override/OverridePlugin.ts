import type { EditorElementSpec } from '@platejs/plite';

import { createBasePlugin } from '../../plugin/createBasePlugin';

/** Override the editor based on resolved Plate plugin node behavior. */
export const OverridePlugin = createBasePlugin({
  key: 'override',
}).extendExtension(({ editor }) => {
  const elements = editor.runtime.pluginList.flatMap((plugin) => {
    const { node } = plugin;
    const type = node?.type;

    if (!type) return [];

    const hasSchemaBehavior =
      node.isInline !== undefined ||
      node.isMarkableVoid !== undefined ||
      node.isSelectable !== undefined ||
      node.isVoid !== undefined;

    if (!hasSchemaBehavior) return [];

    const spec: EditorElementSpec = { type };

    if (node.isInline === true) {
      spec.inline = true;
    }
    if (node.isSelectable === false) {
      spec.selectable = false;
    }
    if (node.isMarkableVoid === true) {
      spec.markableVoid = true;
    }
    if (node.isVoid === true) {
      spec.void =
        node.isInline === true
          ? node.isMarkableVoid === true
            ? 'markable-inline'
            : 'inline'
          : 'block';
    }

    return [spec];
  });

  if (elements.length === 0) return;

  return { elements };
});
