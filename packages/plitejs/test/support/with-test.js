import { ContentSlice } from 'plitejs';

import {
  getEditorRuntime,
  setEditorRuntime,
} from '../../src/core/editor-runtime';
import { repairEditorValue } from '../../src/core/public-state';

const initializedEditors = new WeakSet();

export const withTest = (editor) => {
  if (initializedEditors.has(editor)) {
    return editor;
  }

  initializedEditors.add(editor);

  return editor;
};

export const createFixtureTransactionApi = (editor, tx) => {
  const runtime = getEditorRuntime(editor);

  const api = {
    install: (extension) => editor.install(extension),
    fragment: tx.fragment,
    marks: tx.marks,
    nodes: tx.nodes,
    points: tx.points,
    ranges: tx.ranges,
    runtime: tx.runtime,
    schema: tx.schema,
    selection: tx.selection,
    slice: tx.slice,
    text: tx.text,
    value: tx.value,
    get children() {
      return tx.children();
    },
    normalize: () => repairEditorValue(editor),
  };

  setEditorRuntime(api, runtime);

  return api;
};

export const insertContentSlice = (transaction, content, options) =>
  transaction.slice.replace(ContentSlice.closed(content), options);
