import { jsx } from '../../..';
/** @jsx jsx */
import {
  before as editorBefore,
  getSnapshot as editorGetSnapshot,
} from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>
      test http://google.com
      <cursor />
    </block>
  </editor>
);

export const test = (editor) =>
  editorBefore(editor, editorGetSnapshot(editor).selection, {
    matchString: ' ',
    skipInvalid: true,
  });

export const output = { offset: 4, path: [0, 0] };
