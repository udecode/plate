import React, { useMemo, useSyncExternalStore } from 'react';

import { getFragmentProp, type GetFragmentPropOptions } from '@platejs/core';
import type { NormalizePluginState } from '@platejs/core/internal';
import {
  useEditor,
  useEditorPlugin,
  useEditorSelector,
} from '@platejs/core/react';
import { useElementContext } from '@platejs/core/react/internal';
import { type Element, ElementApi, type Path } from '@platejs/plite';

import {
  type PartialSelectionAreaOptions,
  SelectionArea,
  type SelectionAreaTarget,
  type SelectionAreaTrigger,
} from '../SelectionArea';
import { BlockSelectionPlugin } from './BlockSelectionPlugin';

const EMPTY_SELECTED_IDS = new Set<string>();

export const useBlockSelectable = ({
  element: elementProp,
  path: pathProp,
}: {
  element?: Element;
  path?: Path;
} = {}) => {
  const elementContext = useElementContext();
  const element = elementProp ?? elementContext?.element;
  const path = pathProp ?? elementContext?.path;
  const { api } = useEditorPlugin(BlockSelectionPlugin);

  return {
    props:
      element && path && api.isSelectable(element, path)
        ? {
            className: 'plite-selectable',
            onContextMenu: (
              event: React.MouseEvent<HTMLDivElement, MouseEvent>
            ) => api.addOnContextMenu({ element, event }),
          }
        : {},
  };
};

export const useBlockSelected = (id?: string) => {
  const element = useElementContext()?.element;
  const blockSelection = useEditorPlugin(BlockSelectionPlugin);
  const selectedIds = useSyncExternalStore(
    blockSelection.store.subscribe,
    () => blockSelection.store.get('selectedIds'),
    () => EMPTY_SELECTED_IDS
  );
  const blockId =
    id ?? (typeof element?.id === 'string' ? element.id : undefined);

  return typeof blockId === 'string' && selectedIds.has(blockId);
};

export function useBlockSelectionNodes() {
  const editor = useEditor();
  const blockSelection = useEditorPlugin(BlockSelectionPlugin);
  const selectedIds = useSyncExternalStore(
    blockSelection.store.subscribe,
    () => blockSelection.store.get('selectedIds'),
    () => EMPTY_SELECTED_IDS
  );

  return useMemo(
    () =>
      editor.read.nodes.toArray<Element>({
        at: [],
        match: (node) =>
          ElementApi.isElement(node) &&
          typeof node.id === 'string' &&
          selectedIds.has(node.id),
      }),
    [editor, selectedIds]
  );
}

export function useBlockSelectionFragment() {
  const nodes = useBlockSelectionNodes();

  return useMemo(() => nodes.map(([node]) => node), [nodes]);
}

export function useBlockSelectionFragmentProp(
  options?: GetFragmentPropOptions
) {
  const fragment = useBlockSelectionFragment();

  return useMemo(() => getFragmentProp(fragment, options), [fragment, options]);
}

export const useIsSelecting = () => {
  const blockSelection = useEditorPlugin(BlockSelectionPlugin);
  const isSelectingSome = useSyncExternalStore(
    blockSelection.store.subscribe,
    () => blockSelection.store.get('isSelectingSome'),
    () => false
  );
  const selectionExpanded = useEditorSelector((editor) =>
    editor.read.selection.isExpanded()
  );

  return selectionExpanded || isSelectingSome;
};

function toMutableSelectionTargets(
  value: readonly string[] | string | undefined
): string[] | string | undefined;
function toMutableSelectionTargets(
  value: readonly SelectionAreaTarget[] | SelectionAreaTarget | undefined
): SelectionAreaTarget[] | SelectionAreaTarget | undefined;
function toMutableSelectionTargets(
  value: readonly SelectionAreaTarget[] | SelectionAreaTarget | undefined
) {
  return value === undefined
    ? undefined
    : typeof value === 'string' || value instanceof HTMLElement
      ? value
      : Array.from(value);
}

