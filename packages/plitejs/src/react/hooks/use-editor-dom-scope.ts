import { useCallback, useSyncExternalStore } from 'react';

import type { Editor, NamedRootKey, RootKey } from '../..';
import type { DOMApi } from '../../dom';
import {
  setEditorDOMScrollElement,
  subscribeEditorDOMScope,
} from '../../dom/internal';

type DOMScopeEditor = Editor<any, any> & {
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

/** Return the element Plite should treat as the editor scroll container. */
export const useEditorScrollElement = (editor: DOMScopeEditor) =>
  useEditorDOMScopeElement(
    editor,
    useCallback(() => editor.api.dom.scroll(), [editor])
  );

/** Register a host scroll container for Plite DOM work. */
export const useEditorScrollElementRef = (editor: DOMScopeEditor) =>
  useCallback(
    (element: HTMLElement | null) => {
      setEditorDOMScrollElement(editor, element);
    },
    [editor]
  );
