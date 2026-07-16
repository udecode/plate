import {
  getEditorRuntime,
  setEditorRuntime,
} from '../../src/core/editor-runtime';
import { getOperations } from '../../src/core/public-state';
import { normalize } from '../../src/editor/normalize';

const initializedEditors = new WeakSet();

export const withTest = (editor) => {
  if (initializedEditors.has(editor)) {
    return editor;
  }

  editor.extend({
    name: 'fixture-schema',
    elements: [
      {
        type: 'fixture-inline-flag',
        inline: true,
        match: (element) => element.inline === true,
      },
      {
        type: 'fixture-void-flag',
        void: 'block',
        match: (element) => element.void === true,
      },
      {
        type: 'fixture-read-only-flag',
        readOnly: true,
        match: (element) => element.readOnly === true,
      },
      {
        type: 'fixture-non-selectable-flag',
        selectable: false,
        match: (element) => element.nonSelectable === true,
      },
    ],
  });

  initializedEditors.add(editor);

  return editor;
};

export const createFixtureTransactionApi = (editor, tx) => {
  const runtime = getEditorRuntime(editor);

  const api = {
    extend: (extension) => editor.extend(extension),
    fragment: tx.fragment,
    marks: tx.marks,
    nodes: tx.nodes,
    operations: tx.operations,
    points: tx.points,
    ranges: tx.ranges,
    read: {
      operations: () => getOperations(editor),
    },
    runtime: tx.runtime,
    schema: tx.schema,
    selection: tx.selection,
    text: tx.text,
    value: tx.value,
    get children() {
      return tx.children();
    },
    normalize: (options) => normalize(editor, options),
  };

  setEditorRuntime(api, runtime);

  return api;
};
