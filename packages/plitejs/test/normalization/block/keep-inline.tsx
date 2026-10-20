/** @jsxRuntime classic */
/** @jsx jsx */

export const input = (
  <editor>
    <block>
      <block>one</block>
      <inline>two</inline>
      <block>three</block>
      <inline>four</inline>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>one</block>
      <text />
      <inline>two</inline>
      <text />
      <block>three</block>
      <text />
      <inline>four</inline>
      <text />
    </block>
  </editor>
);
