export const staticCursorsCode = `export const staticCursors = {
  one: {
    key: 'one',
    data: { style: { backgroundColor: 'red' } },
    selection: {
      anchor: {
        path: [0, 0],
        offset: 5,
      },
      focus: {
        path: [0, 0],
        offset: 12,
      },
    },
  },
  two: {
    key: 'two',
    data: { style: { backgroundColor: 'red' } },
    selection: {
      anchor: {
        path: [0, 0],
        offset: 18,
      },
      focus: {
        path: [0, 0],
        offset: 18,
      },
    },
  },
};
`;

export const staticCursorsFile = {
  '/cursor-overlay/staticCursors.tsx': staticCursorsCode,
};
