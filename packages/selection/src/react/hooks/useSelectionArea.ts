import React from 'react';

import { useEditorPlugin } from '@udecode/plate/react';

import { SelectionArea } from '../../internal';
import { extractSelectableIds } from '../../lib';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const useSelectionArea = () => {
  const { api, editor, getOptions, setOption } =
    useEditorPlugin(BlockSelectionPlugin);

  const { areaOptions } = getOptions();

  const areaRef = React.useRef<{
    ids: Set<string>;
  }>({
    ids: new Set(),
  });

  const onStart = () => {
    if (editor.api.isFocused()) {
      editor.tf.blur();
    }
    if (editor.selection) {
      editor.tf.deselect();
    }

    setOption('isSelectionAreaVisible', true);
  };

  React.useEffect(() => {
    const selection = new SelectionArea({
      boundaries: `#${editor.uid}`,
      container: `#${editor.uid}`,
      document: window.document,
      selectables: `#${editor.uid} .slate-selectable`,
      selectionAreaClass: 'slate-selection-area',
      ...areaOptions,
    })
      .on('beforestart', () => {
        setOption('isSelecting', false);
      })
      .on('start', ({ event }) => {
        onStart();

        if (!event?.shiftKey) {
          selection.clearSelection();
          api.blockSelection.clear();
        }
      })
      .on('move', ({ store: { changed } }) => {
        if (!getOptions().isSelectionAreaVisible) {
          onStart();
        }
        if (changed.added.length === 0 && changed.removed.length === 0) return;

        const next = new Set(getOptions().selectedIds);
        extractSelectableIds(changed.removed).forEach((id) => {
          next.delete(id);
          areaRef.current.ids.delete(id);
        });

        const added = new Set(extractSelectableIds(changed.added));
        added.forEach((id) => {
          const block = editor.api.block({
            at: [],
            match: (n) => !!n.id && n.id === id,
          });

          if (!block) return;
          if (block[1].length === 1) {
            next.add(id);
            areaRef.current.ids.add(id);

            return;
          }

          const hasAncestor = editor.api.block({
            above: true,
            at: block[1],
            match: (n) => !!n.id && areaRef.current.ids.has(n.id as string),
          });

          if (!hasAncestor) {
            next.add(id);
            areaRef.current.ids.add(id);
          }
        });

        // TODO: support nested blocks

        setOption('selectedIds', next);
      })
      .on('stop', () => {
        areaRef.current = {
          ids: new Set(),
        };
        setOption('isSelectionAreaVisible', false);
      });

    return () => selection.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
