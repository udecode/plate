import {
  KEYS,
  createSlateEditor,
  type PlatePluginTxGroup,
  type SlateEditor,
} from 'platejs';
import type { EditorUpdateTransaction } from '@platejs/slate';

import {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseHeadingPlugin,
} from './BaseHeadingPlugin';

type HeadingChildPlugin = {
  handlers?: {
    onKeyDown?: unknown;
  };
  key: string;
  node: {
    isElement?: boolean;
  };
  parsers: {
    html: {
      deserializer?: {
        rules?: unknown;
      };
    };
  };
};

type HeadingPluginWithChildren = {
  plugins: HeadingChildPlugin[];
};

type HeadingTxPlugin = typeof BaseH1Plugin;

const getHeadingPlugin = (editor: SlateEditor) =>
  editor.getPlugin(BaseHeadingPlugin) as unknown as HeadingPluginWithChildren;

const runBlockToggleTx = (
  plugin: HeadingTxPlugin,
  type: string,
  isActive: boolean
) => {
  const set = mock(() => {});
  const some = mock(() => isActive);
  const unwrap = mock(() => {});
  const wrap = mock(() => {});
  const [extension] = plugin.__txExtensions;
  const txGroups = extension({
    plugin,
    type,
  } as unknown as Parameters<typeof extension>[0]);
  const group = txGroups[plugin.key] as PlatePluginTxGroup;
  const commands = group(
    {
      nodes: { set, some, unwrap, wrap },
    } as unknown as EditorUpdateTransaction,
    createSlateEditor() as SlateEditor,
    { afterCommit: () => {} }
  ) as {
    toggle: () => void;
  };

  commands.toggle();

  return { set, some, unwrap, wrap };
};

describe('BaseHeadingPlugin', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('when using default options', () => {
    it('creates plugins for all 6 heading levels', () => {
      const editor = createSlateEditor({
        plugins: [BaseHeadingPlugin],
      });

      const headingPlugin = getHeadingPlugin(editor);
      expect(headingPlugin.plugins).toHaveLength(6);

      KEYS.heading.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index];
        expect(plugin.key).toBe(level);
        expect(plugin.node.isElement).toBe(true);
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });
  });

  describe('when configuring custom levels', () => {
    it('creates plugins only for specified levels', () => {
      const editor = createSlateEditor({
        plugins: [
          BaseHeadingPlugin.configure({
            options: { levels: [1, 3, 5] },
          }),
        ],
      });

      const headingPlugin = getHeadingPlugin(editor);
      expect(headingPlugin.plugins).toHaveLength(3);

      const expectedLevels = ['h1', 'h3', 'h5'];
      expectedLevels.forEach((level, index) => {
        const plugin = headingPlugin.plugins[index];
        expect(plugin.key).toBe(level);
      });
    });
  });

  describe('when using a single level', () => {
    it('creates plugins up to the configured level', () => {
      const editor = createSlateEditor({
        plugins: [
          BaseHeadingPlugin.configure({
            options: { levels: 2 },
          }),
        ],
      });

      const headingPlugin = getHeadingPlugin(editor);
      expect(headingPlugin.plugins).toHaveLength(2);
    });
  });

  describe('nested plugins', () => {
    it('preserves heading element metadata on nested plugins', () => {
      const editor = createSlateEditor({
        plugins: [BaseHeadingPlugin],
      });

      const headingPlugin = getHeadingPlugin(editor);

      headingPlugin.plugins.forEach((plugin, index) => {
        expect(plugin.node.isElement).toBe(true);
        expect(plugin.handlers?.onKeyDown).not.toBeDefined();
        expect(plugin.parsers.html.deserializer?.rules).toEqual([
          { validNodeName: `H${index + 1}` },
        ]);
      });
    });
  });

  it.each([
    ['h1', BaseH1Plugin],
    ['h2', BaseH2Plugin],
    ['h3', BaseH3Plugin],
    ['h4', BaseH4Plugin],
    ['h5', BaseH5Plugin],
    ['h6', BaseH6Plugin],
  ])('registers the %s toggle as a transaction block toggle', (key, plugin) => {
    const inactive = runBlockToggleTx(plugin, key, false);
    const active = runBlockToggleTx(plugin, key, true);

    expect(inactive.some).toHaveBeenCalled();
    expect(inactive.set).toHaveBeenCalledWith({ type: key });
    expect(active.set).toHaveBeenCalledWith({ type: KEYS.p });
  });
});
