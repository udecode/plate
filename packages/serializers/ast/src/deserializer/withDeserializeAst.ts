import { WithOverride } from '@udecode/plate-core';
import {
  insertDeserializedFragment,
  isDeserializerEnabled,
} from '@udecode/plate-serializer';
import { KEY_DESERIALIZE_AST } from './createDeserializeAstPlugin';

/**
 * Enables support for deserializing inserted content from Slate Ast format to Slate format
 * while apply a small bug fix.
 */
export const withDeserializeAst: WithOverride = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data: DataTransfer) => {
    const ast = data.getData('application/x-slate-fragment');

    const isEnabled = isDeserializerEnabled(editor, KEY_DESERIALIZE_AST);

    if (ast && isEnabled) {
      const decoded = decodeURIComponent(window.atob(ast));
      const fragment = JSON.parse(decoded);

      if (fragment.length) {
        return insertDeserializedFragment(editor, {
          fragment,
        });
      }
    }

    insertData(data);
  };

  return editor;
};
