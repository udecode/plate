import React from 'react';

import { type TElement, KEYS } from 'platejs';
import { useEditorPlugin } from 'platejs/react';

import { SelectionArea } from '../../internal';
import { extractSelectableIds } from '../../lib';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';

export const useSelectionArea = () => {
  const { api, editor, getOption, getOptions, setOption } =
    useEditorPlugin(BlockSelectionPlugin);

  const { areaOptions } = getOptions();

  const areaRef = React.useRef<{
    ids: Set<string>;
  }>({
    ids: new Set(),
  });

  const trsRef = React.useRef<{
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
      boundaries: `#${editor.meta.uid}`,
      container: `#${editor.meta.uid}`,
      document: window.document,
      selectables: `#${editor.meta.uid} .slate-selectable`,
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
        const apply = () => {
          if (changed.added.length === 0 && changed.removed.length === 0)
            return;

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
            if (block[0].type === KEYS.table) return;

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
        };

        const normalize = () => {
          const next = new Set(getOption('selectedIds'));
          const ids = Array.from(next);

          const isTableElement = (element: TElement) =>
            element.type === KEYS.table ||
            element.type === KEYS.tr ||
            element.type === KEYS.th;

          const isTableRowElement = (element: TElement) =>
            element.type === KEYS.tr || element.type === KEYS.th;

          const getBlockById = (id: string) =>
            editor.api.block({
              at: [],
              match: (n) => !!n.id && n.id === id,
            });

          const isTableOnlySelection = ids.every((id) => {
            const block = getBlockById(id);
            if (!block) return false;

            if (block[1].length >= 3) {
              return true;
            }

            return isTableElement(block[0]);
          });

          if (isTableOnlySelection) {
            ids.some((id) => {
              const block = getBlockById(id);
              if (!block || block[0].type !== KEYS.table) return false;

              next.delete(id);
              trsRef.current.ids.forEach((trId) => {
                next.add(trId);
              });
              trsRef.current.ids.clear();
              return true;
            });
          } else {
            ids.some((id) => {
              const block = getBlockById(id);
              if (!block || !isTableRowElement(block[0])) return false;

              const table = editor.api.block({
                above: true,
                at: block[1],
              });
              if (!table) return false;

              const tableRowIds = table[0].children.map(
                (tr) => tr.id as string
              );

              next.add(table[0].id as string);
              tableRowIds.forEach((trId) => {
                if (next.has(trId)) {
                  trsRef.current.ids.add(trId);
                  next.delete(trId);
                }
              });

              return true;
            });
          }

          setOption('selectedIds', next);
        };

        apply();
        normalize();
      })
      .on('stop', () => {
        areaRef.current = {
          ids: new Set(),
        };
        trsRef.current = {
          ids: new Set(),
        };
        setOption('isSelectionAreaVisible', false);
      });

    return () => selection.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
