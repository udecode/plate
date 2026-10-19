/** @jsxRuntime classic */
/** @jsx jsx */

export const input = (
  <editor>
    <element>
      on
      <anchor />e
    </element>
    <element>
      t<focus />
      wo
    </element>
  </editor>
);
export const output = {
  children: [
    {
      type: 'fixture-block',
      children: [
        {
          text: 'one',
        },
      ],
    },
    {
      type: 'fixture-block',
      children: [
        {
          text: 'two',
        },
      ],
    },
  ],
  selection: {
    anchor: {
      path: [0, 0],
      offset: 2,
    },
    focus: {
      path: [1, 0],
      offset: 1,
    },
  },
};
