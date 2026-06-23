import type { Range } from '@platejs/plite';

import { type PlateEditor, useEditorRef } from 'platejs/react';
import { useEffect } from 'react';

import type { TPlatePlaywrightAdapter } from './types';

const EDITABLE_TO_EDITOR = new WeakMap<HTMLElement, PlateEditor>();
const PLITE_BROWSER_HANDLE_KEY = '__pliteBrowserHandle';

type PlatePlaywrightBrowserHandle = {
  deleteBackward: () => void;
  deleteForward: () => void;
  deleteFragment: () => void;
  focus: () => void;
  getBlockText: (index: number) => string | null;
  getBlockTexts: () => string[];
  getHistory: () => unknown;
  getKernelTrace: () => unknown[];
  getLastCommit: () => unknown | null;
  getSelection: () => Range | null;
  getText: () => string;
  insertBreak: () => void;
  insertText: (text: string) => void;
  redo: () => void;
  selectAll: () => void;
  selectRange: (selection: Range) => void;
  undo: () => void;
};

type PlatePlaywrightBrowserHandleElement = HTMLElement & {
  [PLITE_BROWSER_HANDLE_KEY]?: PlatePlaywrightBrowserHandle;
};

type PlateEditorWithHistory = PlateEditor & {
  history?: unknown;
  redo?: () => void;
  undo?: () => void;
};

const getNodeText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return '';

  if ('text' in node && typeof node.text === 'string') {
    return node.text;
  }

  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(getNodeText).join('');
  }

  return '';
};

const getRootText = (editor: PlateEditor) =>
  editor.children.map(getNodeText).join('\n');

const getBlockTexts = (editor: PlateEditor) => editor.children.map(getNodeText);

const createPliteBrowserHandle = (
  editor: PlateEditor
): PlatePlaywrightBrowserHandle => {
  const historyEditor = editor as PlateEditorWithHistory;

  return {
    deleteBackward: () => {
      editor.update((tx) => {
        tx.text.deleteBackward({ unit: 'character' });
      });
    },
    deleteForward: () => {
      editor.update((tx) => {
        tx.text.deleteForward({ unit: 'character' });
      });
    },
    deleteFragment: () => {
      editor.update((tx) => {
        tx.fragment.delete();
      });
    },
    focus: () => {
      editor.api.dom.focus();
    },
    getBlockText: (index) => getBlockTexts(editor)[index] ?? null,
    getBlockTexts: () => getBlockTexts(editor),
    getHistory: () => historyEditor.history ?? null,
    getKernelTrace: () => [],
    getLastCommit: () => null,
    getSelection: () => editor.selection,
    getText: () => getRootText(editor),
    insertBreak: () => {
      editor.update((tx) => {
        tx.break.insert();
      });
    },
    insertText: (text) => {
      editor.update((tx) => {
        tx.text.insert(text);
      });
    },
    redo: () => {
      historyEditor.redo?.();
    },
    selectAll: () => {
      editor.update((tx) => {
        tx.selection.set(editor.api.range([])!);
      });
    },
    selectRange: (selection) => {
      editor.update((tx) => {
        tx.selection.set(selection);
      });
    },
    undo: () => {
      historyEditor.undo?.();
    },
  };
};

const platePlaywrightAdapter: TPlatePlaywrightAdapter = {
  EDITABLE_TO_EDITOR,
  getNode: (editor, path) => editor.api.node(path)?.[0],
};

export const usePlaywrightAdapter = () => {
  const editor = useEditorRef();

  useEffect(() => {
    window.platePlaywrightAdapter = platePlaywrightAdapter;

    const editable = editor.api.dom.resolveDOMNode(editor)!;
    EDITABLE_TO_EDITOR.set(editable, editor);
    const browserHandleElement =
      editable as PlatePlaywrightBrowserHandleElement;
    const browserHandle = createPliteBrowserHandle(editor);

    browserHandleElement[PLITE_BROWSER_HANDLE_KEY] = browserHandle;

    return () => {
      EDITABLE_TO_EDITOR.delete(editable);

      if (browserHandleElement[PLITE_BROWSER_HANDLE_KEY] === browserHandle) {
        browserHandleElement[PLITE_BROWSER_HANDLE_KEY] = undefined;
      }
    };
  }, [editor]);

  return null;
};
