import {
  type EditorDocumentValue,
  property,
  schema,
  target,
} from '@platejs/plite';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin';
import { pipeNormalizeInitialValue } from './pipeNormalizeInitialValue';

describe('pipeNormalizeInitialValue', () => {
  const createLoosePlugin = (config: Record<string, unknown>) =>
    createBasePlugin(config as any) as any;

  const createTestPlugin = (key: string) =>
    createBasePlugin({
      key,
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

  const CountPlugin = createBasePlugin({
    key: 'count',
    schema: {
      properties: [
        schema.elementProperty('count', property.number(), {
          target: target.type('p'),
        }),
      ],
    },
  });
  const plugins = [CountPlugin, createTestPlugin('a'), createTestPlugin('b')];

  describe('when value is passed to createBaseEditor', () => {
    it('transforms the initial value once', () => {
      const editor = createBaseEditor({
        plugins,
        initialValue: [{ children: [{ text: '' }], count: 0, type: 'p' }],
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  describe('when value was already initialized', () => {
    it('transforms the initial value once', () => {
      const editor = createBaseEditor({
        plugins,
        initialValue: [{ children: [{ text: '' }], count: 0, type: 'p' }],
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  describe('when value is provided with plugin transforms', () => {
    it('uses the provided value and transforms it once', () => {
      const editor = createBaseEditor({
        plugins,
        initialValue: [{ children: [{ text: '' }], count: 0, type: 'p' }],
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  it('transforms deferred document replacement before schema fitting', () => {
    const editor = createBaseEditor({
      plugins,
      skipInitialization: true,
    });

    editor.update.value.replace({
      children: [{ children: [{ text: '' }], count: 0, type: 'p' }],
    });

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], count: 2, type: 'p' },
    ]);
  });

  it('transforms later complete document replacements', () => {
    const editor = createBaseEditor({
      plugins,
      initialValue: [{ children: [{ text: '' }], count: 0, type: 'p' }],
    });

    editor.update.value.replace({
      children: [{ children: [{ text: '' }], count: 10, type: 'p' }],
    });

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], count: 12, type: 'p' },
    ]);
  });

  describe('extendPlateEditor', () => {
    describe('children handling', () => {
      it('use provided children', () => {
        const children = [
          { children: [{ text: 'Test' }], count: 0, type: 'p' },
        ];
        const editor = createBaseEditor({
          plugins,
          initialValue: children,
        });

        expect(editor.read.children()).toEqual([
          { children: [{ text: 'Test' }], count: 2, type: 'p' },
        ]);
      });

      it('keeps the current editor value when children are empty', () => {
        const editor = createBaseEditor({
          plugins,
          initialValue: [
            { children: [{ text: 'Factory' }], count: 0, type: 'p' },
          ],
        });

        expect(editor.read.children()).toEqual([
          { children: [{ text: 'Factory' }], count: 2, type: 'p' },
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
          initialValue: [{ children: [{ text: 'A' }], count: 0, type: 'p' }],
        });

        expect(editor.read.selection()).toEqual(selection);
      });

      it('auto-select start when autoSelect is "start"', () => {
        const editor = createBaseEditor({
          autoSelect: 'start',
          initialValue: [{ children: [{ text: 'Test' }], type: 'p' }],
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
          initialValue: [{ children: [{ text: 'Test' }], type: 'p' }],
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
          key: 'bad',
          transformInitialValue: () => [],
        }),
      ],
      skipInitialization: true,
    });

    expect(() =>
      editor.update.value.replace({
        children: [{ children: [{ text: '' }], type: 'p' }],
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
          key: 'skip',
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
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
    });

    callCount = 0;

    pipeNormalizeInitialValue(editor);

    expect(callCount).toBe(0);
  });
});
