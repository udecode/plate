/** @jsx jsx */

export const input = (
  <editor>
    <element>
      <element>
        word
        <cursor />
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
    kind: 'text',
    anchor: {
      path: [0, 0, 0],
      offset: 4,
    },
    focus: {
      path: [0, 0, 0],
      offset: 4,
    },
  },
};
