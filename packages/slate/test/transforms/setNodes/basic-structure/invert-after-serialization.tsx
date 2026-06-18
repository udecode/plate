/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { type Operation, OperationApi } from '@platejs/slate';
export const run = (editor) => {
  editor.nodes.set({ key: true }, { at: [0] });
  const [op] = editor.value.operations();
  const roundTrip: Operation = JSON.parse(JSON.stringify(op));
  const inverted = OperationApi.inverse(roundTrip);
  editor.operations.replay([inverted]);
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
    <block>
      <text />
    </block>
  </editor>
);
