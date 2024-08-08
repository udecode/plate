import type { PlateEditor } from '@udecode/plate-common/server';

import { floatingLinkSelectors } from '../components/index';
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
  if (floatingLinkSelectors.mode() === 'edit') {
    triggerFloatingLinkEdit(editor);

    return;
  }

  triggerFloatingLinkInsert(editor, {
    focused,
  });
};
