import { ElementApi } from 'plitejs';

/** @jsx jsx */
import {
  above as editorAbove,
  isInline as editorIsInline,
} from '../../../../src/internal';

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);

export const test = (editor) =>
  editorAbove(editor, {
    at: [0, 1, 0],
    match: (n) => ElementApi.isElement(n) && editorIsInline(editor, n),
  });

export const output = [<inline>two</inline>, [0, 1]];
