/** @jsx jsx */

export const withFallbackElement = true;

export const input = (
  <editor>
    <text>one</text>
    <block>two</block>
    <text>three</text>
    <block>four</block>
  </editor>
);
export const output = (
  <editor>
    <element type="paragraph">
      <text>one</text>
    </element>
    <block>two</block>
    <element type="paragraph">
      <text>three</text>
    </element>
    <block>four</block>
  </editor>
);
