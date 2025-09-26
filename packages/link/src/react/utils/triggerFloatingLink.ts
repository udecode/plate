import { type SlateEditor, getEditorPlugin } from 'platejs';

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
  const { getOption } = getEditorPlugin(editor, LinkPlugin);

  if (getOption('mode') === 'edit') {
    triggerFloatingLinkEdit(editor);

    return;
  }

  triggerFloatingLinkInsert(editor, {
    focused,
  });
};
