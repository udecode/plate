/** @jsx jsx */

export const run = (editor) => {
  editor.text.insert('four');
};
export const input = (
  <editor>
    <block>
      one
      <inline>
        two
        <cursor />
      </inline>
      three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <inline>
        twofour
        <cursor />
      </inline>
      three
    </block>
  </editor>
);
