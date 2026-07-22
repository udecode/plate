import { property, schema, target, type Value } from '@platejs/plite';

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
        initialValue.map((node: any) => ({
          ...node,
          count: node.count + 1,
        })),
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
        value: [{ children: [{ text: '' }], count: 0, type: 'p' }],
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
        value: [{ children: [{ text: '' }], count: 0, type: 'p' }],
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
        value: [{ children: [{ text: '' }], count: 0, type: 'p' }],
      });

      expect(editor.read.children()).toEqual([
        { children: [{ text: '' }], count: 2, type: 'p' },
      ]);
    });
  });

  describe('extendPlateEditor', () => {
    describe('children handling', () => {
      it('use provided children', () => {
        const children = [
          { children: [{ text: 'Test' }], count: 0, type: 'p' },
        ];
        const editor = createBaseEditor({
          plugins,
          value: children,
        });

        expect(editor.read.children()).toEqual([
          { children: [{ text: 'Test' }], count: 2, type: 'p' },
        ]);
      });

      it('keeps the current editor value when children are empty', () => {
        const editor = createBaseEditor({
          plugins,
          value: [{ children: [{ text: 'Factory' }], count: 0, type: 'p' }],
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
          value: [{ children: [{ text: 'A' }], count: 0, type: 'p' }],
        });

        expect(editor.read.selection()).toEqual(selection);
      });

      it('auto-select start when autoSelect is "start"', () => {
        const editor = createBaseEditor({
          autoSelect: 'start',
          value: [{ children: [{ text: 'Test' }], type: 'p' }],
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
          value: [{ children: [{ text: 'Test' }], type: 'p' }],
        });

        expect(editor.read.selection()).toEqual({
          kind: 'text',
          anchor: { offset: 4, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        });
      });
    });
  });

  it('throws when a transformInitialValue hook returns undefined', () => {
    const editor = createBaseEditor({
      plugins: [
        createLoosePlugin({
          key: 'bad',
          transformInitialValue: () => undefined,
        }),
      ],
      skipInitialization: true,
    });
    editor.update.value.replace({
      children: [{ children: [{ text: '' }], type: 'p' }],
      selection: null,
    });

    expect(() => pipeNormalizeInitialValue(editor)).toThrow(
      'Plugin "bad" transformInitialValue must return the next value.'
    );
  });

  it('skips transformInitialValue for read-only editOnly plugins', () => {
    let callCount = 0;
    const editor = createBaseEditor({
      plugins: [
        createLoosePlugin({
          key: 'skip',
          editOnly: { transformInitialValue: true },
          transformInitialValue: ({ value }: { value: Value }) => {
            callCount += 1;

            return value;
          },
        }),
      ],
      readOnly: true,
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    callCount = 0;

    pipeNormalizeInitialValue(editor);

    expect(callCount).toBe(0);
  });
});
