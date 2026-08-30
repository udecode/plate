import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import { isBlock as editorIsBlock } from '../../../../src/internal';

jsx;

export const run = (editor) => {
  editor.nodes.set(
    { someKey: true },
    { match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n) }
  );
};
export const input = (
  <editor>
    <block void>
      <cursor />
      word
    </block>
  </editor>
);
export const output = (
  <editor>
    <block someKey void>
      <cursor />
      word
    </block>
  </editor>
);
