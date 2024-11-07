import type { OnChange } from '@udecode/plate-common/react';

import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

import { BlockMenuPlugin } from '../BlockMenuPlugin';

export const onChangeBlockSelection: OnChange<BlockSelectionConfig> = ({
  api,
  editor,
  getOptions,
}) => {
  if (
    editor.selection &&
    getOptions().selectedIds!.size > 0 &&
    !editor.getOption(BlockMenuPlugin, 'openId')
  ) {
    api.blockSelection.unselect();
    editor.getApi(BlockMenuPlugin).blockMenu.hide();
  }
};
