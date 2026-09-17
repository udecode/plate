import { describe, expect, it } from 'vitest';

import { createEditor, defineEditorSchema, property, schema } from '../..';
import { compare } from './compare';

const QualitySchema = defineEditorSchema('structural-diff-quality', {
  elements: {
    aside: {
      content: schema.content.type('paragraph', { min: 1 }),
    },
    cell: {
      content: schema.content.text(),
      properties: {
        columnSpan: property.number(),
        rowSpan: property.number(),
      },
      structure: {
        columnSpan: 'columnSpan',
        kind: 'grid',
        role: 'cell',
        rowSpan: 'rowSpan',
      },
    },
    heading: {
      content: schema.content.text(),
      properties: { level: property.number() },
      structure: { kind: 'outline', level: 'level' },
    },
    item: {
      content: schema.content.text(),
      properties: {
        depth: property.number(),
        listId: property.string(),
        marker: property.string(),
      },
      structure: {
        depth: 'depth',
        kind: 'list',
        membership: 'listId',
      },
    },
    paragraph: { content: schema.content.text() },
    row: {
      content: schema.content.type('cell', { min: 1 }),
      structure: { kind: 'grid', role: 'row' },
    },
    section: {
      content: schema.content.types(['paragraph', 'heading']),
    },
    table: {
      content: schema.content.type('row', { min: 1 }),
      structure: { kind: 'grid', role: 'grid' },
    },
  },
  root: schema.content.types([
    'aside',
    'heading',
    'item',
    'paragraph',
    'section',
    'table',
  ]),
  unknown: 'reject',
});

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});
const heading = (text: string, level = 1) => ({
  children: [{ text }],
  level,
  type: 'heading',
});
const item = (text: string, marker = 'bullet') => ({
  children: [{ text }],
  depth: 0,
  listId: 'quality-list',
  marker,
  type: 'item',
});
const cell = (text: string) => ({
  children: [{ text }],
  columnSpan: 1,
  rowSpan: 1,
  type: 'cell',
});
const row = (...children: Array<ReturnType<typeof cell>>) => ({
  children,
  type: 'row',
});
const table = (...children: Array<ReturnType<typeof row>>) => ({
  children,
  type: 'table',
});
const section = (...children: Array<ReturnType<typeof paragraph>>) => ({
  children,
  type: 'section',
});
const aside = (...children: Array<ReturnType<typeof paragraph>>) => ({
  children,
  type: 'aside',
});

