/** @jsxRuntime classic */
/** @jsx jsx */

export const input = (
  <editor>
    <element>
      one
      <anchor />
    </element>
    <element>
      two
      <focus />
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
      offset: 3,
    },
    focus: {
      path: [1, 0],
      offset: 3,
    },
  },
};
