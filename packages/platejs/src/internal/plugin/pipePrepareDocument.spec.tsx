import { type EditorDocumentValue, property, schema, target } from 'plitejs';

import { createEditor, defineDocumentMigrations } from '../../lib/editor';
import { defineBasePlugin } from '../../lib/plugin';
import { pipePrepareDocument } from './pipePrepareDocument';

describe('pipePrepareDocument', () => {
  const createLoosePlugin = (config: Record<string, unknown>) => {
    const { name, ...definition } = config;

    return defineBasePlugin(name as string, definition as any) as any;
  };

  const createTestPlugin = (name: string) =>
    defineBasePlugin(name, {
      prepareDocument: ({ document }: any) => ({
        ...document,
        children: document.children.map((node: any) => ({
          ...node,
          count: node.count + 1,
        })),
        roots: Object.fromEntries(
          Object.entries(document.roots ?? {}).map(([root, children]) => [
            root,
            (children as any[]).map((node) => ({
              ...node,
              count: node.count + 1,
            })),
          ])
        ),
      }),
    });

  const CountPlugin = defineBasePlugin('count', {
    schema: {
      properties: {
        count: schema.elementProperty(property.number(), {
          target: target.type('paragraph'),
        }),
      },
    },
  });
  const plugins = [CountPlugin, createTestPlugin('a'), createTestPlugin('b')];

  describe('when value is passed to createEditor', () => {
    it('transforms the initial value once', () => {
      const editor = createEditor({
        plugins,
        initialValue: [
          { children: [{ text: '' }], count: 0, type: 'paragraph' },
        ],
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], count: 2, type: 'paragraph' },
      ]);
    });
  });

  describe('when value was already initialized', () => {
    it('transforms the initial value once', () => {
      const editor = createEditor({
        plugins,
        initialValue: [
          { children: [{ text: '' }], count: 0, type: 'paragraph' },
        ],
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], count: 2, type: 'paragraph' },
      ]);
    });
  });

  describe('when value is provided with plugin transforms', () => {
    it('uses the provided value and transforms it once', () => {
      const editor = createEditor({
        plugins,
        initialValue: [
          { children: [{ text: '' }], count: 0, type: 'paragraph' },
        ],
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], count: 2, type: 'paragraph' },
      ]);
    });
  });

  it('transforms deferred document replacement before schema fitting', () => {
    const editor = createEditor({
      plugins,
      skipInitialization: true,
    });

    editor.update.value.replace({
      children: [{ children: [{ text: '' }], count: 0, type: 'paragraph' }],
    });

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], count: 2, type: 'paragraph' },
    ]);
  });

  it('transforms later complete document replacements', () => {
    const editor = createEditor({
      plugins,
      initialValue: [{ children: [{ text: '' }], count: 0, type: 'paragraph' }],
    });

    editor.update.value.replace({
      children: [{ children: [{ text: '' }], count: 10, type: 'paragraph' }],
    });

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], count: 12, type: 'paragraph' },
    ]);
  });

  describe('createEditor', () => {
    describe('children handling', () => {
      it('use provided children', () => {
        const children = [
          { children: [{ text: 'Test' }], count: 0, type: 'paragraph' },
        ];
        const editor = createEditor({
          plugins,
          initialValue: children,
        });

        expect(editor.read.children()).toEqual([
          { children: [{ text: 'Test' }], count: 2, type: 'paragraph' },
        ]);
      });

      it('keeps the current editor value when children are empty', () => {
        const editor = createEditor({
          plugins,
          initialValue: [
            { children: [{ text: 'Factory' }], count: 0, type: 'paragraph' },
          ],
        });

        expect(editor.read.children()).toEqual([
          { children: [{ text: 'Factory' }], count: 2, type: 'paragraph' },
        ]);
      });
    });

    describe('selection handling', () => {
      it('use provided selection', () => {
        const selection = {
          kind: 'text' as const,
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        };
        const editor = createEditor({
          plugins,
          selection,
          initialValue: [
            { children: [{ text: 'A' }], count: 0, type: 'paragraph' },
          ],
        });

        expect(editor.read.selection()).toEqual({
          anchor: selection.anchor,
          focus: selection.focus,
        });
      });

      it('auto-select start when autoSelect is "start"', () => {
        const editor = createEditor({
          autoSelect: 'start',
          initialValue: [{ children: [{ text: 'Test' }], type: 'paragraph' }],
        });

        expect(editor.read.selection()).toEqual({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        });
      });

      it('auto-select end when autoSelect is true', () => {
        const editor = createEditor({
          autoSelect: true,
          initialValue: [{ children: [{ text: 'Test' }], type: 'paragraph' }],
        });

        expect(editor.read.selection()).toEqual({
          anchor: { offset: 4, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        });
      });
    });
  });

  it('throws when a prepareDocument hook does not return a document', () => {
    const editor = createEditor({
      plugins: [
        createLoosePlugin({
          name: 'bad',
          prepareDocument: () => [],
        }),
      ],
      skipInitialization: true,
    });

    expect(() =>
      editor.update.value.replace({
        children: [{ children: [{ text: '' }], type: 'paragraph' }],
        selection: null,
      })
    ).toThrow(
      'Plugin "bad" prepareDocument must return an editor document with primary-root children.'
    );
  });

  it('skips prepareDocument for read-only editOnly plugins', () => {
    let callCount = 0;
    const editor = createEditor({
      plugins: [
        createLoosePlugin({
          name: 'skip',
          editOnly: { prepareDocument: true },
          prepareDocument: ({
            document,
          }: {
            document: EditorDocumentValue;
          }) => {
            callCount += 1;

            return document;
          },
        }),
      ],
      readOnly: true,
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    callCount = 0;

    pipePrepareDocument(editor);

    expect(callCount).toBe(0);
  });

  it('reapplies preparation without rerunning version migrations', () => {
    let migrationCalls = 0;
    let preparationCalls = 0;
    const EditorSchema = { id: 'prepare-current', version: 1 } as const;
    const migrations = defineDocumentMigrations(EditorSchema, {
      steps: {
        1: ({ document }) => {
          migrationCalls += 1;

          return document;
        },
      },
      unversioned: 0,
    });
    const PreparePlugin = defineBasePlugin('prepareCurrent', {
      prepareDocument: ({ document }) => {
        preparationCalls += 1;

        return document;
      },
    });
    const editor = createEditor({
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      migrations,
      plugins: [PreparePlugin],
      schema: EditorSchema,
    });

    migrationCalls = 0;
    preparationCalls = 0;
    pipePrepareDocument(editor);

    expect(migrationCalls).toBe(0);
    expect(preparationCalls).toBe(1);
  });
});
