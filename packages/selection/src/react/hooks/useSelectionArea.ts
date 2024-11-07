import React from 'react';

import { deselectEditor, useEditorPlugin } from '@udecode/plate-common/react';

import { SelectionArea } from '../../internal';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const useSelectionArea = () => {
  const { api, editor, getOptions, setOption } =
    useEditorPlugin(BlockSelectionPlugin);

  const { areaOptions } = getOptions();

  React.useEffect(() => {
    const selection = new SelectionArea({
      boundaries: `#${editor.key}`,
      container: `#${editor.key}`,
      document: window.document,
      selectables: `#${editor.key} .slate-selectable`,
      selectionAreaClass: 'slate-selection-area',
      ...areaOptions,
    })
      .on('beforestart', () => {
        setOption('isSelecting', false);
      })
      .on('start', ({ event }) => {
        setOption('isSelectionAreaVisible', true);

        deselectEditor(editor);

        if (!event?.shiftKey) {
          selection.clearSelection();
          api.blockSelection.resetSelectedIds();
        }
      })
      .on('move', ({ store: { changed } }) => {
        if (!getOptions().isSelectionAreaVisible) {
          setOption('isSelectionAreaVisible', true);
        }
        if (changed.added.length === 0 && changed.removed.length === 0) return;

        api.blockSelection.setSelectedIds(changed);
      })
      .on('stop', () => {
        setOption('isSelectionAreaVisible', false);
      });

    return () => selection.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
