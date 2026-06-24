/** @jsx jsx */

import { jsx } from '../..';

jsx;

export const input = (
  <editor>
    <element>
      a<cursor />
    </element>
  </editor>
);

input.update((tx) => {
  tx.operations.replay([
    {
      type: 'set_selection',
      properties: {},
      newProperties: { custom: 123 },
    },
  ]);
});

export const operations = [
  {
    type: 'set_selection',
    oldProperties: {},
    newProperties: { custom: null },
  },
];

export const output = (
  <editor>
    <element>
      a<cursor />
    </element>
  </editor>
);
