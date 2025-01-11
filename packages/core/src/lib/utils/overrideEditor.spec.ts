import { createPlateEditor, createPlatePlugin } from '../../react';
import { createSlatePlugin } from '../plugin';

describe('overrideEditor method', () => {
  it('should override both api and transforms', () => {
    const basePlugin = createSlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        method1: () => 'original-api' as string,
      }))
      .extendEditorTransforms(() => ({
        transform1: () => 'original-transform' as string,
      }))
      .overrideEditor(() => ({
        api: {
          method1: () => 'override-api',
        },
        transforms: {
          transform1: () => 'override-transform',
        },
      }));

    const editor = createPlateEditor({
      plugins: [basePlugin],
    });

    expect(editor.api.method1()).toBe('override-api');
    expect(editor.tf.transform1()).toBe('override-transform');
  });

  it('should allow overriding only api or transforms', () => {
    const basePlugin = createSlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        method1: () => 'original-api' as string,
      }))
      .extendEditorTransforms(() => ({
        transform1: () => 'original-transform' as string,
      }))
      .overrideEditor(() => ({
        api: {
          method1: () => 'override-api',
        },
      }))
      .overrideEditor(() => ({
        transforms: {
          transform1: () => 'override-transform',
        },
      }));

    const editor = createPlateEditor({
      plugins: [basePlugin],
    });

    expect(editor.api.method1()).toBe('override-api');
    expect(editor.tf.transform1()).toBe('override-transform');
  });

  it('should maintain type safety for both api and transforms', () => {
    const basePlugin = createSlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        apiMethod: (x: number) => x.toString(),
      }))
      .extendEditorTransforms(() => ({
        transformMethod: (x: number) => x * 2,
      }))
      .overrideEditor(() => ({
        api: {
          apiMethod: (x: number) => (x + 1).toString(),
        },
        transforms: {
          transformMethod: (x: number) => x * 3,
        },
      }));

    const editor = createPlateEditor({
      plugins: [basePlugin],
    });

    expect(editor.api.apiMethod(5)).toBe('6');
    expect(editor.tf.transformMethod(5)).toBe(15);
  });

  it('should allow access to original methods in override', () => {
    const basePlugin = createSlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        method1: () => 'base-api' as string,
        method2: () => 'original-api' as string,
      }))
      .extendEditorTransforms(() => ({
        transform1: () => 'base-transform' as string,
        transform2: () => 'original-transform' as string,
      }))
      .overrideEditor(({ plugin: { api, transforms } }) => ({
        api: {
          method2: () => `override-${api.method1()}`,
        },
        transforms: {
          transform2: () => `override-${transforms.transform1()}`,
        },
      }));

    const editor = createPlateEditor({
      plugins: [basePlugin],
    });

    expect(editor.api.method2()).toBe('override-base-api');
    expect(editor.tf.transform2()).toBe('override-base-transform');
  });

  it('should handle nested methods correctly', () => {
    const basePlugin = createSlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        nested: {
          method1: () => 'original-api1' as string,
          method2: () => 'original-api2' as string,
        },
      }))
      .extendEditorTransforms(() => ({
        nested: {
          transform1: () => 'original-transform1' as string,
          transform2: () => 'original-transform2' as string,
        },
      }))
      .overrideEditor(() => ({
        api: {
          nested: {
            method1: () => 'override-api1',
          },
        },
        transforms: {
          nested: {
            transform1: () => 'override-transform1',
          },
        },
      }));

    const editor = createPlateEditor({
      plugins: [basePlugin],
    });

    expect(editor.api.nested.method1()).toBe('override-api1');
    expect(editor.api.nested.method2()).toBe('original-api2');
    expect(editor.tf.nested.transform1()).toBe('override-transform1');
    expect(editor.tf.nested.transform2()).toBe('original-transform2');
  });

  it('should preserve non-overridden methods', () => {
    const basePlugin = createSlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        method1: () => 'original-api1' as string,
        method2: () => 'original-api2' as string,
        method3: () => 'original-api3' as string,
      }))
      .extendEditorTransforms(() => ({
        transform1: () => 'original-transform1' as string,
        transform2: () => 'original-transform2' as string,
        transform3: () => 'original-transform3' as string,
      }))
      .overrideEditor(() => ({
        api: {
          method1: () => 'override-api1',
        },
        transforms: {
          transform1: () => 'override-transform1',
        },
      }))
      .overrideEditor(() => ({
        api: {
          method2: () => 'override-api2',
        },
        transforms: {
          transform2: () => 'override-transform2',
        },
      }));

    const editor = createPlateEditor({
      plugins: [basePlugin],
    });

    expect(editor.api.method1()).toBe('override-api1');
    expect(editor.api.method2()).toBe('override-api2');
    expect(editor.api.method3()).toBe('original-api3');
    expect(editor.tf.transform1()).toBe('override-transform1');
    expect(editor.tf.transform2()).toBe('override-transform2');
    expect(editor.tf.transform3()).toBe('original-transform3');
  });

  it('should handle both api and transforms in a single override call', () => {
    const basePlugin = createPlatePlugin({
      key: 'testPlugin',
    })
      .extendEditorApi(() => ({
        method1: () => 'original-api' as string,
        method2: () => 'untouched-api' as string,
      }))
      .extendEditorTransforms(() => ({
        transform1: () => 'original-transform' as string,
        transform2: () => 'untouched-transform' as string,
      }))
      .overrideEditor(() => ({
        api: {
          method1: () => 'override-api',
        },
        transforms: {
          transform1: () => 'override-transform',
        },
      }));

    const editor = createPlateEditor({
      plugins: [basePlugin],
    });

    // Check overridden methods
    expect(editor.api.method1()).toBe('override-api');
    expect(editor.tf.transform1()).toBe('override-transform');

    // Check untouched methods
    expect(editor.api.method2()).toBe('untouched-api');
    expect(editor.tf.transform2()).toBe('untouched-transform');
  });
});
