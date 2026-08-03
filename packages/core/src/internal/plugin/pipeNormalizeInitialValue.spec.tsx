import {
  type EditorDocumentValue,
  property,
  schema,
  target,
} from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { defineBasePlugin } from '../../lib/plugin';
import { pipeNormalizeInitialValue } from './pipeNormalizeInitialValue';

describe('pipeNormalizeInitialValue', () => {
  const createLoosePlugin = (config: Record<string, unknown>) => {
    const { name, ...definition } = config;

    return defineBasePlugin(name as string, definition as any) as any;
  };

  const createTestPlugin = (name: string) =>
    defineBasePlugin(name, {
      transformInitialValue: ({ value: initialValue }: any) =>
        ({
          ...initialValue,
          children: initialValue.children.map((node: any) => ({
            ...node,
            count: node.count + 1,
          })),
          roots: Object.fromEntries(
            Object.entries(initialValue.roots ?? {}).map(([root, children]) => [
              root,
              (children as any[]).map((node) => ({
                ...node,
                count: node.count + 1,
              })),
            ])
          ),
        }) as any,
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

  describe('when value is passed to createBaseEditor', () => {
    it('transforms the initial value once', () => {
      const editor = createBaseEditor({
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
      const editor = createBaseEditor({
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
      const editor = createBaseEditor({
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
    const editor = createBaseEditor({
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
    const editor = createBaseEditor({
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

  describe('createPlateEditor', () => {
    describe('children handling', () => {
      it('use provided children', () => {
        const children = [
          { children: [{ text: 'Test' }], count: 0, type: 'paragraph' },
        ];
        const editor = createBaseEditor({
          plugins,
          initialValue: children,
        });

        expect(editor.read.children()).toEqual([
          { children: [{ text: 'Test' }], count: 2, type: 'paragraph' },
        ]);
      });

      it('keeps the current editor value when children are empty', () => {
        const editor = createBaseEditor({
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
        const editor = createBaseEditor({
          plugins,
          selection,
          initialValue: [
            { children: [{ text: 'A' }], count: 0, type: 'paragraph' },
          ],
        });

        expect(editor.read.selection()).toEqual(selection);
      });

      it('auto-select start when autoSelect is "start"', () => {
        const editor = createBaseEditor({
          autoSelect: 'start',
          initialValue: [{ children: [{ text: 'Test' }], type: 'paragraph' }],
        });

        expect(editor.read.selection()).toEqual({
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        });
      });

      it('auto-select end when autoSelect is true', () => {
        const editor = createBaseEditor({
          autoSelect: true,
          initialValue: [{ children: [{ text: 'Test' }], type: 'paragraph' }],
        });

        expect(editor.read.selection()).toEqual({
          kind: 'text',
          anchor: { offset: 4, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        });
      });
    });
  });

  it('throws when a transformInitialValue hook does not return a document', () => {
    const editor = createBaseEditor({
      plugins: [
        createLoosePlugin({
          name: 'bad',
          transformInitialValue: () => [],
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
      'Plugin "bad" transformInitialValue must return an editor document with primary-root children.'
    );
  });

  it('skips transformInitialValue for read-only editOnly plugins', () => {
    let callCount = 0;
    const editor = createBaseEditor({
      plugins: [
        createLoosePlugin({
          name: 'skip',
          editOnly: { transformInitialValue: true },
          transformInitialValue: ({
            value,
          }: {
            value: EditorDocumentValue;
          }) => {
            callCount += 1;

            return value;
          },
        }),
      ],
      readOnly: true,
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    callCount = 0;

    pipeNormalizeInitialValue(editor);

    expect(callCount).toBe(0);
  });
});
