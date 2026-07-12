import type { PlateEditor } from '@platejs/core/react';

import { LinkPlugin } from '../LinkPlugin';
import { triggerFloatingLinkEdit } from './triggerFloatingLinkEdit';
import { triggerFloatingLinkInsert } from './triggerFloatingLinkInsert';

export const triggerFloatingLink = (
  editor: PlateEditor,
  {
    focused,
  }: {
    focused?: boolean;
  } = {}
) => {
  const { getOption } = editor.plugin(LinkPlugin);

  if (getOption('mode') === 'edit') {
    triggerFloatingLinkEdit(editor);

    return;
  }

  triggerFloatingLinkInsert(editor, {
    focused,
  });
};
