/** @jsx jsx */

export const withFallbackElement = true;

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
      <element type="paragraph">
        <text />
        <inline>two</inline>
        <text />
      </element>
      <block>three</block>
      <element type="paragraph">
        <text />
        <inline>four</inline>
        <text />
      </element>
    </block>
  </editor>
);
