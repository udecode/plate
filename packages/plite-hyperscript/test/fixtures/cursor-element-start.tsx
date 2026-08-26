/** @jsx jsx */

export const input = (
  <editor>
    <element>
      <cursor />
      one
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
      offset: 0,
    },
    focus: {
      path: [0, 0],
      offset: 0,
    },
  },
};
