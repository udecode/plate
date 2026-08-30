import { jsx } from '../../..';
/** @jsx jsx */
import {
  before as editorBefore,
  getSnapshot as editorGetSnapshot,
} from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>find z</block>
    <block>
      test http://google.com
      <cursor />
    </block>
  </editor>
);

export const test = (editor) =>
  editorBefore(editor, editorGetSnapshot(editor).selection, {
    afterMatch: true,
    matchBlockStart: true,
    matchString: 'z',
    skipInvalid: true,
  });

export const output = { offset: 0, path: [1, 0] };
