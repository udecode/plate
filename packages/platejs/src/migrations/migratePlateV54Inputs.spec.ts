import type { Descendant, Element } from '../core';
import {
  defineDocumentMigrations,
  migrateDocument,
} from './documentMigrations';
import { migrateV54 } from './migratePlateV54';

const migrations = defineDocumentMigrations({
  plugins: [],
  schema: { id: 'plate', version: 54 },
  sourceFingerprints: { 53: 'plate-v53' },
  steps: { 54: migrateV54 },
});
const v53Schema = {
  fingerprint: 'plate-v53',
  id: 'plate',
  kind: 'named',
  version: 53,
} as const;

const p = (...children: Descendant[]): Element => ({ children, type: 'p' });
const input = (type: string, props: Record<string, unknown> = {}): Element => ({
  children: [{ text: '' }],
  type,
  ...props,
});
const paragraph = (text: string): Element => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('migratePlateV54 autocomplete inputs', () => {
  it('restores stored inputs as their literal trigger and query', () => {
    const { output } = migrateDocument(
      {
        children: [
          p(
            { text: 'Hi ' },
            input('mention_input', { trigger: '+', value: 'Ada' }),
            { text: ' ' },
            input('slash_input')
          ),
          p({ text: 'Smile ' }, input('emoji_input', { value: 'jo' })),
          p({ text: 'Note[' }, input('footnoteInput', { value: '2' })),
          p({ text: 'Bare ' }, input('footnoteInput')),
        ],
      },
      { migrations, source: 53 }
    );

    expect(output.document.children).toEqual([
      paragraph('Hi +Ada /'),
      paragraph('Smile :jo'),
      paragraph('Note[^2'),
      paragraph('Bare [^'),
    ]);
    expect(migrateDocument(output, { migrations }).output).toEqual(output);
  });

  it('maps a persisted selection inside an input to the end of its text', () => {
    const { output } = migrateDocument(
      {
        document: {
          children: [
            p({ text: 'Hi ' }, input('mention_input', { value: 'Ada' }), {
              text: ' there',
            }),
          ],
        },
        schema: v53Schema,
        selection: {
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: 3, path: [0, 2] },
          kind: 'text',
        },
      },
      { migrations }
    );

    expect(output.document.children).toEqual([paragraph('Hi @Ada there')]);
    expect(output.selection).toEqual({
      anchor: { offset: 7, path: [0, 0] },
      focus: { offset: 10, path: [0, 0] },
      kind: 'text',
    });
  });
});
