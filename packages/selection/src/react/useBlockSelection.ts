import React, { useMemo } from 'react';

import { getFragmentProp, type GetFragmentPropOptions } from '@platejs/core';
import type { NormalizePluginState } from '@platejs/core/internal';
import {
  useEditor,
  useEditorPlugin,
  useEditorSelector,
  usePluginStore,
} from '@platejs/core/react';
import { useElementContext } from '@platejs/core/react/internal';
import {
  type Element,
  ElementApi,
  type Path,
  type NodeKey,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import {
  type PartialSelectionAreaOptions,
  type SelectionAreaSelectables,
  SelectionArea,
  type SelectionAreaTarget,
  type SelectionAreaTrigger,
} from '../SelectionArea';
import { BlockSelectionPlugin } from './BlockSelectionPlugin';

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

export const useBlockSelected = (key?: NodeKey) => {
  const editor = useEditor();
  const element = useElementContext()?.element;
  const nodeKey = key ?? (element ? editor.key(element) : undefined);

  return usePluginStore(BlockSelectionPlugin, 'isSelected', nodeKey);
};

export function useBlockSelectionNodes() {
  const editor = useEditor();
  const selectedKeys = usePluginStore(BlockSelectionPlugin, 'selectedKeys');

  return useMemo(
    () =>
      editor.read.nodes.toArray({
        at: [],
        match: (node): node is Element =>
          ElementApi.isElement(node) && selectedKeys.has(editor.key(node)!),
      }),
    [editor, selectedKeys]
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
  const isSelectingSome = usePluginStore(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectionExpanded = useEditorSelector((editor) =>
    editor.read.selection.isExpanded()
  );

  return selectionExpanded || isSelectingSome;
};

const toMutableSelectionTargets = (
  value: readonly SelectionAreaTarget[] | SelectionAreaTarget | undefined
): SelectionAreaTarget[] | SelectionAreaTarget | undefined =>
  value === undefined
    ? undefined
    : typeof value === 'string' || value instanceof HTMLElement
      ? value
      : Array.from(value);

const toMutableSelectables = (
  value: SelectionAreaSelectables | undefined
): (() => HTMLElement[]) | string[] | string | undefined =>
  value === undefined ||
  typeof value === 'function' ||
  typeof value === 'string'
    ? value
    : Array.from(value);

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
  selectables: toMutableSelectables(options?.selectables),
  startAreas: toMutableSelectionTargets(options?.startAreas),
});

export const useSelectionArea = (selectionAreaElement?: HTMLElement | null) => {
  const editor = useEditor();
  const { api, store } = useEditorPlugin(BlockSelectionPlugin);
  const { areaOptions } = store.get();
  const areaRef = React.useRef({ keys: new Set<NodeKey>() });
  const trsRef = React.useRef({ keys: new Set<NodeKey>() });

  React.useEffect(() => {
    const onStart = () => {
      if (editor.read.view.isFocused()) editor.api.dom.blur();
      if (editor.read.selection()) editor.update.selection.clear();

      store.set({ isSelectionAreaVisible: true });
    };
    const selectionAreaOptions = toMutableSelectionAreaOptions(areaOptions);
    const editable = editor.api.dom.editable();
    const defaultTarget = editable ?? `#${editor.id}`;
    const defaultContainer = editor.api.dom.scroll?.() ?? defaultTarget;
    const selection = new SelectionArea({
      document: window.document,
      selectionAreaClass: 'plite-selection-area',
      selectionAreaElement: selectionAreaElement ?? undefined,
      ...selectionAreaOptions,
      boundaries: selectionAreaOptions.boundaries ?? defaultTarget,
      container: selectionAreaOptions.container ?? defaultContainer,
      selectables:
        selectionAreaOptions.selectables ??
        (editable
          ? () =>
              Array.from(
                editable.querySelectorAll<HTMLElement>('.plite-selectable')
              )
          : `#${editor.id} .plite-selectable`),
      startAreas: selectionAreaOptions.startAreas ?? defaultTarget,
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

        const getBlockByNodeKey = (nodeKey: NodeKey) =>
          editor.read.nodes.get(nodeKey, {
            match: ElementApi.isElement,
          });

        if (changed.added.length > 0 || changed.removed.length > 0) {
          const next = new Set(store.get().selectedKeys);

          changed.removed.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;

            const nodeKey = element.dataset.pliteNodeKey as NodeKey | undefined;

            if (!nodeKey) return;

            next.delete(nodeKey);
            areaRef.current.keys.delete(nodeKey);
          });

          changed.added.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;

            const nodeKey = element.dataset.pliteNodeKey as NodeKey | undefined;

            if (!nodeKey) return;

            const block = getBlockByNodeKey(nodeKey);

            if (!block || block[0].type === 'table') return;

            if (block[1].length === 1) {
              next.add(nodeKey);
              areaRef.current.keys.add(nodeKey);
              return;
            }

            const hasAncestor = editor.read.nodes.above({
              at: block[1],
              match: (node): node is Element =>
                ElementApi.isElement(node) &&
                areaRef.current.keys.has(editor.key(node)!),
            });

            if (!hasAncestor) {
              next.add(nodeKey);
              areaRef.current.keys.add(nodeKey);
            }
          });

          store.set({ selectedKeys: next });
        }

        const storedKeys = store.get('selectedKeys');
        const next = new Set<NodeKey>(
          storedKeys instanceof Set ? storedKeys : []
        );
        const keys = [...next];
        const table = editor.plugin(PLUGINS.table);
        const tableRow = editor.plugin(PLUGINS.tableRow);
        const tableCell = editor.plugin(PLUGINS.tableCell);
        const tableTypes = [table, tableRow, tableCell]
          .filter((plugin) => plugin.installed)
          .map((plugin) => plugin.schema.type);
        const tableType = table.installed ? table.schema.type : undefined;
        const isTableOnlySelection =
          tableTypes.length > 0 &&
          keys.every((key) => {
            const block = getBlockByNodeKey(key);

            if (!block) return false;
            if (block[1].length >= 3) return true;

            return tableTypes.includes(block[0].type);
          });

        if (isTableOnlySelection) {
          keys.some((key) => {
            const block = getBlockByNodeKey(key);

            if (!block || block[0].type !== tableType) return false;

            next.delete(key);
            trsRef.current.keys.forEach((rowKey) => {
              next.add(rowKey);
            });
            trsRef.current.keys.clear();

            return true;
          });
        } else {
          keys.some((key) => {
            const block = getBlockByNodeKey(key);

            if (
              !block ||
              ![tableRow, tableCell].some(
                (plugin) =>
                  plugin.installed && plugin.schema.type === block[0].type
              )
            )
              return false;

            const table = editor.read.nodes.above({
              at: block[1],
              match: ElementApi.isElement,
            });

            if (!table) return false;
            const tableKey = editor.key(table[0]);

            if (!tableKey) return false;
            next.add(tableKey);
            table[0].children.forEach((row) => {
              if (!ElementApi.isElement(row)) return;
              const rowKey = editor.key(row);

              if (rowKey && next.has(rowKey)) {
                trsRef.current.keys.add(rowKey);
                next.delete(rowKey);
              }
            });

            return true;
          });
        }

        store.set({ selectedKeys: next });
      })
      .on('stop', () => {
        areaRef.current = { keys: new Set() };
        trsRef.current = { keys: new Set() };
        store.set({ isSelectionAreaVisible: false });
      });

    return () => selection.destroy();
    // The selection engine owns one lifecycle per mounted editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionAreaElement]);
};
