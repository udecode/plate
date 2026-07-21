/** @jsx jsx */

export const input = (
  <editor>
    <element>
      <text>
        <anchor />
      </text>
    </element>
    <element>
      <text>
        <focus />
      </text>
    </element>
  </editor>
);
export const output = {
  children: [
    {
      type: 'fixture-block',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'fixture-block',
      children: [
        {
          text: '',
        },
      ],
    },
  ],
  selection: {
    kind: 'text',
    anchor: {
      path: [0, 0],
      offset: 0,
    },
    focus: {
      path: [1, 0],
      offset: 0,
    },
  },
};
