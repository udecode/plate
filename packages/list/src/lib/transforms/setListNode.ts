import type { EditorUpdateTransaction, Path } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { normalizeListSequence } from '../normalizers/normalizeListSequence';
import { ListStyleType } from '../types';

type ListNodeTx = {
  nodes: Pick<EditorUpdateTransaction['nodes'], 'set'>;
};

export const setListNodeTx = (
  tx: ListNodeTx,
  {
    at,
    indent = 0,
    listStyleType = ListStyleType.Disc,
  }: {
    at: Path;
    indent?: number;
    listStyleType?: string;
  }
) => {
  const newIndent = indent || indent + 1;

  tx.nodes.set(
    {
      [KEYS.indent]: newIndent,
      [KEYS.listType]: listStyleType,
    },
    { at }
  );
};

export const setListNode = (
  editor: BasePlateEditor,
  {
    at,
    indent = 0,
    listStyleType = ListStyleType.Disc,
  }: {
    at: Path;
    indent?: number;
    listStyleType?: string;
  }
) => {
  editor.update((tx) => {
    setListNodeTx(tx, { at, indent, listStyleType });
  });
  normalizeListSequence(editor, at);
};

export const setIndentTodoNodeTx = (
  tx: ListNodeTx,
  {
    at,
    indent = 0,
    listStyleType = KEYS.listTodo,
  }: {
    at: Path;
    indent?: number;
    listStyleType?: string;
  }
) => {
  const newIndent = indent || indent + 1;

  tx.nodes.set(
    {
      [KEYS.indent]: newIndent,
      [KEYS.listChecked]: false,
      [KEYS.listType]: listStyleType,
    },
    { at }
  );
};

export const setIndentTodoNode = (
  editor: BasePlateEditor,
  {
    at,
    indent = 0,
    listStyleType = KEYS.listTodo,
  }: {
    at: Path;
    indent?: number;
    listStyleType?: string;
  }
) => {
  editor.update((tx) => {
    setIndentTodoNodeTx(tx, { at, indent, listStyleType });
  });
  normalizeListSequence(editor, at);
};
