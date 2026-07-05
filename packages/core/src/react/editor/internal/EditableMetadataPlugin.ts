import { ElementApi, TextApi } from '@platejs/plite';

import { createBasePlugin } from '../../../lib/plugin/createBasePlugin';

export const EditableMetadataPlugin = createBasePlugin({
  key: 'editableMetadata',
}).extendExtension({
  normalizers: {
    node({ entry, next, tx }) {
      const [node, path] = entry;

      if (
        (ElementApi.isElement(node) || TextApi.isText(node)) &&
        '_memo' in node
      ) {
        tx.nodes.unset('_memo', { at: path });
        return;
      }

      next();
    },
  },
});
