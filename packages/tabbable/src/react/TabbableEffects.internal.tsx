import {
  useEditorReadOnly,
  useEditor,
  usePluginStore,
} from '@platejs/core/react';
import { PathApi } from '@platejs/plite';
import React from 'react';
import { tabbable } from 'tabbable';

import type { TabbableEntry } from '../lib/TabbablePluginTypes';
import { TabbablePlugin } from './TabbablePlugin';

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
      const { insertTabbableEntries, isTabbable, query } = editor
        .plugin(TabbablePlugin)
        .store.get();

      // Check if the keydown is a tab key that should be handled
      if (event.key !== 'Tab' || event.defaultPrevented || !query?.(event)) {
        return;
      }

      /**
       * Get the list of additional tabbable entries specified in the plugin
       * options
       */
      const insertedTabbableEntries = insertTabbableEntries?.(event) ?? [];

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
        const slateNode = editor.api.dom.resolvePliteNode(domNode);

        if (!slateNode) return [];

        const path = editor.api.dom.resolvePath(slateNode);

        if (!path) return [];

        const entry: TabbableEntry = {
          domNode,
          path,
          slateNode,
        };

        return isTabbable?.(entry) ? [entry] : [];
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
      const { activeElement } = document;
      const activeTabbableEntry =
        (activeElement &&
          tabbableEntries.find((entry) => entry.domNode === activeElement)) ??
        null;

      // Find the next Slate node or DOM node to focus
      const tabDestination = editor
        .plugin(TabbablePlugin)
        .read.findDestination({
          activeTabbableEntry,
          direction: event.shiftKey ? 'backward' : 'forward',
          tabbableEntries,
        });

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
