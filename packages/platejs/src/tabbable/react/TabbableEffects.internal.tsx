import React from 'react';
import { isTabbable as isTabbableElement, tabbable } from 'tabbable';

import { PathApi, type EditorStateView } from '../../core';
import { useEditorReadOnly, useEditor, usePluginStore } from '../../react/core';
import type { TabbableEntry } from '../lib/TabbablePluginTypes';
import { TabbablePlugin } from './TabbablePlugin';

export function findTabDestination(
  state: EditorStateView,
  {
    activeTabbableEntry,
    direction,
    tabbableEntries,
  }: {
    activeTabbableEntry: TabbableEntry | null;
    direction: 'backward' | 'forward';
    tabbableEntries: TabbableEntry[];
  }
):
  | { domNode: TabbableEntry['domNode']; type: 'dom-node' }
  | { path: TabbableEntry['path']; type: 'path' }
  | null {
  if (activeTabbableEntry) {
    const activeIndex = tabbableEntries.indexOf(activeTabbableEntry);
    const nextEntry =
      tabbableEntries[activeIndex + (direction === 'forward' ? 1 : -1)];

    if (nextEntry && PathApi.equals(activeTabbableEntry.path, nextEntry.path)) {
      return { domNode: nextEntry.domNode, type: 'dom-node' };
    }
    if (direction === 'forward') {
      const point = state.points.after(activeTabbableEntry.path);

      return point ? { path: point.path, type: 'path' } : null;
    }

    const point = state.points.get(activeTabbableEntry.path);

    return point ? { path: point.path, type: 'path' } : null;
  }

  const selection = state.selection();
  const selectedNodes = state.selection.nodes();
  const selectionPath =
    (direction === 'forward'
      ? selectedNodes.at(-1)?.[1]
      : selectedNodes[0]?.[1]) ??
    selection?.anchor.path ??
    [];
  const nextEntry =
    direction === 'forward'
      ? tabbableEntries.find(
          (entry) =>
            (PathApi.compare(entry.path, selectionPath) ||
              entry.path.length - selectionPath.length) >= 0
        )
      : [...tabbableEntries]
          .reverse()
          .find(
            (entry) =>
              (PathApi.compare(entry.path, selectionPath) ||
                entry.path.length - selectionPath.length) < 0
          );

  return nextEntry ? { domNode: nextEntry.domNode, type: 'dom-node' } : null;
}

type TabbableDOMNode = ReturnType<typeof tabbable>[number];

export function createTabIndexRestorationQueue() {
  const pending = new Map<
    TabbableDOMNode,
    { oldTabIndex: string | null; timeout: ReturnType<typeof setTimeout> }
  >();
  const restore = (domNode: TabbableDOMNode) => {
    const restoration = pending.get(domNode);

    if (!restoration) return;
    if (restoration.oldTabIndex !== null) {
      domNode.setAttribute('tabindex', restoration.oldTabIndex);
    } else {
      domNode.removeAttribute('tabindex');
    }
    pending.delete(domNode);
  };

  return {
    defer(domNode: TabbableDOMNode) {
      const pendingRestoration = pending.get(domNode);
      const oldTabIndex = pendingRestoration
        ? pendingRestoration.oldTabIndex
        : domNode.getAttribute('tabindex');

      if (pendingRestoration) clearTimeout(pendingRestoration.timeout);
      domNode.setAttribute('tabindex', '-1');

      const timeout = setTimeout(() => {
        restore(domNode);
      }, 0);
      pending.set(domNode, { oldTabIndex, timeout });
    },
    restoreAll() {
      for (const [domNode, { timeout }] of pending) {
        clearTimeout(timeout);
        restore(domNode);
      }
    },
  };
}

