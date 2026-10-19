import { createEditor } from '../../lib';
import { definePlugin } from './definePlugin';
import { createPluginFactory } from './pluginFactory.internal';

const SourcePlugin = definePlugin('factorySource', {});

interface TestFactoryType {
  readonly input: Readonly<{
    label?: string;
  }>;
  readonly output: typeof SourcePlugin;
}

describe('pluginFactory', () => {
  it('constructs once and snapshots mapped object stages', () => {
    let constructions = 0;
    const stage = {
      api: () => ({ marker: () => 'captured' }),
    };
    const Factory = createPluginFactory<TestFactoryType>(() => {
      constructions += 1;

      return SourcePlugin;
    }).map(stage);

    stage.api = () => ({ marker: () => 'mutated' });

    const Plugin = Factory.create({});
    const editor = createEditor({ plugins: [Plugin] });

    expect(constructions).toBe(1);
    expect(editor.plugin(Plugin).api.marker()).toBe('captured');
  });

  it('rejects missing requirements, invalid sources, and installation', () => {
    const Factory = createPluginFactory<TestFactoryType>(() => SourcePlugin);
    const Required = Factory.require('label');
    const invalidFactory = Reflect.apply(createPluginFactory, undefined, [
      () => ({ name: 'forged' }),
    ]);

    expect(() => Reflect.apply(Required.create, Required, [{}])).toThrow(
      'requires `label`'
    );
    expect(() =>
      Reflect.apply(Reflect.get(invalidFactory, 'create'), invalidFactory, [{}])
    ).toThrow('must create a descriptor');
    expect(() =>
      Reflect.apply(createEditor, undefined, [{ plugins: [Factory] }])
    ).toThrow('must be created by definePlugin');
    expect(() => Reflect.apply(Factory.require, Factory, [])).toThrow(
      'requires at least one key'
    );
  });

  it('rejects terminal descriptors from source factories', () => {
    const configured = SourcePlugin.configure({});
    const invalidFactory = Reflect.apply(createPluginFactory, undefined, [
      () => configured,
    ]);

    expect(() =>
      Reflect.apply(Reflect.get(invalidFactory, 'create'), invalidFactory, [{}])
    ).toThrow('must create a descriptor');
  });
});
