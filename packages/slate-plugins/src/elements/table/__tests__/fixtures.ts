export const content = Object.freeze([
  { type: 'p', children: [{ text: 'A' }] },
  {
    type: 'table',
    children: [
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'A1' }] },
          { type: 'td', children: [{ text: 'B1' }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'A2' }] },
          { type: 'td', children: [{ text: 'B2' }] },
        ],
      },
    ],
  },
  { type: 'p', children: [{ text: 'B' }] },
]) as any;

export const out = Object.freeze([
  { type: 'p', children: [{ text: 'A' }] },
  {
    type: 'table',
    children: [
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: '' }] },
          { type: 'td', children: [{ text: '' }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'A2' }] },
          { type: 'td', children: [{ text: 'B2' }] },
        ],
      },
    ],
  },
  { type: 'p', children: [{ text: 'B' }] },
]);

export const output2 = Object.freeze([
  { type: 'p', children: [{ text: 'A' }] },
  {
    type: 'table',
    children: [
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: '1' }] },
          { type: 'td', children: [{ text: 'B1' }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'A2' }] },
          { type: 'td', children: [{ text: 'B2' }] },
        ],
      },
    ],
  },
  { type: 'p', children: [{ text: 'B' }] },
]);
