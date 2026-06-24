/** @jsx jsx */

import { jsx } from '../..';

jsx;

import assert from 'node:assert/strict';
export const run = (editor) => {
  editor.nodes.unset('someKey', { at: [0] });

  // unsetNodes uses null to remove properties, but that should not
  // flow through to the operation
  const [setNode] = editor.value.operations();

  if (setNode.type === 'set_node') {
    assert.deepStrictEqual(setNode, {
      type: 'set_node',
      path: [0],
      root: 'main',
      properties: { someKey: true },
      newProperties: {},
    });
  } else {
    // eslint-disable-next-line no-console
    console.error('operations:', editor.value.operations());
    assert.fail('operation was not a set node');
  }
};
export const input = (
  <editor>
    <block someKey>word</block>
  </editor>
);
export const output = (
  <editor>
    <block>word</block>
  </editor>
);
