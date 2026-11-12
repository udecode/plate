const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

export const boardValue = {
  children: [
    {
      children: [{ text: 'Board' }],
      level: 2,
      type: 'heading',
    },
    paragraph(
      'A board is a block of the document. Double click a note or a shape to type in it, and pick a tool from the toolbar or with its letter.'
    ),
    {
      childRoots: { shapes: 'board:demo' },
      children: [{ text: '' }],
      height: 480,
      type: 'board',
    },
    paragraph('Copy shapes with Mod+C and paste them into the board below.'),
    {
      childRoots: { shapes: 'board:paste' },
      children: [{ text: '' }],
      height: 320,
      type: 'board',
    },
  ],
  roots: {
    'board:demo': [
      {
        children: [{ text: '' }],
        name: 'Sprint',
        place: { origin: { x: 24, y: 40 }, x: 24, y: 40 },
        shapeId: 'frame-1',
        size: { height: 260, width: 300 },
        type: 'boardFrame',
        zIndex: 'a0',
      },
      {
        children: [paragraph('Plan the demo.')],
        fill: 'yellow',
        place: {
          frame: 'frame-1',
          frameOrigin: { x: 24, y: 40 },
          x: 24,
          y: 40,
        },
        shapeId: 'note-1',
        size: { height: 160, width: 200 },
        type: 'boardNote',
        zIndex: 'a1',
      },
      {
        children: [paragraph('Ship it')],
        fill: 'none',
        geo: 'rectangle',
        place: { x: 420, y: 130 },
        shapeId: 'geo-1',
        size: { height: 100, width: 160 },
        type: 'boardGeo',
        zIndex: 'a2',
      },
      {
        children: [paragraph('then')],
        end: { anchor: [0, 0.5], shape: 'geo-1', x: 420, y: 180 },
        shapeId: 'arrow-1',
        start: { anchor: [1, 0.5], shape: 'note-1', x: 248, y: 160 },
        type: 'boardArrow',
        zIndex: 'a3',
      },
      {
        children: [{ text: '' }],
        place: { x: 420, y: 320 },
        points: [0, 0.6, 0.5, 0.3, 0.1, 0.6, 0.6, 0.9, 0.6, 1, 0.2, 0.5],
        shapeId: 'stroke-1',
        size: { height: 80, width: 180 },
        type: 'boardStroke',
        zIndex: 'a4',
      },
    ],
    'board:paste': [
      {
        children: [paragraph('Paste here.')],
        fill: 'yellow',
        place: { x: 40, y: 60 },
        shapeId: 'note-2',
        size: { height: 160, width: 200 },
        type: 'boardNote',
        zIndex: 'a0',
      },
    ],
  },
};
