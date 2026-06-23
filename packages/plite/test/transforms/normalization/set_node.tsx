/** @jsx jsx */

import { jsx } from '../..';

jsx;

import _ from 'lodash';
import { ElementApi } from '@platejs/plite';
import { Editor, getEditorRuntime } from '@platejs/plite/internal';

export const input = (
  <editor>
    <block attr={{ a: true }} type="body">
      one
    </block>
  </editor>
);

const editor = input as unknown as Editor;
const runtime = getEditorRuntime(editor);
const defaultNormalize = runtime.normalizeNode;
runtime.normalizeNode = (entry) => {
  const [node, path] = entry;
  if (
    ElementApi.isElement(node) &&
    node.type === 'body' &&
    Editor.string(editor, path, { voids: true }) === 'one'
  ) {
    Editor.setNodes(
      editor,
      { attr: { a: false } },
      { at: path, compare: (p, n) => !_.isEqual(p, n) }
    );
  }

  defaultNormalize(entry);
};

export const run = (editor) => {
  editor.normalize({ force: true });
};

export const output = (
  <editor>
    <block attr={{ a: false }} type="body">
      one
    </block>
  </editor>
);
