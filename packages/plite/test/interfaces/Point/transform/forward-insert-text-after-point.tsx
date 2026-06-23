/** @jsx jsx */

import { PointApi } from '@platejs/plite';

export const input = {
  path: [0, 0],
  offset: 0,
};

export const test = (value) =>
  PointApi.transform(
    value,
    {
      type: 'insert_text',
      path: [0, 0],
      text: 'a',
      offset: 1,
      properties: {},
    },
    { affinity: 'forward' }
  );
export const output = {
  path: [0, 0],
  offset: 0,
};
