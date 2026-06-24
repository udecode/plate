import { createPlatePlugin } from '../../react';
import { createBasePlateEditor } from '../editor';
import { createEditorPlugin } from '../plugin';

describe('overrideEditor method', () => {
  it('overrides editor API methods', () => {
    const plugin = createEditorPlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        method1: () => 'original-api' as string,
      }))
      .overrideEditor(() => ({
        api: {
          method1: () => 'override-api',
        },
      }));

    const editor = createBasePlateEditor({
      plugins: [plugin],
    });

    expect(editor.api.method1()).toBe('override-api');
  });

  it('keeps access to original API methods in override context', () => {
    const plugin = createEditorPlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        method1: () => 'base-api' as string,
        method2: () => 'original-api' as string,
      }))
      .overrideEditor(({ api }) => ({
        api: {
          method2: () => `override-${api.method1()}`,
        },
      }));

    const editor = createBasePlateEditor({
      plugins: [plugin],
    });

    expect(editor.api.method2()).toBe('override-base-api');
  });

  it('merges nested API overrides without replacing untouched methods', () => {
    const plugin = createEditorPlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        nested: {
          method1: () => 'original-api1' as string,
          method2: () => 'original-api2' as string,
        },
      }))
      .overrideEditor(() => ({
        api: {
          nested: {
            method1: () => 'override-api1',
          },
        },
      }));

    const editor = createBasePlateEditor({
      plugins: [plugin],
    });

    expect(editor.api.nested.method1()).toBe('override-api1');
    expect(editor.api.nested.method2()).toBe('original-api2');
  });

  it('allows multiple API override calls', () => {
    const plugin = createEditorPlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        method1: () => 'original-api1' as string,
        method2: () => 'original-api2' as string,
        method3: () => 'original-api3' as string,
      }))
      .overrideEditor(() => ({
        api: {
          method1: () => 'override-api1',
        },
      }))
      .overrideEditor(() => ({
        api: {
          method2: () => 'override-api2',
        },
      }));

    const editor = createBasePlateEditor({
      plugins: [plugin],
    });

    expect(editor.api.method1()).toBe('override-api1');
    expect(editor.api.method2()).toBe('override-api2');
    expect(editor.api.method3()).toBe('original-api3');
  });

  it('works through createPlatePlugin', () => {
    const plugin = createPlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        method1: () => 'original-api' as string,
        method2: () => 'untouched-api' as string,
      }))
      .overrideEditor(() => ({
        api: {
          method1: () => 'override-api',
        },
      }));

    const editor = createBasePlateEditor({
      plugins: [plugin],
    });

    expect(editor.api.method1()).toBe('override-api');
    expect(editor.api.method2()).toBe('untouched-api');
  });
});
