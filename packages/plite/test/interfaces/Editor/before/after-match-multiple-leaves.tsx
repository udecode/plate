import {
  before as editorBefore,
  getSnapshot as editorGetSnapshot,
} from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text>find *</text>
      <text>*test</text>
      <cursor />
    </block>
  </editor>
);

export const test = (editor) =>
  editorBefore(editor, editorGetSnapshot(editor).selection, {
    afterMatch: true,
    matchString: '**',
    skipInvalid: true,
  });

export const output = { offset: 1, path: [0, 1] };
