import { type BasePlateEditor, getEditorPlugin } from 'platejs';

import { LinkPlugin } from '../LinkPlugin';
import { triggerFloatingLinkEdit } from './triggerFloatingLinkEdit';
import { triggerFloatingLinkInsert } from './triggerFloatingLinkInsert';

export const triggerFloatingLink = (
  editor: BasePlateEditor,
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
