import React from 'react';

import {
  type WithPlatePlugin,
  deselectEditor,
  useEditorRef,
} from '@udecode/plate-common';

import type { BlockSelectionPlugin } from './createBlockSelectionPlugin';

import { blockSelectionActions } from './blockSelectionStore';
import { SelectionArea } from './internal';

let called = false;

export const useSelectionArea = (
  options: WithPlatePlugin<BlockSelectionPlugin>['options']
) => {
  const editor = useEditorRef();

  const { areaOptions } = options;

  React.useEffect(() => {
    if (called) return;

    called = true;

    const selection = new SelectionArea({
      document: window.document,
      ...areaOptions,
    })
      .on('start', ({ event, store }) => {
        deselectEditor(editor);

        if (!event?.shiftKey) {
          selection.clearSelection();
          blockSelectionActions.resetSelectedIds();
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

        blockSelectionActions.setSelectedIds(changed);
      });
  }, []);
};
