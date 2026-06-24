import { createBasePlateEditor } from '../editor';
import { createEditorPlugin } from '../plugin';
import { getInjectMatch } from './getInjectMatch';

const ParagraphPlugin = createEditorPlugin({
  key: 'paragraph',
  node: { isElement: true, type: 'p' },
});

const QuotePlugin = createEditorPlugin({
  key: 'quote',
  node: { isElement: true, type: 'quote' },
});

const LinkPlugin = createEditorPlugin({
  key: 'link',
  node: { isElement: true, isInline: true, type: 'a' },
});

const createMatchEditor = (plugin: ReturnType<typeof createEditorPlugin>) =>
  createBasePlateEditor({
    plugins: [ParagraphPlugin, QuotePlugin, LinkPlugin, plugin],
    value: [
      {
        children: [{ children: [{ text: 'nested' }], type: 'p' }],
        type: 'quote',
      },
    ],
  });

describe('getInjectMatch', () => {
  it('respects isElement, isBlock, and isLeaf filters', () => {
    const elementPlugin = createEditorPlugin({
      inject: { isElement: true },
      key: 'elementFilter',
    });
    const blockPlugin = createEditorPlugin({
      inject: { isBlock: true },
      key: 'blockFilter',
    });
    const leafPlugin = createEditorPlugin({
      inject: { isLeaf: true },
      key: 'leafFilter',
    });

    const editor = createMatchEditor(elementPlugin);
    const elementMatch = getInjectMatch(
      editor,
      editor.getPlugin(elementPlugin)
    );
    const blockMatch = getInjectMatch(
      createMatchEditor(blockPlugin),
      createMatchEditor(blockPlugin).getPlugin(blockPlugin)
    );
    const leafMatch = getInjectMatch(
      createMatchEditor(leafPlugin),
      createMatchEditor(leafPlugin).getPlugin(leafPlugin)
    );

    expect(elementMatch({ text: 'leaf' } as any, [0, 0])).toBe(false);
    expect(
      elementMatch({ children: [{ text: 'leaf' }], type: 'p' } as any, [0])
    ).toBe(true);
    expect(
      blockMatch({ children: [{ text: 'leaf' }], type: 'a' } as any, [0])
    ).toBe(false);
    expect(
      blockMatch({ children: [{ text: 'leaf' }], type: 'p' } as any, [0])
    ).toBe(true);
    expect(
      leafMatch({ children: [{ text: 'leaf' }], type: 'p' } as any, [0])
    ).toBe(false);
    expect(leafMatch({ text: 'leaf' } as any, [0, 0])).toBe(true);
  });

  it('respects targetPlugins and excludePlugins', () => {
    const targetPlugin = createEditorPlugin({
      inject: { targetPlugins: ['paragraph'] },
      key: 'targetFilter',
    });
    const excludePlugin = createEditorPlugin({
      inject: { excludePlugins: ['quote'] },
      key: 'excludeFilter',
    });

    const targetEditor = createMatchEditor(targetPlugin);
    const excludeEditor = createMatchEditor(excludePlugin);
    const targetMatch = getInjectMatch(
      targetEditor,
      targetEditor.getPlugin(targetPlugin)
    );
    const excludeMatch = getInjectMatch(
      excludeEditor,
      excludeEditor.getPlugin(excludePlugin)
    );

    expect(
      targetMatch({ children: [{ text: 'leaf' }], type: 'p' } as any, [0])
    ).toBe(true);
    expect(
      targetMatch({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(false);
    expect(
      excludeMatch({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(false);
    expect(
      excludeMatch({ children: [{ text: 'leaf' }], type: 'p' } as any, [0])
    ).toBe(true);
  });

  it('respects excludeBelowPlugins and maxLevel', () => {
    const plugin = createEditorPlugin({
      inject: {
        excludeBelowPlugins: ['quote'],
        maxLevel: 1,
      },
      key: 'depthFilter',
    });

    const editor = createMatchEditor(plugin);
    const match = getInjectMatch(editor, editor.getPlugin(plugin));

    expect(
      match({ children: [{ text: 'leaf' }], type: 'p' } as any, [0, 0])
    ).toBe(false);
    expect(
      match({ children: [{ text: 'leaf' }], type: 'quote' } as any, [0])
    ).toBe(true);
    expect(
      match({ children: [{ text: 'leaf' }], type: 'p' } as any, [0, 0, 0])
    ).toBe(false);
  });
});
