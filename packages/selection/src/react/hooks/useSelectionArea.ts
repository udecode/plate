import React from 'react';

import type { NormalizePluginState } from '@platejs/core';
import { type Element, ElementApi } from '@platejs/plite';
import { useEditorPlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { SelectionArea } from '../../internal';
import type { PartialSelectionOptions, Trigger } from '../../internal';
import { extractSelectableIds } from '../../lib';
import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

const toMutableSelectionTargets = <T extends HTMLElement | string>(
  value: T | readonly T[] | undefined
): T | T[] | undefined =>
  value === undefined
    ? undefined
    : Array.isArray(value)
      ? [...value]
      : (value as T);

const toMutableTrigger = (trigger: NormalizePluginState<Trigger>): Trigger =>
  typeof trigger === 'number'
    ? trigger
    : { ...trigger, modifiers: [...trigger.modifiers] };

const toMutableSelectionAreaOptions = (
  options: NormalizePluginState<PartialSelectionOptions> | undefined
): PartialSelectionOptions => ({
  ...options,
  behaviour: options?.behaviour
    ? {
        ...options.behaviour,
        triggers: options.behaviour.triggers?.map(toMutableTrigger),
      }
    : undefined,
  boundaries: toMutableSelectionTargets(options?.boundaries),
  container: toMutableSelectionTargets(options?.container),
  selectables: toMutableSelectionTargets(options?.selectables),
  startAreas: toMutableSelectionTargets(options?.startAreas),
});

export const useSelectionArea = () => {
  const { api, editor, store } = useEditorPlugin<BlockSelectionConfig>({
    key: KEYS.blockSelection,
  });

  const { areaOptions } = store.get();

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
    if (editor.read.view.isFocused()) {
      editor.api.dom.blur();
    }
    if (editor.read.selection()) {
      editor.update.selection.clear();
    }

    store.set({ isSelectionAreaVisible: true });
  };

  React.useEffect(() => {
    const selectionAreaOptions = toMutableSelectionAreaOptions(areaOptions);
    const selection = new SelectionArea({
      document: window.document,
      selectionAreaClass: 'plite-selection-area',
      ...selectionAreaOptions,
      boundaries: selectionAreaOptions.boundaries ?? `#${editor.id}`,
      container: selectionAreaOptions.container ?? `#${editor.id}`,
      selectables:
        selectionAreaOptions.selectables ?? `#${editor.id} .plite-selectable`,
    })
      .on('beforestart', () => {
        store.set({ isSelecting: false });
      })
      .on('start', ({ event }) => {
        onStart();

        if (!event?.shiftKey) {
          selection.clearSelection();
          api.clear();
        }
      })
      .on('move', ({ store: { changed } }) => {
        if (!store.get().isSelectionAreaVisible) {
          onStart();
        }
        const apply = () => {
          if (changed.added.length === 0 && changed.removed.length === 0)
            return;

          const next = new Set(store.get().selectedIds);
          extractSelectableIds(changed.removed).forEach((id) => {
            next.delete(id);
            areaRef.current.ids.delete(id);
          });

          const added = new Set(extractSelectableIds(changed.added));
          added.forEach((id) => {
            const block = editor.read.nodes.block({
              at: [],
              match: { id },
            });

            if (!block) return;
            if (block[0].type === KEYS.table) return;

            if (block[1].length === 1) {
              next.add(id);
              areaRef.current.ids.add(id);

              return;
            }

            const hasAncestor = editor.read.nodes.above({
              at: block[1],
              match: (n) =>
                ElementApi.isElement(n) &&
                !!n.id &&
                areaRef.current.ids.has(n.id as string),
            });

            if (!hasAncestor) {
              next.add(id);
              areaRef.current.ids.add(id);
            }
          });

          // TODO: support nested blocks

          store.set({ selectedIds: next });
        };

        const normalize = () => {
          const next = new Set(store.get('selectedIds'));
          const ids = Array.from(next);

          const isTableElement = (element: Element) =>
            element.type === KEYS.table ||
            element.type === KEYS.tr ||
            element.type === KEYS.th;

          const isTableRowElement = (element: Element) =>
            element.type === KEYS.tr || element.type === KEYS.th;

          const getBlockById = (id: string) =>
            editor.read.nodes.block({
              at: [],
              match: { id },
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

              const table = editor.read.nodes.above<Element>({
                at: block[1],
                match: (node) => ElementApi.isElement(node),
              });
              if (!table) return false;

              const tableRowIds = table[0].children
                .filter((child): child is Element =>
                  ElementApi.isElement(child)
                )
                .map((tr) => tr.id as string);

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

          store.set({ selectedIds: next });
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
        store.set({ isSelectionAreaVisible: false });
      });

    return () => selection.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
