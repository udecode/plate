/** @jsx jsx */

export const withFallbackElement = true;

export const input = (
  <editor>
    <inline>one</inline>
    <block>two</block>
    <inline>three</inline>
    <block>four</block>
  </editor>
);
export const output = (
  <editor>
    <element type="paragraph">
      <text />
      <inline>one</inline>
      <text />
    </element>
    <block>two</block>
    <element type="paragraph">
      <text />
      <inline>three</inline>
      <text />
    </element>
    <block>four</block>
  </editor>
);
