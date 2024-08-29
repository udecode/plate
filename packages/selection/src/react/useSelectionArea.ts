import React from 'react';

import { deselectEditor, useEditorPlugin } from '@udecode/plate-common/react';

import { SelectionArea } from '../internal';
import { BlockSelectionPlugin } from './BlockSelectionPlugin';

export const useSelectionArea = () => {
  const { api, editor, getOptions } = useEditorPlugin(BlockSelectionPlugin);

  const { areaOptions } = getOptions();

  React.useEffect(() => {
    console.log(areaOptions, 'fj');
    const selection = new SelectionArea({
      document: window.document,
      ...areaOptions,
    })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .on('start', ({ event, store }) => {
        deselectEditor(editor);

        if (!event?.shiftKey) {
          selection.clearSelection();
          api.blockSelection.resetSelectedIds();
        }
      })
      .on('move', ({ store: { changed } }) => {
        if (changed.added.length === 0 && changed.removed.length === 0) return;

        for (const el of changed.added) {
          el.classList.add('selected');
        }

        for (const el of changed.removed) {
          el.classList.remove('selected');
        }

        api.blockSelection.setSelectedIds(changed);
      });

    return () => selection.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
