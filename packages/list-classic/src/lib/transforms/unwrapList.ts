import {
  type Path,
  type SlateEditor,
  ElementApi,
  KEYS,
  NodeApi,
} from 'platejs';

import { getListTypes } from '../queries/index';

export const unwrapList = (editor: SlateEditor, { at }: { at?: Path } = {}) => {
  const ancestorListTypeCheck = () => {
    if (editor.api.above({ at, match: { type: getListTypes(editor) } })) {
      return true;
    }
    // The selection's common node might be a list type
    if (!at && editor.selection) {
      const commonNode = NodeApi.common(
        editor,
        editor.selection.anchor.path,
        editor.selection.focus.path
      )!;

      if (
        ElementApi.isElement(commonNode[0]) &&
        getListTypes(editor).includes(commonNode[0].type)
      ) {
        return true;
      }
    }

    return false;
  };

  editor.tf.withoutNormalizing(() => {
    do {
      // const licEntry = editor.api.block({
      //   at,
      //   match: { type: editor.getType(BaseListItemContentPlugin) },
      // });

      // Allow other LIC types
      // if (licEntry) {
      //   editor.tf.setNodes(
      //     { type: editor.getType(BaseParagraphPlugin) },
      //     { at }
      //   );
      // }

      editor.tf.unwrapNodes({
        at,
        match: { type: editor.getType(KEYS.li) },
        split: true,
      });

      editor.tf.unwrapNodes({
        at,
        match: {
          type: getListTypes(editor),
        },
        split: true,
      });
    } while (ancestorListTypeCheck());
  });
};
