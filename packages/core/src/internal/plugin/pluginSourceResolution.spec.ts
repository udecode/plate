import { createBaseEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin/BasePlugin';
import { createBasePlugin } from '../../lib/plugin/createBasePlugin';
import { getPlateRuntime } from './compilePlateModel';
import { resolveAndSortPlugins } from './resolvePlugins';

const resolveSourceKeys = (sources: {
  baseCore?: readonly AnyBasePlugin[];
  reactCore?: readonly AnyBasePlugin[];
  user?: readonly AnyBasePlugin[];
}) => {
  const editor = createBaseEditor();

  return resolveAndSortPlugins(editor, {
    baseCore: sources.baseCore ?? [],
    reactCore: sources.reactCore ?? [],
    user: sources.user ?? [],
  } as any).map((plugin) => plugin.key);
};

describe('plugin source resolution', () => {
  it('selects whole descriptors by user, React core, then Base core precedence', () => {
    const Base = createBasePlugin({
      key: 'shared',
      options: { owner: 'base' },
    });
    const React = createBasePlugin({
      key: 'shared',
      options: { owner: 'react' },
    });
    const User = createBasePlugin({
      key: 'shared',
      options: { owner: 'user' },
    });
    const editor = createBaseEditor();
    const [winner] = resolveAndSortPlugins(editor, {
      baseCore: [Base],
      reactCore: [React],
      user: [User],
    } as any);

    expect(winner.options).toEqual({ owner: 'user' });
    expect(winner.options).not.toHaveProperty('base');
    expect(winner.options).not.toHaveProperty('react');
  });

  it('selects React core over Base core without merging descriptors', () => {
    const Base = createBasePlugin({
      key: 'shared',
      options: { base: true },
    });
    const React = createBasePlugin({
      key: 'shared',
      options: { react: true },
    });
    const editor = createBaseEditor();
    const [winner] = resolveAndSortPlugins(editor, {
      baseCore: [Base],
      reactCore: [React],
      user: [],
    } as any);

    expect(winner.options).toEqual({ react: true });
  });

  it('lets a disabled user descriptor suppress a non-required core default', () => {
    const Core = createBasePlugin({ key: 'sharedCore' });
    const editor = createBaseEditor();

    expect(
      resolveAndSortPlugins(editor, {
        baseCore: [Core],
        reactCore: [],
        user: [Core.configure({ enabled: false })],
      } as any)
    ).toEqual([]);
  });

  it('rejects two distinct explicit descriptors with one key', () => {
    expect(() =>
      resolveSourceKeys({
        user: [
          createBasePlugin({ key: 'duplicate' }),
          createBasePlugin({ key: 'duplicate' }),
        ],
      })
    ).toThrow(/duplicate.*user\[0\].*user\[1\]/i);
  });

  it('deduplicates the same explicit descriptor identity', () => {
    const Shared = createBasePlugin({ key: 'shared' });

    expect(resolveSourceKeys({ user: [Shared, Shared] })).toEqual(['shared']);
  });

  it.each([
    ['enabled then disabled', false],
    ['disabled then enabled', true],
  ])('lets a literal-disabled user descriptor suppress the same explicit key regardless of order: %s', (_name, disabledFirst) => {
    const Enabled = createBasePlugin({ key: 'suppressed' });
    const Disabled = Enabled.configure({ enabled: false });

    expect(
      resolveSourceKeys({
        user: disabledFirst ? [Disabled, Enabled] : [Enabled, Disabled],
      })
    ).toEqual([]);
  });

  it('rejects a disabled descriptor required by an enabled owner', () => {
    const Required = createBasePlugin({ key: 'required' });
    const Parent = createBasePlugin({
      dependencies: [Required],
      key: 'parent',
    });

    expect(() =>
      resolveSourceKeys({
        user: [Parent, Required.configure({ enabled: false })],
      })
    ).toThrow(/parent.*requires.*disabled.*required/i);
  });

  it('does not install relationships owned only by a disabled root', () => {
    const Dependency = createBasePlugin({ key: 'dependency' });
    const Disabled = createBasePlugin({
      dependencies: [Dependency],
      enabled: false,
      key: 'disabled',
    });

    expect(resolveSourceKeys({ user: [Disabled] })).toEqual([]);
  });

  it('uses stable Kahn ordering by priority then canonical source order', () => {
    const Shared = createBasePlugin({ key: 'shared', priority: 1 });
    const First = createBasePlugin({
      dependencies: [Shared],
      key: 'first',
      priority: 3,
    });
    const Second = createBasePlugin({
      dependencies: [Shared],
      key: 'second',
      priority: 3,
    });
    const Independent = createBasePlugin({
      key: 'independent',
      priority: 4,
    });

    expect(resolveSourceKeys({ user: [First, Second, Independent] })).toEqual([
      'independent',
      'shared',
      'first',
      'second',
    ]);
  });

  it('reserves the public root key while preserving root editor API', () => {
    expect(() =>
      createBaseEditor({
        plugins: [createBasePlugin({ key: 'root' })],
      })
    ).toThrow(/plugin key "root".*reserved/i);

    const editor = createBaseEditor({
      api: { rootMethod: () => 'root' },
    });

    expect((editor.api as any).rootMethod()).toBe('root');
    expect(getPlateRuntime(editor).plugins.root).toBeDefined();
  });

  it('does not mutate the caller plugin array while installing core roles', () => {
    const Plugin = createBasePlugin({ key: 'custom' });
    const plugins = [Plugin];

    createBaseEditor({ plugins });

    expect(plugins).toEqual([Plugin]);
  });
});
