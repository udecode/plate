import type { SlateEditor } from '@udecode/plate-common';

import { floatingLinkSelectors } from '../components';
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
  if (floatingLinkSelectors.mode() === 'edit') {
    triggerFloatingLinkEdit(editor);

    return;
  }

  triggerFloatingLinkInsert(editor, {
    focused,
  });
};
