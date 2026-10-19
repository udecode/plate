import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import { isInline as editorIsInline } from '../../../../src/internal';

jsx;

export const run = (editor) => {
  editor.nodes.split({
    at: { path: [0, 1, 0], offset: 2 },
    match: (n) => ElementApi.isElement(n) && editorIsInline(editor, n),
  });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        <text>word</text>
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline>
        <text>wo</text>
      </inline>
      <text />
      <inline>
        <text>rd</text>
      </inline>
      <text />
    </block>
  </editor>
);
