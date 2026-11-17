import { useCallback, useSyncExternalStore } from 'react';

import type { NamedRootKey, RootKey } from '../..';
import type { DOMApi } from '../../dom';
import {
  getEditorDOMHostScrollElement,
  setEditorDOMScrollElement,
  subscribeEditorDOMScope,
} from '../../dom/internal';

type DOMScopeEditor = {
  api: {
    dom: Pick<DOMApi, 'editable' | 'root' | 'scroll'>;
  };
};

const getServerSnapshot = () => null;

const useEditorDOMScopeElement = (
  editor: DOMScopeEditor,
  readElement: () => HTMLElement | null
) =>
  useSyncExternalStore(
    useCallback(
      (listener) => subscribeEditorDOMScope(editor, listener),
      [editor]
    ),
    readElement,
    getServerSnapshot
  );

/** Return the mounted editable element for a Plite root. */
export const useEditorEditableElement = <const TRoot extends RootKey = RootKey>(
  editor: DOMScopeEditor,
  root?: NamedRootKey<TRoot>
) =>
  useEditorDOMScopeElement(
    editor,
    useCallback(() => editor.api.dom.editable(root), [editor, root])
  );

/** Return the mounted editor root element. */
export const useEditorRootElement = (editor: DOMScopeEditor) =>
  useEditorDOMScopeElement(
    editor,
    useCallback(() => editor.api.dom.root(), [editor])
  );

/** Return the editor scroll container element. */
export const useEditorScrollElement = (editor: DOMScopeEditor) =>
  useEditorDOMScopeElement(
    editor,
    useCallback(() => editor.api.dom.scroll(), [editor])
  );

export const useEditorHostScrollElement = (editor: DOMScopeEditor) =>
  useEditorDOMScopeElement(
    editor,
    useCallback(() => getEditorDOMHostScrollElement(editor), [editor])
  );

/**
 * Register the element that scrolls the editor, such as a page's scrolling
 * `main`. Every editor of the document returns it from
 * `editor.api.dom.scroll()`, and virtualized editables follow its scroll. A
 * `fallback` registration applies only while no other element is registered.
 */
export const useEditorScrollElementRef = (
  editor: DOMScopeEditor,
  { fallback = false }: { fallback?: boolean } = {}
) =>
  useCallback(
    (element: HTMLElement | null) => {
      setEditorDOMScrollElement(editor, element, { fallback });
    },
    [editor, fallback]
  );