const toMutableSelectionAreaOptions = (
  options: NormalizePluginState<PartialSelectionAreaOptions> | undefined
): PartialSelectionAreaOptions => ({
  ...options,
  behaviour: options?.behaviour
    ? {
        ...options.behaviour,
        triggers: options.behaviour.triggers?.map(
          (
            trigger: NormalizePluginState<SelectionAreaTrigger>
          ): SelectionAreaTrigger =>
            typeof trigger === 'number'
              ? trigger === 0 ||
                trigger === 1 ||
                trigger === 2 ||
                trigger === 3 ||
                trigger === 4
                ? trigger
                : 0
              : { ...trigger, modifiers: [...trigger.modifiers] }
        ),
      }
    : undefined,
  boundaries: toMutableSelectionTargets(options?.boundaries),
  container: toMutableSelectionTargets(options?.container),
  selectables: toMutableSelectionTargets(options?.selectables),
  startAreas: toMutableSelectionTargets(options?.startAreas),
});

export const useSelectionArea = () => {
  const { api, editor, store } = useEditorPlugin(BlockSelectionPlugin);
  const { areaOptions } = store.get();
  const areaRef = React.useRef({ ids: new Set<string>() });
  const trsRef = React.useRef({ ids: new Set<string>() });

  React.useEffect(() => {
    const onStart = () => {
      if (editor.read.view.isFocused()) editor.api.dom.blur();
      if (editor.read.selection()) editor.update.selection.clear();

      store.set({ isSelectionAreaVisible: true });
    };
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
        if (!store.get().isSelectionAreaVisible) onStart();

        if (changed.added.length > 0 || changed.removed.length > 0) {
          const next = new Set(store.get().selectedIds);

          changed.removed.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;

            const { blockId } = element.dataset;

            if (!blockId) return;

            next.delete(blockId);
            areaRef.current.ids.delete(blockId);
          });

          changed.added.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;

            const { blockId } = element.dataset;

            if (!blockId) return;

            const block = editor.read.nodes.block({
              at: [],
              match: { id: blockId },
            });

            if (!block || block[0].type === 'table') return;

            if (block[1].length === 1) {
              next.add(blockId);
              areaRef.current.ids.add(blockId);
              return;
            }

            const hasAncestor = editor.read.nodes.above({
              at: block[1],
              match: (node) =>
                ElementApi.isElement(node) &&
                typeof node.id === 'string' &&
                areaRef.current.ids.has(node.id),
            });

            if (!hasAncestor) {
              next.add(blockId);
              areaRef.current.ids.add(blockId);
            }
          });

          store.set({ selectedIds: next });
        }

        const storedIds = store.get('selectedIds');
        const next = new Set<string>(
          storedIds instanceof Set
            ? [...storedIds].filter(
                (id): id is string => typeof id === 'string'
              )
            : []
        );
        const ids = [...next];
        const getBlockById = (id: string) =>
          editor.read.nodes.block({ at: [], match: { id } });
        const isTableOnlySelection = ids.every((id) => {
          const block = getBlockById(id);

          if (!block) return false;
          if (block[1].length >= 3) return true;

          return ['table', 'tr', 'th'].includes(block[0].type);
        });

        if (isTableOnlySelection) {
          ids.some((id) => {
            const block = getBlockById(id);

            if (!block || block[0].type !== 'table') return false;

            next.delete(id);
            trsRef.current.ids.forEach((rowId) => {
              next.add(rowId);
            });
            trsRef.current.ids.clear();

            return true;
          });
        } else {
          ids.some((id) => {
            const block = getBlockById(id);

            if (!block || !['tr', 'th'].includes(block[0].type)) return false;

            const table = editor.read.nodes.above<Element>({
              at: block[1],
              match: (node) => ElementApi.isElement(node),
            });

            if (!table || typeof table[0].id !== 'string') return false;

            next.add(table[0].id);
            table[0].children.forEach((row) => {
              if (
                ElementApi.isElement(row) &&
                typeof row.id === 'string' &&
                next.has(row.id)
              ) {
                trsRef.current.ids.add(row.id);
                next.delete(row.id);
              }
            });

            return true;
          });
        }

        store.set({ selectedIds: next });
      })
      .on('stop', () => {
        areaRef.current = { ids: new Set() };
        trsRef.current = { ids: new Set() };
        store.set({ isSelectionAreaVisible: false });
      });

    return () => selection.destroy();
    // The selection engine owns one lifecycle per mounted editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
