import { type SlateEditor, TextApi, nanoid } from '@udecode/plate-common';

import { BaseCommentsPlugin, getCommentKey } from '..';

export const insertComment = (editor: SlateEditor) => {
  if (!editor.api.isExpanded()) return;

  const id = nanoid();

  // add comment prop to inline elements
  // const entries = NodeApi.nodes(editor, {
  //   // TODO
  // });
  //
  // Array.from(entries).forEach(([, path]) => {
  //   setNodes(
  //     editor,
  //     {
  //       [key]: comment,
  //     },
  //     { at: path }
  //   );
  // });

  editor.tf.setNodes(
    { [BaseCommentsPlugin.key]: true, [getCommentKey(id)]: true },
    { match: TextApi.isText, split: true }
  );

  try {
    editor.tf.deselect();
  } catch {}

  setTimeout(() => {
    editor.setOption(BaseCommentsPlugin, 'activeCommentId', id);
  }, 0);
};
