/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import assert from 'node:assert/strict';
import type { Operation } from '@platejs/plite';
export const run = (editor) => {
  editor.nodes.set({ someKey: true }, { at: [0] });
  const [op] = editor.value.operations();
  const roundTrip: Operation = JSON.parse(JSON.stringify(op));
  assert.deepStrictEqual(op, roundTrip);
};
export const input = (
  <editor>
    <block>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block someKey>
      <text />
    </block>
  </editor>
);
