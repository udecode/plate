import React from 'react';
import ReactDOM from 'react-dom';

import { isHotkey } from '@platejs/core';
import type { NormalizePluginState } from '@platejs/core/internal';
import {
  type EditableSiblingComponent,
  useEditor,
  useEditorPlugin,
  usePluginStore,
} from '@platejs/core/react';
import { type Element, ElementApi, type NodeKey } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import {
  type PartialSelectionAreaOptions,
  type SelectionAreaSelectables,
  SelectionArea,
  type SelectionAreaTarget,
  type SelectionAreaTrigger,
} from '../SelectionArea';
import { BlockSelectionPlugin } from './BlockSelectionPlugin';

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

const useSelectionArea = (selectionAreaElement?: HTMLElement | null) => {
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

export const BlockSelectionAfterEditable: EditableSiblingComponent = () => {
  const editor = useEditor();
  const { api, store, update } = useEditorPlugin(BlockSelectionPlugin);
  const [selectionAreaElement, setSelectionAreaElement] =
    React.useState<HTMLDivElement | null>(null);
  const isSelectingSome = usePluginStore(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  useSelectionArea(selectionAreaElement);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    store.set({ shadowInputRef: inputRef });

    return () => {
      setIsMounted(false);
    };
  }, [store]);

  React.useEffect(() => {
    if (!isSelectingSome) store.set({ anchorKey: null });
  }, [isSelectingSome, store]);

  React.useEffect(() => {
    if (isSelectingSome) {
      inputRef.current?.focus({ preventScroll: true });
    } else {
      inputRef.current?.blur();
    }
  }, [isSelectingSome]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isReadonly = editor.read.view.isReadOnly();
      store.get().onKeyDownSelecting?.(editor, event.nativeEvent);

      if (!store.get('isSelectingSome')) return;
      if (isHotkey('shift+up')(event)) {
        event.preventDefault();
        event.stopPropagation();
        api.shiftSelection('up');
        return;
      }
      if (isHotkey('shift+down')(event)) {
        event.preventDefault();
        event.stopPropagation();
        api.shiftSelection('down');
        return;
      }
      if (isHotkey('escape')(event)) {
        api.deselect();
        return;
      }
      if (isHotkey('mod+z')(event)) {
        editor.update.history.undo();
        api.selectInserted();
        return;
      }
      if (isHotkey('mod+a')(event)) {
        api.selectAll();
        return;
      }
      if (isHotkey('mod+shift+z')(event)) {
        editor.update.history.redo();
        api.selectInserted();
        return;
      }
      if (isHotkey('mod+d')(event)) {
        event.preventDefault();
        update.duplicate();
        return;
      }
      if (isHotkey('enter')(event)) {
        const selectedKeys = store.get('selectedKeys');
        let handled = false;

        editor.update((tx, { afterCommit }) => {
          const entry = tx.nodes.find({
            at: [],
            match: (node) =>
              ElementApi.isElement(node) &&
              tx.schema.isBlock(node) &&
              selectedKeys.has(tx.key(node)!),
          });

          if (!entry) return;

          const end = tx.points.end(entry[1]);

          if (!end) return;

          tx.selection.set(end);
          handled = true;
          afterCommit(() => editor.api.dom.focus());
        });

        if (handled) event.preventDefault();
        return;
      }
      if (isHotkey(['backspace', 'delete'])(event) && !isReadonly) {
        event.preventDefault();
        update.removeNodes({
          selectPrevious: isHotkey('backspace')(event),
        });
        return;
      }
      if (isHotkey('up')(event)) {
        event.preventDefault();
        event.stopPropagation();
        api.moveSelection('up');
        return;
      }
      if (isHotkey('down')(event)) {
        event.preventDefault();
        event.stopPropagation();
        api.moveSelection('down');
        return;
      }
      if (
        !isReadonly &&
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        update.removeNodes({ insertText: event.key });
      }
    },
    [api, editor, store, update]
  );

  const handleCopy = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      if (!store.get('isSelectingSome')) return;

      if (api.copy(event.clipboardData)) event.preventDefault();
    },
    [api, store]
  );

  const handleCut = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      if (!store.get('isSelectingSome')) return;

      const copied = api.copy(event.clipboardData);

      if (copied) event.preventDefault();
      if (copied && !editor.read.view.isReadOnly()) update.removeNodes();
    },
    [api, editor, store, update]
  );

  const handlePaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();

      if (!editor.read.view.isReadOnly()) {
        update.paste(event.clipboardData);
      }
    },
    [editor, update]
  );

  return (
    <>
      {isMounted &&
        typeof window !== 'undefined' &&
        ReactDOM.createPortal(
          <div
            ref={setSelectionAreaElement}
            aria-hidden
            className="plite-selection-area"
            data-slot="block-selection-area"
            style={{
              pointerEvents: 'none',
              position: 'fixed',
              willChange: 'top, left, bottom, right, width, height',
            }}
          />,
          document.body
        )}
      {isMounted &&
        typeof window !== 'undefined' &&
        ReactDOM.createPortal(
          <input
            ref={inputRef}
            className="plite-shadow-input"
            style={{
              left: '-300px',
              opacity: 0,
              position: 'fixed',
              top: '-300px',
            }}
            onCopy={handleCopy}
            onCut={handleCut}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />,
          document.body
        )}
    </>
  );
};
