export const initialValue = [
  {
    children: [
      {
        text:
          'Since the editor is based on a recursive tree model, similar to an HTML document, you can create complex nested structures, like tables:',
        marks: [],
      },
    ],
  },
  {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ text: '', marks: [] }],
          },
          {
            type: 'table-cell',
            children: [
              {
                text: 'Human',
                marks: [{ type: 'bold' }],
              },
            ],
          },
          {
            type: 'table-cell',
            children: [
              {
                text: 'Dog',
                marks: [{ type: 'bold' }],
              },
            ],
          },
          {
            type: 'table-cell',
            children: [
              {
                text: 'Cat',
                marks: [{ type: 'bold' }],
              },
            ],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [
              {
                text: '# of Feet',
                marks: [{ type: 'bold' }],
              },
            ],
          },
          {
            type: 'table-cell',
            children: [{ text: '2', marks: [] }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4', marks: [] }],
          },
          {
            type: 'table-cell',
            children: [{ text: '4', marks: [] }],
          },
        ],
      },
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [
              {
                text: '# of Lives',
                marks: [{ type: 'bold' }],
              },
            ],
          },
          {
            type: 'table-cell',
            children: [{ text: '1', marks: [] }],
          },
          {
            type: 'table-cell',
            children: [{ text: '1', marks: [] }],
          },
          {
            type: 'table-cell',
            children: [{ text: '9', marks: [] }],
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        text:
          "This table is just a basic example of rendering a table, and it doesn't have fancy functionality. But you could augment it to add support for navigating with arrow keys, displaying table headers, adding column and rows, or even formulas if you wanted to get really crazy!",
        marks: [],
      },
    ],
  },
];
