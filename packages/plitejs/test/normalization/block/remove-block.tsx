/** @jsxRuntime classic */
/** @jsx jsx */

export const input = (
  <editor>
    <block>
      <text />
      <inline>
        <text>one</text>
        <block>two</block>
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline>onetwo</inline>
      <text />
    </block>
  </editor>
);
