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
      find **test
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

export const output = { offset: 7, path: [0, 0] };
