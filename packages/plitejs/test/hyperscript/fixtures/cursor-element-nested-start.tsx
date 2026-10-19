/** @jsxRuntime classic */
/** @jsx jsx */

export const input = (
  <editor>
    <element>
      <element>
        <cursor />
        word
      </element>
    </element>
  </editor>
);
export const output = {
  children: [
    {
      type: 'fixture-block',
      children: [
        {
          type: 'fixture-block',
          children: [
            {
              text: 'word',
            },
          ],
        },
      ],
    },
  ],
  selection: {
    anchor: {
      path: [0, 0, 0],
      offset: 0,
    },
    focus: {
      path: [0, 0, 0],
      offset: 0,
    },
  },
};
