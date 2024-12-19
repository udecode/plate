import React from 'react';

import {
  findPath,
  focusEditor,
  toDOMNode,
  toSlateNode,
  useEditorReadOnly,
  useEditorRef,
} from '@udecode/plate-common/react';
import { Path } from 'slate';
import { tabbable } from 'tabbable';

import type { TabbableEntry } from '../lib/types';

import { BaseTabbablePlugin } from '../lib/BaseTabbablePlugin';
import { findTabDestination } from '../lib/findTabDestination';

export function TabbableEffects() {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();

  React.useEffect(() => {
    if (readOnly) return;

    const { globalEventListener, insertTabbableEntries, isTabbable, query } =
      editor.getOptions(BaseTabbablePlugin);

    const editorDOMNode = toDOMNode(editor, editor);

    if (!editorDOMNode) return;

    const handler = (event: KeyboardEvent) => {
      // Check if the keydown is a tab key that should be handled
      if (event.key !== 'Tab' || event.defaultPrevented || !query?.(event)) {
        return;
      }

      /**
       * Get the list of additional tabbable entries specified in the plugin
       * options
       */
      const insertedTabbableEntries = insertTabbableEntries?.(
        event
      ) as TabbableEntry[];

      /**
       * Global event listener only. Do not handle the tab event if the keydown
       * was sent to an element other than the editor or one of the additional
       * tabbable elements.
       */
      if (
        globalEventListener &&
        event.target &&
        ![
          editorDOMNode,
          ...insertedTabbableEntries.map(({ domNode }) => domNode),
        ].some((container) => container.contains(event.target as Node))
      ) {
        return;
      }

      // Get all tabbable DOM nodes in the editor
      const tabbableDOMNodes = tabbable(editorDOMNode) as HTMLElement[];

      /**
       * Construct a tabbable entry for each tabbable Slate node, filtered by
       * the `isTabbable` option (defaulting to only void nodes).
       */
      const defaultTabbableEntries = tabbableDOMNodes
        .map((domNode) => {
          const slateNode = toSlateNode(editor, domNode);

          if (!slateNode) return;

          return {
            domNode,
            path: findPath(editor, slateNode),
            slateNode,
          } as TabbableEntry;
        })
        .filter((entry) => entry && isTabbable?.(entry)) as TabbableEntry[];

      /**
       * The list of all tabbable entries. Sorting by path ensures a consistent
       * tab order.
       */
      const tabbableEntries = [
        ...insertedTabbableEntries,
        ...defaultTabbableEntries,
      ].sort((a, b) => Path.compare(a.path, b.path));

      /**
       * TODO: Refactor everything ABOVE this line into a util function and test
       * separately
       */

      // Check if any tabbable entry is the active element
      const { activeElement } = document;
      const activeTabbableEntry =
        (activeElement &&
          tabbableEntries.find((entry) => entry.domNode === activeElement)) ??
        null;

      // Find the next Slate node or DOM node to focus
      const tabDestination = findTabDestination(editor, {
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
            focusEditor(editor, {
              anchor: { offset: 0, path: tabDestination.path },
              focus: { offset: 0, path: tabDestination.path },
            });

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
        const oldTabIndex = domNode.getAttribute('tabindex');
        domNode.setAttribute('tabindex', '-1');

        setTimeout(() => {
          if (oldTabIndex) {
            domNode.setAttribute('tabindex', oldTabIndex);
          } else {
            domNode.removeAttribute('tabindex');
          }
        }, 0);
      });
    };

    const eventListenerNode = globalEventListener
      ? document.body
      : editorDOMNode;

    eventListenerNode.addEventListener('keydown', handler, true);

    return () =>
      eventListenerNode.removeEventListener('keydown', handler, true);
  }, [readOnly, editor]);

  return null;
}
