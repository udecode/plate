import { createBaseEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';
import { createBasePlugin } from '../../lib/plugin/createBasePlugin';
import { getPlateRuntime } from './compilePlateModel';
import { resolveAndSortPlugins } from './resolvePlugins';

const resolveSourceNames = (sources: {
  baseCore?: readonly AnyBasePlugin[];
  reactCore?: readonly AnyBasePlugin[];
  user?: readonly AnyBasePlugin[];
}) => {
  const editor = createBaseEditor();

  return resolveAndSortPlugins(editor, {
    baseCore: sources.baseCore ?? [],
    reactCore: sources.reactCore ?? [],
    user: sources.user ?? [],
  } as any).map((plugin) => plugin.name);
};

describe('plugin source resolution', () => {
  it('selects whole descriptors by user, React core, then Base core precedence', () => {
    const Base = createBasePlugin({
      name: 'shared',
      initialState: { owner: 'base' },
    });
    const React = createBasePlugin({
      name: 'shared',
      initialState: { owner: 'react' },
    });
    const User = createBasePlugin({
      name: 'shared',
      initialState: { owner: 'user' },
    });
    const editor = createBaseEditor();
    const [winner] = resolveAndSortPlugins(editor, {
      baseCore: [Base],
      reactCore: [React],
      user: [User],
    } as any);

    expect(winner.initialState).toEqual({ owner: 'user' });
    expect(winner.initialState).not.toHaveProperty('base');
    expect(winner.initialState).not.toHaveProperty('react');
  });

  it('selects React core over Base core without merging descriptors', () => {
    const Base = createBasePlugin({
      name: 'shared',
      initialState: { base: true },
    });
    const React = createBasePlugin({
      name: 'shared',
      initialState: { react: true },
    });
    const editor = createBaseEditor();
    const [winner] = resolveAndSortPlugins(editor, {
      baseCore: [Base],
      reactCore: [React],
      user: [],
    } as any);

    expect(winner.initialState).toEqual({ react: true });
  });

  it('lets a disabled user descriptor suppress a non-required core default', () => {
    const Core = createBasePlugin({ name: 'sharedCore' });
    const editor = createBaseEditor();

    expect(
      resolveAndSortPlugins(editor, {
        baseCore: [Core],
        reactCore: [],
        user: [Core.configure({ enabled: false })],
      } as any)
    ).toEqual([]);
  });

  it('rejects unrelated explicit descriptor families with one name', () => {
    expect(() =>
      resolveSourceNames({
        user: [
          createBasePlugin({ name: 'duplicate' }),
          createBasePlugin({ name: 'duplicate' }),
        ],
      })
    ).toThrow(/duplicate.*user\[0\].*user\[1\]/i);
  });

  it('composes same-family descriptors in source order', () => {
    const Component = () => null;
    const Shared = createBasePlugin({
      initialState: { owner: 'base' },
      name: 'shared',
    });
    const editor = createBaseEditor({
      plugins: [
        Shared.configure({
          component: Component,
          initialState: { owner: 'first', stable: 'kept' },
        }),
        Shared.configure({ initialState: { owner: 'latest' } }),
      ],
    });
    const winner = editor.plugin(Shared).plugin;

    expect(winner.render.node).toBe(Component);
    expect(winner.initialState).toEqual({ owner: 'latest', stable: 'kept' });
  });

  it('resolves capabilities from the composed configuration', () => {
    const Shared = createBasePlugin({
      api: ({ store }) => ({
        ...(store.get().exposeExtra ? { extra: () => store.get().stable } : {}),
        owner: () => store.get().owner,
      }),
      initialState: {
        exposeExtra: false,
        owner: 'base',
        stable: 'base',
      },
      name: 'shared',
    });
    const editor = createBaseEditor({
      plugins: [
        Shared.configure({
          initialState: { exposeExtra: true, stable: 'kept' },
        }),
        Shared.configure({ initialState: { owner: 'latest' } }),
      ],
    });

    expect(editor.api.shared.owner()).toBe('latest');
    expect(editor.api.shared.extra?.()).toBe('kept');
  });

  it('rejects divergent authoring branches from one plugin family', () => {
    const Shared = createBasePlugin({ name: 'shared' });

    expect(() =>
      createBaseEditor({
        plugins: [
          Shared.extend({ initialState: { branch: 'first' } }),
          Shared.extend({ initialState: { branch: 'second' } }),
        ],
      })
    ).toThrow(/shared.*user\[0\].*user\[1\]/i);
  });

  it('deduplicates the same explicit descriptor identity', () => {
    const Shared = createBasePlugin({ name: 'shared' });

    expect(resolveSourceNames({ user: [Shared, Shared] })).toEqual(['shared']);
  });

  it.each([
    ['enabled then disabled', false],
    ['disabled then enabled', true],
  ])('lets a literal-disabled user descriptor suppress the same explicit name regardless of order: %s', (_name, disabledFirst) => {
    const Enabled = createBasePlugin({ name: 'suppressed' });
    const Disabled = Enabled.configure({ enabled: false });

    expect(
      resolveSourceNames({
        user: disabledFirst ? [Disabled, Enabled] : [Enabled, Disabled],
      })
    ).toEqual([]);
  });

  it('rejects a disabled descriptor required by an enabled owner', () => {
    const Required = createBasePlugin({ name: 'required' });
    const Parent = createBasePlugin({
      dependencies: [Required],
      name: 'parent',
    });

    expect(() =>
      resolveSourceNames({
        user: [Parent, Required.configure({ enabled: false })],
      })
    ).toThrow(/parent.*requires.*disabled.*required/i);
  });

  it('does not install relationships owned only by a disabled root', () => {
    const Dependency = createBasePlugin({ name: 'dependency' });
    const Disabled = createBasePlugin({
      dependencies: [Dependency],
      enabled: false,
      name: 'disabled',
    });

    expect(resolveSourceNames({ user: [Disabled] })).toEqual([]);
  });

  it('uses stable Kahn ordering by canonical source order', () => {
    const Shared = createBasePlugin({ name: 'shared' });
    const First = createBasePlugin({
      dependencies: [Shared],
      name: 'first',
    });
    const Second = createBasePlugin({
      dependencies: [Shared],
      name: 'second',
    });
    const Independent = createBasePlugin({ name: 'independent' });

    expect(resolveSourceNames({ user: [First, Second, Independent] })).toEqual([
      'shared',
      'first',
      'second',
      'independent',
    ]);
  });

  it('reserves the public root name while preserving root editor API', () => {
    expect(() =>
      createBaseEditor({
        plugins: [createBasePlugin({ name: 'root' })],
      })
    ).toThrow(/plugin name "root".*reserved/i);

    const editor = createBaseEditor({
      api: () => ({ rootMethod: () => 'root' }),
    });

    expect((editor.api as any).root.rootMethod()).toBe('root');
    expect(getPlateRuntime(editor).plugins.root).toBeDefined();
  });

  it('does not mutate the caller plugin array while installing core roles', () => {
    const Plugin = createBasePlugin({ name: 'custom' });
    const plugins = [Plugin];

    createBaseEditor({ plugins });

    expect(plugins).toEqual([Plugin]);
  });
});
