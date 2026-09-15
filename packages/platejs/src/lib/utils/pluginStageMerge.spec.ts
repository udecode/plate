import { defineRuntimePlugin, editorCommands } from '../../facade';
import { createEditor } from '../editor';
import { definePlugin } from '../plugin';

describe('plugin API projection', () => {
  it('preserves command handlers from every ordered stage', () => {
    const calls: string[] = [];
    const Plugin = definePlugin('stagedCommands', {
      commands: ({ around }) => [
        around(editorCommands.insertBreak, ({ next }) => {
          calls.push('first');

          return next();
        }),
      ],
    }).extend(() => ({
      commands: ({ around }) => [
        around(editorCommands.insertBreak, ({ next }) => {
          calls.push('second');

          return next();
        }),
      ],
    }));
    const editor = createEditor({
      plugins: [Plugin],
      initialValue: [{ children: [{ text: 'ab' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    editor.update.break.insert();

    expect(calls).toEqual(['first', 'second']);
  });

  it('publishes one immutable API object through every Plate and Plite portal', () => {
    const NativePlugin = defineRuntimePlugin('projection', {
      api: () => ({
        nativeName: () => 'projection',
        source: () => 'native',
      }),
    });
    const ProjectionPlugin = definePlugin('projection', {
      api: () => ({
        plate: () => 'plate',
        source: () => 'plate',
      }),
    })
      .extend(NativePlugin)
      .extend(() => ({
        api: () => ({
          final: () => 'final',
          source: () => 'final',
        }),
      }));
    const editor = createEditor({
      plugins: [ProjectionPlugin],
    });
    const api = editor.api.projection;

    expect(api).toBe(editor.plugin(ProjectionPlugin).api);
    expect(api).toBe(Reflect.apply(editor.plugin, editor, [NativePlugin]).api);
    expect(api.nativeName()).toBe('projection');
    expect(api.plate()).toBe('plate');
    expect(api.final()).toBe('final');
    expect(api.source()).toBe('final');
    expect(Object.isFrozen(api)).toBe(true);
    expect(Reflect.get(editor.api, 'plate')).toBeUndefined();
    expect(Reflect.get(editor.api, 'nativeName')).toBeUndefined();
  });

  it('merges repeated owner-local API stages in declaration order', () => {
    const Plugin = definePlugin('staged', {
      api: () => ({
        first: () => 1,
        value: () => 1,
      }),
    })
      .extend(({ api }) => ({
        api: () => ({
          second: () => api.first() + 1,
          value: () => 2,
        }),
      }))
      .extend(({ api }) => ({
        api: () => ({
          third: () => api.first() + api.second(),
          value: () => 3,
        }),
      }));
    const editor = createEditor({ plugins: [Plugin] });

    expect(editor.api.staged.first()).toBe(1);
    expect(editor.api.staged.second()).toBe(2);
    expect(editor.api.staged.third()).toBe(3);
    expect(editor.api.staged.value()).toBe(3);
  });

  it('keeps identical method names isolated by plugin owner', () => {
    const FirstPlugin = definePlugin('first', {
      api: () => ({ method: () => 'first' }),
    });
    const SecondPlugin = definePlugin('second', {
      api: () => ({ method: () => 'second' }),
    });
    const editor = createEditor({
      plugins: [FirstPlugin, SecondPlugin],
    });

    expect(editor.api.first.method()).toBe('first');
    expect(editor.api.second.method()).toBe('second');
    expect(Reflect.get(editor.api, 'method')).toBeUndefined();
  });

  it('resolves API factories once per editor against owner state', () => {
    let calls = 0;
    const StatefulPlugin = definePlugin('stateful', {
      api: ({ store }) => {
        calls += 1;

        return {
          value: () => store.get().value,
        };
      },
      initialState: { value: 7 },
    });
    const first = createEditor({ plugins: [StatefulPlugin] });
    const second = createEditor({
      plugins: [StatefulPlugin.configure({ initialState: { value: 9 } })],
    });

    expect(first.api.stateful.value()).toBe(7);
    expect(second.api.stateful.value()).toBe(9);
    expect(calls).toBe(2);
  });
});
