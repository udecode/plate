import { type SlateEditor, getEditorPlugin } from '@udecode/plate-common';

import { LinkPlugin } from '../LinkPlugin';
import { triggerFloatingLinkEdit } from './triggerFloatingLinkEdit';
import { triggerFloatingLinkInsert } from './triggerFloatingLinkInsert';

export const triggerFloatingLink = (
  editor: SlateEditor,
  {
    focused,
  }: {
    focused?: boolean;
  } = {}
) => {
  const { getOptions } = getEditorPlugin(editor, LinkPlugin);

  if (getOptions().mode === 'edit') {
    triggerFloatingLinkEdit(editor);

    return;
  }

  triggerFloatingLinkInsert(editor, {
    focused,
  });
};
