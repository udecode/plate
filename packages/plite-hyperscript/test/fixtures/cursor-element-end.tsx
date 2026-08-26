/** @jsx jsx */

export const input = (
  <editor>
    <element>
      one
      <cursor />
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
  ],
  selection: {
    anchor: {
      path: [0, 0],
      offset: 3,
    },
    focus: {
      path: [0, 0],
      offset: 3,
    },
  },
};
