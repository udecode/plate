/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const a = (
  <editor>
    <htable>
      <htr>
        <htd>
          <anchor />a
        </htd>
        <htd>
          b<focus />
        </htd>
      </htr>
    </htable>
  </editor>
) as any as PlateEditor;

export const tableInput = Object.freeze([
  {
    type: 'table',
    children: [
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'A1' }] },
          { type: 'td', children: [{ text: 'B1' }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'A2' }] },
          { type: 'td', children: [{ text: 'B2' }] },
        ],
      },
    ],
  },
]) as any;
