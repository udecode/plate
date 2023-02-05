import { useEffect } from 'react';
import {
  findNodePath,
  focusEditor,
  getPluginOptions,
  toDOMNode,
  toSlateNode,
  useEditorState,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { tabbable } from 'tabbable';
import { KEY_TABBABLE } from './constants';
import { findTabDestination } from './findTabDestination';
import { TabbableEntry } from './types';

export const TabbableEffects = () => {
  const editor = useEditorState();
  const {
    query,
    globalEventListener,
    insertTabbableEntries,
    isTabbable,
  } = getPluginOptions(editor, KEY_TABBABLE);

  useEffect(() => {
    const editorDOMNode = toDOMNode(editor, editor);
    if (!editorDOMNode) return;

    const handler = (event: KeyboardEvent) => {
      if (
        event.key !== 'Tab' ||
        event.defaultPrevented ||
        !query(editor, event)
      )
        return;

      const insertedTabbableEntries = insertTabbableEntries(
        editor,
        event
      ) as TabbableEntry[];

      if (
        globalEventListener &&
        event.target &&
        ![
          editorDOMNode,
          ...insertedTabbableEntries.map(({ domNode }) => domNode),
        ].some((container) => container.contains(event.target as Node))
      )
        return;

      const tabbableDOMNodes = tabbable(editorDOMNode) as HTMLElement[];

      const defaultTabbableEntries = tabbableDOMNodes
        .map((domNode) => {
          const slateNode = toSlateNode(editor, domNode);
          if (!slateNode) return;
          return {
            domNode,
            slateNode,
            path: findNodePath(editor, slateNode),
          } as TabbableEntry;
        })
        .filter(
          (entry) => entry && isTabbable(editor, entry)
        ) as TabbableEntry[];

      const tabbableEntries = [
        ...insertedTabbableEntries,
        ...defaultTabbableEntries,
      ].sort((a, b) => Path.compare(a.path, b.path));

      const { activeElement } = document;
      const activeTabbableEntry =
        (activeElement &&
          tabbableEntries.find((entry) => entry.domNode === activeElement)) ??
        null;

      const tabDestination = findTabDestination(editor, {
        tabbableEntries,
        activeTabbableEntry,
        direction: event.shiftKey ? 'backward' : 'forward',
      });

      if (tabDestination) {
        event.preventDefault();

        switch (tabDestination.type) {
          case 'path':
            focusEditor(editor, {
              anchor: { path: tabDestination.path, offset: 0 },
              focus: { path: tabDestination.path, offset: 0 },
            });
            break;

          case 'dom-node':
            tabDestination.domNode.focus();
            break;
        }

        return;
      }

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
  }, [editor, globalEventListener, isTabbable, insertTabbableEntries, query]);

  return null;
};
