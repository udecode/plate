import { createEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';
import { definePlugin } from '../../lib/plugin/definePlugin';
import { getPlateRuntime } from './compilePlateModel';
import {
  resolveAndSortPlugins,
  snapshotPlatePluginSources,
} from './resolvePlugins';

const resolveSourceNames = (sources: {
  baseCore?: readonly AnyBasePlugin[];
  reactCore?: readonly AnyBasePlugin[];
  user?: readonly AnyBasePlugin[];
}) => {
  const editor = createEditor();

  return resolveAndSortPlugins(editor, {
    baseCore: sources.baseCore ?? [],
    reactCore: sources.reactCore ?? [],
    user: sources.user ?? [],
  } as any).map((plugin) => plugin.name);
};

describe('plugin source resolution', () => {
  it('preserves exact dependency descriptor identity in source snapshots', () => {
    const Dependency = definePlugin('dependency', {});
    const Parent = definePlugin('parent', {
      dependencies: [Dependency],
    });
    const snapshot = snapshotPlatePluginSources({ user: [Parent] });

    expect(snapshot.user[0].dependencies[0]).toBe(Dependency);
  });

  it('selects whole descriptors by user, React core, then Base core precedence', () => {
    const Base = definePlugin('shared', {
      initialState: { owner: 'base' },
    });
    const React = definePlugin('shared', {
      initialState: { owner: 'react' },
    });
    const User = definePlugin('shared', {
      initialState: { owner: 'user' },
    });
    const editor = createEditor();
    const [winner] = resolveAndSortPlugins(editor, {
      baseCore: [Base],
      reactCore: [React],
      user: [User],
    });

    expect(winner.initialState).toEqual({ owner: 'user' });
    expect(winner.initialState).not.toHaveProperty('base');
    expect(winner.initialState).not.toHaveProperty('react');
  });

  it('selects React core over Base core without merging descriptors', () => {
    const Base = definePlugin('shared', {
      initialState: { base: true },
    });
    const React = definePlugin('shared', {
      initialState: { react: true },
    });
    const editor = createEditor();
    const [winner] = resolveAndSortPlugins(editor, {
      baseCore: [Base],
      reactCore: [React],
      user: [],
    });

    expect(winner.initialState).toEqual({ react: true });
  });

  it('lets a disabled user descriptor suppress a non-required core default', () => {
    const Core = definePlugin('sharedCore', {});
    const editor = createEditor();

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
        user: [definePlugin('duplicate', {}), definePlugin('duplicate', {})],
      })
    ).toThrow(/duplicate.*user\[0\].*user\[1\]/i);
  });

  it('composes same-family descriptors in source order', () => {
    const Component = () => null;
    const Shared = definePlugin('shared', {
      initialState: { owner: 'base', stable: 'base' },
    });
    const editor = createEditor({
      plugins: [
        Shared.configure({
          component: Component,
          initialState: { owner: 'first', stable: 'kept' },
        }),
        Shared.configure({ initialState: { owner: 'latest' } }),
      ],
    });
    const winner = editor.plugin(Shared);

    expect(winner.component).toBe(Component);
    expect(winner.initialState).toEqual({ owner: 'latest', stable: 'kept' });
  });

  it('resolves capabilities from the composed configuration', () => {
    const Shared = definePlugin('shared', {
      api: ({ store }) => ({
        ...(store.get().exposeExtra ? { extra: () => store.get().stable } : {}),
        owner: () => store.get().owner,
      }),
      initialState: {
        exposeExtra: false,
        owner: 'base',
        stable: 'base',
      },
    });
    const editor = createEditor({
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

  it('accepts a descriptor followed by one of its authoring descendants', () => {
    const Shared = definePlugin('shared', {
      api: () => ({ base: () => true }),
    });
    const Extended = Shared.extend(({ api }) => ({
      api: () => ({ extended: () => api.base() }),
    }));
    const editor = createEditor({ plugins: [Shared, Extended] });

    expect(editor.plugin(Extended).api.extended()).toBe(true);
  });

  it('rejects divergent authoring branches from one plugin family', () => {
    const Shared = definePlugin('shared', {});

    expect(() =>
      createEditor({
        plugins: [
          Shared.extend({ initialState: { branch: 'first' } }),
          Shared.extend({ initialState: { branch: 'second' } }),
        ],
      })
    ).toThrow(/shared.*user\[0\].*user\[1\]/i);
  });

  it('deduplicates the same explicit descriptor identity', () => {
    const Shared = definePlugin('shared', {});

    expect(resolveSourceNames({ user: [Shared, Shared] })).toEqual(['shared']);
  });

  it.each([
    ['enabled then disabled', false],
    ['disabled then enabled', true],
  ])(
    'lets a literal-disabled user descriptor suppress the same explicit name regardless of order: %s',
    (_name, disabledFirst) => {
      const Enabled = definePlugin('suppressed', {});
      const Disabled = Enabled.configure({ enabled: false });

      expect(
        resolveSourceNames({
          user: disabledFirst ? [Disabled, Enabled] : [Enabled, Disabled],
        })
      ).toEqual([]);
    }
  );

  it('rejects a disabled descriptor required by an enabled owner', () => {
    const Required = definePlugin('required', {});
    const Parent = definePlugin('parent', {
      dependencies: [Required],
    });

    expect(() =>
      resolveSourceNames({
        user: [Parent, Required.configure({ enabled: false })],
      })
    ).toThrow(/parent.*requires.*disabled.*required/i);
  });

  it('does not install relationships owned only by a disabled root', () => {
    const Dependency = definePlugin('dependency', {});
    const Disabled = definePlugin('disabled', {
      dependencies: [Dependency],
      enabled: false,
    });

    expect(resolveSourceNames({ user: [Disabled] })).toEqual([]);
  });

  it('uses stable Kahn ordering by canonical source order', () => {
    const Shared = definePlugin('shared', {});
    const First = definePlugin('first', {
      dependencies: [Shared],
    });
    const Second = definePlugin('second', {
      dependencies: [Shared],
    });
    const Independent = definePlugin('independent', {});

    expect(resolveSourceNames({ user: [First, Second, Independent] })).toEqual([
      'shared',
      'first',
      'second',
      'independent',
    ]);
  });

  it('reserves the public root name while preserving root editor API', () => {
    expect(() =>
      createEditor({
        plugins: [definePlugin('root', {})],
      })
    ).toThrow(/plugin name "root".*reserved/i);

    const editor = createEditor({
      api: () => ({ rootMethod: () => 'root' }),
    });

    expect((editor.api as any).root.rootMethod()).toBe('root');
    expect(getPlateRuntime(editor).plugins.root).toBeDefined();
  });

  it('does not mutate the caller plugin array while installing core roles', () => {
    const Plugin = definePlugin('custom', {});
    const plugins = [Plugin];

    createEditor({ plugins });

    expect(plugins).toEqual([Plugin]);
  });
});
