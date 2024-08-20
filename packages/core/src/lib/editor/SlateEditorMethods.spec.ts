import { createPlateEditor } from '../../react';
import { createSlatePlugin } from '../plugin';

describe('getApi method', () => {
  it('should return correctly typed plugin API', () => {
    const TestPlugin = createSlatePlugin({
      key: 'test',
    }).extendApi(() => ({
      testMethod: () => 'test',
      testNumber: () => 42,
    }));

    const editor = createPlateEditor({
      plugins: [TestPlugin],
    });

    const testApi = editor.getApi(TestPlugin);

    // Type checking
    expect(testApi.testMethod).toBeDefined();
    expect(testApi.testNumber).toBeDefined();

    // Functionality checking
    expect(testApi.testMethod()).toBe('test');
    expect(testApi.testNumber()).toBe(42);
  });

  it('should work with generic', () => {
    const Plugin1 = createSlatePlugin({
      key: 'plugin1',
    }).extendApi(() => ({
      method1: () => 'plugin1',
    }));

    const editor = createPlateEditor({
      plugins: [Plugin1],
    });

    const api1 = editor.getApi<typeof Plugin1>();

    expect(api1.method1()).toBe('plugin1');
  });

  describe('getPlugin method', () => {
    it('should return correctly typed plugin', () => {
      const TestPlugin = createSlatePlugin({
        key: 'test',
        options: { testOption: 'value' },
      });

      const editor = createPlateEditor({
        plugins: [TestPlugin],
      });

      const plugin = editor.getPlugin(TestPlugin);

      expect(plugin.key).toBe('test');
      expect(plugin.options.testOption).toBe('value');
    });

    it('should work with generic', () => {
      const Plugin1 = createSlatePlugin({
        key: 'plugin1',
        options: { option1: 'value1' },
      });

      const editor = createPlateEditor({
        plugins: [Plugin1],
      });

      const plugin1 = editor.getPlugin<typeof Plugin1>({ key: 'plugin1' });
      expect(plugin1.options.option1).toBe('value1');
    });
  });

  describe('getOptions method', () => {
    it('should return correctly typed plugin options', () => {
      const TestPlugin = createSlatePlugin({
        key: 'test',
        options: { testOption: 'value' },
      });

      const editor = createPlateEditor({
        plugins: [TestPlugin],
      });

      const options = editor.getOptions(TestPlugin);

      expect(options.testOption).toBe('value');
    });

    it('should work with generic', () => {
      const Plugin1 = createSlatePlugin({
        key: 'plugin1',
        options: { option1: 'value1' },
      });

      const editor = createPlateEditor({
        plugins: [Plugin1],
      });

      const options1 = editor.getOptions<typeof Plugin1>({
        key: 'plugin1',
      });
      expect(options1.option1).toBe('value1');
    });
  });
});