const qualityScenarios = [
  {
    after: [item('C unique'), item('A unique'), item('B unique')],
    before: [item('A unique'), item('B unique'), item('C unique')],
    expectedGroups: [['placement']],
    id: 'L01 rotates a unique list without insertion or deletion noise',
  },
  {
    after: [item('C changed'), item('A unique'), item('B unique')],
    before: [item('A unique'), item('B unique'), item('C unique')],
    expectedGroups: [['placement', 'text']],
    id: 'L02 keeps an edit inside its relocated list item',
  },
  {
    after: [
      item('A changed unique passage with middle words and ending words'),
      item('First'),
      item('Third'),
    ],
    before: [
      item('First'),
      item('A long unique passage with middle words and final words'),
      item('Third'),
    ],
    expectedGroups: [['placement', 'text', 'text']],
    id: 'L03 keeps separated edits in one relocated list group',
  },
  {
    after: [item('D four'), item('C changed'), item('B two'), item('A one')],
    before: [item('A one'), item('B two'), item('C three'), item('D four')],
    expectedGroups: [['placement'], ['placement', 'text'], ['placement']],
    id: 'L04 accounts for every component of a reversed edited list',
  },
  {
    after: [
      heading('Beta'),
      paragraph('B1'),
      paragraph('B2'),
      heading('Alpha'),
      paragraph('A1'),
      paragraph('A2'),
    ],
    before: [
      heading('Alpha'),
      paragraph('A1'),
      paragraph('A2'),
      heading('Beta'),
      paragraph('B1'),
      paragraph('B2'),
    ],
    expectedGroups: [['placement', 'placement', 'placement']],
    id: 'S01 groups a flat heading section move',
  },
  {
    after: [
      heading('Beta'),
      paragraph('B1 new'),
      paragraph('B2'),
      heading('Alpha'),
      paragraph('A1'),
      paragraph('A2'),
    ],
    before: [
      heading('Alpha'),
      paragraph('A1'),
      paragraph('A2'),
      heading('Beta'),
      paragraph('B1 old'),
      paragraph('B2'),
    ],
    expectedGroups: [['placement', 'placement', 'text', 'placement']],
    id: 'S02 keeps a body edit inside its moved section',
  },
  {
    after: [
      heading('Beta renamed'),
      paragraph('Beta one changed'),
      paragraph('Beta two'),
      heading('Alpha'),
      paragraph('Alpha one'),
      paragraph('Alpha two changed'),
    ],
    before: [
      heading('Alpha'),
      paragraph('Alpha one'),
      paragraph('Alpha two'),
      heading('Beta'),
      paragraph('Beta one'),
      paragraph('Beta two'),
    ],
    expectedGroups: [
      ['text'],
      ['placement', 'text', 'placement', 'text', 'placement'],
    ],
    id: 'S03 retains section membership through heading and body edits',
  },
  {
    after: [section(paragraph('kept content'))],
    before: [paragraph('kept content')],
    expectedGroups: [['wrapper', 'placement']],
    id: 'X01 introduces a wrapper without deleting retained content',
  },
  {
    after: [section(paragraph('kept content new ending'))],
    before: [paragraph('kept content old ending')],
    expectedGroups: [['wrapper', 'placement', 'text']],
    id: 'X02 composes wrapper, relocation and interior editing',
  },
  {
    after: [
      section(paragraph('Beta changed'), paragraph('Alpha fragment')),
      aside(paragraph('Gamma fragment')),
    ],
    before: [
      paragraph('Alpha fragment'),
      paragraph('Beta fragment'),
      paragraph('Gamma fragment'),
    ],
    expectedGroups: [
      ['wrapper', 'placement', 'placement', 'text'],
      ['wrapper', 'placement'],
    ],
    id: 'X03 exposes every fragment moved across introduced structure',
  },
  {
    after: [item('Same label', 'number')],
    before: [item('Same label', 'bullet')],
    expectedGroups: [['property']],
    id: 'T01 reports list presentation without a text edit',
  },
  {
    after: [
      table(row(cell('B1'), cell('B2 changed')), row(cell('A1'), cell('A2'))),
    ],
    before: [table(row(cell('A1'), cell('A2')), row(cell('B1'), cell('B2')))],
    expectedGroups: [['placement', 'text']],
    id: 'T02 keeps a cell edit inside its moved row',
  },
  {
    after: [
      table(
        row(cell('A3'), cell('A1 changed'), cell('A2')),
        row(cell('C3'), cell('C1'), cell('C2'))
      ),
    ],
    before: [
      table(
        row(cell('A1'), cell('A2'), cell('A3')),
        row(cell('B1'), cell('B2'), cell('B3')),
        row(cell('C1'), cell('C2'), cell('C3'))
      ),
    ],
    expectedGroups: [
      ['text', 'placement'],
      ['text', 'text', 'placement'],
      ['delete'],
    ],
    id: 'T03 distinguishes column movement, row deletion and a cell edit',
  },
  {
    after: [
      table(
        row(cell('C3'), cell('C1'), cell('C2 changed')),
        row(cell('A3'), cell('A1 changed'), cell('A2'))
      ),
    ],
    before: [
      table(
        row(cell('A1'), cell('A2'), cell('A3')),
        row(cell('B1'), cell('B2'), cell('B3')),
        row(cell('C1'), cell('C2'), cell('C3'))
      ),
    ],
    expectedGroups: [['text', 'placement'], ['placement', 'text'], ['delete']],
    id: 'T04 preserves row and column movement, deletion and cell edits',
  },
] as const;

describe('structural comparison quality scenarios', () => {
  const editor = createEditor({ plugins: [QualitySchema] });

  it.each(qualityScenarios)(
    '$id',
    async ({ after, before, expectedGroups }) => {
      const comparison = await compare({
        after,
        before,
        schema: editor.read.schema,
      });

      expect(comparison.change.apply(comparison.before.document)).toEqual(
        comparison.after.document
      );
      expect(
        comparison.change
          .invert(comparison.before.document)
          .apply(comparison.after.document)
      ).toEqual(comparison.before.document);
      expect(
        comparison.changes.map(({ effects }) => effects.map(({ kind }) => kind))
      ).toEqual(expectedGroups);
      expect(comparison.diagnostics.map(({ code }) => code)).not.toContain(
        'coarse-replacement'
      );
    }
  );
});