export function TabbableEffects() {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const globalEventListener = usePluginStore(
    TabbablePlugin,
    'globalEventListener'
  );

  React.useEffect(() => {
    if (readOnly) return undefined;

    const editorDOMNode = editor.api.dom.editable();

    if (!editorDOMNode) return undefined;

    const tabIndexRestorationQueue = createTabIndexRestorationQueue();

    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.defaultPrevented) return;

      const { insertTabbableEntries, isTabbable, query } = editor
        .plugin(TabbablePlugin)
        .store.get();
      const context = { editor, event };
      const { activeElement } = document;
      const focusInText = activeElement === editorDOMNode;

      if (focusInText && !query?.(context)) return;

      const toTabbableEntry = (domNode: TabbableDOMNode) => {
        const slateNode = editor.api.dom.resolveNode(domNode);

        if (!slateNode) return null;

        const path = editor.api.dom.resolvePath(slateNode);

        if (!path) return null;

        const entry: TabbableEntry = { domNode, path, slateNode };

        return isTabbable?.({ ...context, entry }) ? entry : null;
      };

      /**
       * Get the list of additional tabbable entries specified in the plugin
       * options
       */
      const insertedTabbableEntries = insertTabbableEntries?.(context) ?? [];

      /**
       * Clicking a control inside the editor keeps the old caret, so a Tab from
       * a stop Tabbable admits skips `query`, which would judge that caret.
       */
      const focusOnAdmittedStop =
        !focusInText &&
        (activeElement instanceof HTMLElement ||
          activeElement instanceof SVGElement) &&
        (insertedTabbableEntries.some(
          ({ domNode }) => domNode === activeElement
        ) ||
          (editorDOMNode.contains(activeElement) &&
            isTabbableElement(activeElement) &&
            toTabbableEntry(activeElement) !== null));

      if (!focusInText && !focusOnAdmittedStop && !query?.(context)) return;

      /**
       * Global event listener only. Do not handle the tab event if the keydown
       * was sent to an element other than the editor or one of the additional
       * tabbable elements.
       */
      const eventTarget = event.target;

      if (
        globalEventListener &&
        eventTarget instanceof Node &&
        ![
          editorDOMNode,
          ...insertedTabbableEntries.map(({ domNode }) => domNode),
        ].some((container) => container.contains(eventTarget))
      ) {
        return;
      }

      // Get all tabbable DOM nodes in the editor
      const tabbableDOMNodes = tabbable(editorDOMNode);

      /**
       * Construct a tabbable entry for each tabbable Slate node, filtered by
       * the `isTabbable` option (defaulting to only void nodes).
       */
      const defaultTabbableEntries = tabbableDOMNodes.flatMap((domNode) => {
        const entry = toTabbableEntry(domNode);

        return entry ? [entry] : [];
      });

      /**
       * The list of all tabbable entries. Sorting by path ensures a consistent
       * tab order.
       */
      const tabbableEntries = [
        ...insertedTabbableEntries,
        ...defaultTabbableEntries,
      ].sort(
        (a, b) =>
          PathApi.compare(a.path, b.path) || a.path.length - b.path.length
      );

      // Check if any tabbable entry is the active element
      const activeTabbableEntry =
        (activeElement &&
          tabbableEntries.find((entry) => entry.domNode === activeElement)) ??
        null;

      // Find the next Slate node or DOM node to focus
      const tabDestination = editor.read((state) =>
        findTabDestination(state, {
          activeTabbableEntry,
          direction: event.shiftKey ? 'backward' : 'forward',
          tabbableEntries,
        })
      );

      if (tabDestination) {
        event.preventDefault();

        switch (tabDestination.type) {
          case 'dom-node': {
            tabDestination.domNode.focus();

            break;
          }
          case 'path': {
            editor.update.selection.set({
              anchor: { offset: 0, path: tabDestination.path },
              focus: { offset: 0, path: tabDestination.path },
            });
            editor.api.dom.focus();

            break;
          }
        }

        return;
      }

      /**
       * There was no tab destination, so let the browser handle the tab event.
       * We don't want the browser to focus anything that could have been
       * focused by us, so we make make all tabbable DOM nodes in the editor
       * unfocusable. This ensures that the focus exits the editor cleanly.
       */
      tabbableDOMNodes.forEach((domNode) => {
        tabIndexRestorationQueue.defer(domNode);
      });
    };

    const eventListenerNode = globalEventListener
      ? document.body
      : editorDOMNode;

    eventListenerNode.addEventListener('keydown', handler, true);

    return () => {
      eventListenerNode.removeEventListener('keydown', handler, true);
      tabIndexRestorationQueue.restoreAll();
    };
  }, [editor, globalEventListener, readOnly]);

  return null;
}
