/** @jsx jsx */

import { jsx } from '../..';

jsx;

import _ from 'lodash';
import { ElementApi } from '@platejs/plite';
import { string as editorString } from '@platejs/plite/internal';
import { getEditorRuntime } from '@platejs/plite/internal';

export const input = (
  <editor>
    <block attr={{ a: true }} type="body">
      one
    </block>
  </editor>
);

export const run = (editor) => {
  const runtime = getEditorRuntime(editor);
  const defaultNormalize = runtime.normalizeNode;

  runtime.normalizeNode = (entry, options) => {
    const [node, path] = entry;

    if (
      ElementApi.isElement(node) &&
      node.type === 'body' &&
      node.attr?.a !== false &&
      editorString(editor, path, { voids: true }) === 'one'
    ) {
      editor.nodes.set(
        { attr: { a: false } },
        { at: path, compare: (p, n) => !_.isEqual(p, n) }
      );
    }

    defaultNormalize(entry, options);
  };

  try {
    editor.normalize({ force: true });
  } finally {
    runtime.normalizeNode = defaultNormalize;
  }
};

export const output = (
  <editor>
    <block attr={{ a: false }} type="body">
      one
    </block>
  </editor>
);
