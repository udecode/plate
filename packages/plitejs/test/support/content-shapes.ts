import { property, schema, target } from '../../src';

/**
 * Content shapes for the completion laws: each element content, a start that
 * the gestures empty, and the children Editing leaves once they do.
 */
export type Json = {
  readonly [key: string]: unknown;
  readonly children?: Json[];
};

const c = schema.content;
export const text = (value = '', properties: Json = {}) => ({
  text: value,
  ...properties,
});
export const node = (
  type: string,
  children: Json[],
  properties: Json = {}
) => ({
  type,
  ...properties,
  children,
});
export const xb = (value = '') => node('xb', [text(value)]);
export const xi = (value = '') => node('xi', [text(value)]);
export const header = (value = '') => node('header', [text(value)]);

export const helpers = {
  header: { content: c.text() },
  paragraph: { content: c.text() },
  xb: { content: c.text() },
  xi: { content: c.text({ default: 'text', min: 1 }), inline: true },
};

export type Gesture =
  | 'delete every character'
  | 'remove every child'
  | 'remove the last block'
  | 'remove the only text node';

export const shapes: ReadonlyArray<
  Readonly<{
    content: unknown;
    elements?: Json;
    emptied: Json[];
    gestures: readonly Gesture[];
    name: string;
    properties?: unknown[];
    start: Json[];
    type?: string;
  }>
> = [
  {
    content: c.text(),
    emptied: [text()],
    gestures: [
      'delete every character',
      'remove the only text node',
      'remove every child',
    ],
    name: 'text()',
    start: [text('abc')],
  },
  {
    content: c.text({ default: 'text', min: 1 }),
    emptied: [text()],
    gestures: [
      'delete every character',
      'remove the only text node',
      'remove every child',
    ],
    name: 'text() with a minimum',
    start: [text('abc')],
  },
  {
    content: c.open(),
    emptied: [text()],
    gestures: [
      'delete every character',
      'remove the only text node',
      'remove every child',
    ],
    name: 'open()',
    start: [text('abc')],
  },
  {
    content: c.any([c.text(), c.type('xb')], {
      default: { type: 'xb' },
      min: 1,
    }),
    emptied: [text()],
    gestures: [
      'delete every character',
      'remove the only text node',
      'remove every child',
    ],
    name: 'mixed content, block default at min 1',
    start: [text('abc')],
  },
  {
    content: c.any([c.text(), c.type('xb')], {
      default: { type: 'xb' },
      min: 2,
    }),
    emptied: [xb(), xb()],
    gestures: ['remove every child'],
    name: 'mixed content, block default at min 2',
    start: [xb('a'), xb('b')],
  },
  {
    content: c.any([c.text(), c.type('xb')], {
      default: { type: 'xb' },
      min: 3,
    }),
    emptied: [xb(), xb(), xb()],
    gestures: ['remove every child'],
    name: 'mixed content, block default at min 3',
    start: [xb('a'), xb('b'), xb('c')],
  },
  {
    content: c.any([c.text(), c.type('xi')], {
      default: { type: 'xi' },
      min: 1,
    }),
    emptied: [text()],
    gestures: [
      'delete every character',
      'remove the only text node',
      'remove every child',
    ],
    name: 'mixed content, inline default at min 1',
    start: [text('abc')],
  },
  {
    content: c.any([c.text(), c.type('xi')], {
      default: { type: 'xi' },
      max: 3,
      min: 3,
    }),
    emptied: [text(), xi(), text()],
    gestures: ['delete every character', 'remove every child'],
    name: 'inline default at a tight bound',
    start: [text('a'), xi('q'), text('b')],
  },
  {
    content: c.any([c.text(), c.type('xi')], {
      default: { type: 'xi' },
      max: 5,
      min: 2,
    }),
    emptied: [text(), xi(), text()],
    gestures: ['delete every character', 'remove every child'],
    name: 'inline default at a loose bound',
    start: [text('a'), xi('q'), text('b')],
  },
  {
    content: c.prefix([{ element: 'header' }], c.text({ max: 0 })),
    emptied: [header()],
    gestures: ['remove every child'],
    name: 'a prefix with no room for text',
    start: [header('h')],
  },
  {
    content: c.prefix([{ element: 'header' }], c.text()),
    emptied: [header(), text()],
    gestures: ['remove every child'],
    name: 'a prefix with room for text',
    start: [header('h'), text('abc')],
  },
  {
    content: c.prefix([{ element: 'header' }], c.types(['header', 'xb'])),
    emptied: [header()],
    gestures: ['remove every child'],
    name: "a prefix whose remainder admits the prefix's type",
    start: [header('h'), header('x')],
  },
  {
    content: c.type('xb', { min: 1 }),
    emptied: [xb()],
    gestures: ['remove every child', 'remove the last block'],
    name: 'block-only content with a minimum',
    start: [xb('a')],
  },
  {
    content: c.type('xb'),
    emptied: [],
    gestures: ['remove every child', 'remove the last block'],
    name: 'block-only content without a minimum',
    start: [xb('a')],
  },
  {
    content: c.type('row', { min: 1 }),
    elements: { row: { content: c.text() } },
    emptied: [node('row', [text()], { role: 'nested' })],
    gestures: ['remove every child', 'remove the last block'],
    name: 'a parent-scoped static default on an element',
    properties: [
      schema.elementProperty('role', property.string({ default: 'nested' }), {
        target: target.and(
          target.type('row'),
          target.parent(target.type('el'))
        ),
      }),
    ],
    start: [node('row', [text('x')], { role: 'nested' })],
  },
  {
    content: c.text(),
    emptied: [text('', { lang: 'en' })],
    gestures: [
      'delete every character',
      'remove the only text node',
      'remove every child',
    ],
    name: 'a parent-scoped static default on a text',
    properties: [
      schema.textProperty('lang', property.string({ default: 'en' }), {
        target: target.type('el'),
      }),
    ],
    start: [text('abc', { lang: 'en' })],
  },
];
