import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { DocumentChange, schema } from '@platejs/plite';
import ReactDOMServer from 'react-dom/server';

import { KEYS } from '@platejs/utils';
import { BaseListPlugin } from './BaseListPlugin';

const assertScopedListTypes = () => {
  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
  });
  const list = editor.plugin(BaseListPlugin);

  list.api.isActive(['disc', 'circle']);
  list.update.toggle({ at: [0], listStyleType: 'disc' });
  list.update.indent({ at: { offset: 0, path: [0, 0] } });
  list.update.outdent({
    at: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [1, 0] },
    },
  });

  editor.update((tx) => tx.indent.increase());

  // @ts-expect-error toggle requires a list style
  list.update.toggle({});
  // @ts-expect-error Indent methods stay on the Indent portal
  list.update.increase();
};

void assertScopedListTypes;

describe('BaseListPlugin', () => {
  it('keeps list blocks on the single compiled paragraph schema', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      value: [
        {
          children: [{ text: 'Item' }],
          indent: 1,
          listStyleType: 'disc',
          type: KEYS.p,
        },
      ],
    });
    const paragraph = editor.read.children()[0];

    expect(editor.read.schema.element(BaseParagraphPlugin)?.groups).toContain(
      'block'
    );
    expect(editor.read.schema.isBlock(paragraph)).toBe(true);
    expect(() =>
      editor.read.schema.validateDocument(editor.read.value())
    ).not.toThrow();
  });

  it('uses configured targets for both model validation and injection', () => {
    const CalloutPlugin = createBasePlugin({
      key: 'callout',
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      type: 'note',
    });
    const ListCalloutPlugin = BaseListPlugin.configure({
      config: { targetPluginKeys: ['callout'] },
    });
    const editor = createBaseEditor({
      plugins: [CalloutPlugin, ListCalloutPlugin],
      value: [
        {
          children: [{ text: 'Callout' }],
          listStyleType: 'disc',
          type: 'note',
        },
      ],
    });

    expect(editor.getPlugin(BaseListPlugin).config.targetPluginKeys).toEqual([
      'callout',
    ]);
    expect(editor.read.children()[0]).toMatchObject({
      listStyleType: 'disc',
      type: 'note',
    });
    expect(() =>
      editor.read.schema.validateFragment([
        {
          children: [{ text: 'Paragraph' }],
          listStyleType: 'disc',
          type: KEYS.p,
        },
      ])
    ).toThrow(
      /Schema element property "listStyleType" cannot target element "p"/
    );
  });

  it('installs Indent and exposes scoped list reads and updates', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'Item' }], type: KEYS.p }],
    });
    const list = editor.plugin(BaseListPlugin);
    const pluginKeys = editor.runtime.pluginList.map((plugin) => plugin.key);

    expect(pluginKeys.indexOf(KEYS.indent)).toBeLessThan(
      pluginKeys.indexOf(KEYS.list)
    );
    expect(list.api.isActive('disc')).toBe(false);

    list.update.toggle({ listStyleType: 'disc' });

    expect(list.api.isActive('disc')).toBe(true);
    expect(editor.read.children()[0]).toMatchObject({
      indent: 1,
      listStyleType: 'disc',
    });
  });

  it('composes indent and outdent into one undoable update', () => {
    const value = [{ children: [{ text: 'Item' }], type: KEYS.p }];
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
      value,
    });
    const list = editor.plugin(BaseListPlugin);

    list.update.indent({ at: [0], listStyleType: 'circle' });

    expect(editor.read.children()[0]).toMatchObject({
      indent: 1,
      listStyleType: 'circle',
    });
    expect(editor.read.history.undos()).toHaveLength(1);

    editor.update.history.undo();
    expect(editor.read.children()).toEqual(value);

    editor.update.history.redo();
    list.update.outdent({ at: [0] });

    expect(editor.read.children()).toEqual(value);
  });

  it('replays a frozen list update without replaying local selection or history', () => {
    const value = [
      { children: [{ text: 'First' }], type: KEYS.p },
      { children: [{ text: 'Second' }], type: KEYS.p },
    ];
    const source = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 6, path: [1, 0] },
      },
      value,
    });

    source.plugin(BaseListPlugin).update.toggle({ listStyleType: 'decimal' });

    const committedChange = source.read.lastCommit()?.changes;

    expect(committedChange).toBeDefined();

    const change = DocumentChange.fromJSON(
      JSON.parse(JSON.stringify(committedChange!.toJSON()))
    );
    expect(change.primaryClassification).toBeNull();
    const replaySelection = {
      kind: 'text' as const,
      anchor: { offset: 2, path: [1, 0] },
      focus: { offset: 2, path: [1, 0] },
    };
    const replay = createBaseEditor({
      plugins: [BaseListPlugin],
      selection: replaySelection,
      value,
    });

    replay.update({ history: 'skip' }, (tx) => tx.changes.apply(change));

    expect(replay.read.children()).toEqual(source.read.children());
    expect(replay.read.selection()).toEqual(replaySelection);
    expect(replay.read.history.undos()).toHaveLength(0);
  });

  it('flattens nested lists, block children, and derives indent metadata from html', () => {
    const transformData = (BaseListPlugin as any).inject.plugins[KEYS.html]
      .parser.transformData;
    const body = new DOMParser().parseFromString(
      transformData({
        data: '<ul><li><p>Parent</p><ul><li>Child</li></ul></li></ul>',
      }),
      'text/html'
    ).body;
    const parentItem = body.querySelector('ul > li') as HTMLElement;
    const childItem = body.querySelector('ul > ul > li') as HTMLElement;

    expect(parentItem.innerHTML).toBe('Parent');
    expect(parentItem.querySelector('p')).toBeNull();
    expect(parentItem.dataset.indent).toBe('1');
    expect(parentItem.dataset.listStyleType).toBe('disc');
    expect(childItem.dataset.indent).toBe('2');
    expect(childItem.dataset.listStyleType).toBe('disc');
  });

  it('prefers aria-level and inline list styles over derived defaults', () => {
    const transformData = (BaseListPlugin as any).inject.plugins[KEYS.html]
      .parser.transformData;
    const item = new DOMParser()
      .parseFromString(
        transformData({
          data: '<ol style="list-style-type: upper-alpha"><li aria-level="3" style="list-style-type: square"><span>Item</span></li></ol>',
        }),
        'text/html'
      )
      .body.querySelector('li') as HTMLElement;

    expect(item.dataset.indent).toBe('3');
    expect(item.dataset.listStyleType).toBe('square');
  });

  it('parses list metadata and renders list wrappers for list items', () => {
    const editor = createBaseEditor({
      plugins: [BaseListPlugin],
    });
    const plugin = editor.getPlugin(BaseListPlugin);
    const parse = plugin.parsers.html!.deserializer!.parse! as any;
    const renderBelow = plugin.render.belowNodes as any;
    const element = document.createElement('li');
    const orderedElement = {
      children: [{ text: 'Item' }],
      listStart: 4,
      listStyleType: 'decimal',
      type: editor.getType(KEYS.p),
    } as any;
    const unorderedElement = {
      children: [{ text: 'Bullet' }],
      listStyleType: 'disc',
      type: editor.getType(KEYS.p),
    } as any;
    const wrapper = renderBelow({
      children: 'Item',
      element: orderedElement,
    } as any)!;
    const markup = ReactDOMServer.renderToStaticMarkup(
      wrapper({
        children: 'Item',
        element: orderedElement,
      } as any)
    );
    const unorderedWrapper = renderBelow({
      children: 'Bullet',
      element: unorderedElement,
    } as any)!;
    const unorderedMarkup = ReactDOMServer.renderToStaticMarkup(
      unorderedWrapper({
        children: 'Bullet',
        element: unorderedElement,
      } as any)
    );

    element.setAttribute('aria-level', '2');
    element.style.listStyleType = 'circle';

    expect(
      parse({
        config: plugin.config,
        element,
        registry: {
          getType: (key: string) => editor.getType(key),
        },
      } as any)
    ).toEqual({
      indent: 2,
      listStyleType: 'circle',
      type: editor.getType(KEYS.p),
    });
    expect(markup).toContain('<ol');
    expect(markup).toContain('start="4"');
    expect(markup).toContain('<li>Item</li>');
    expect(unorderedMarkup).toContain('<ul');
    expect(unorderedMarkup).toContain('<li>Bullet</li>');
    expect(
      renderBelow({
        children: 'Item',
        element: { children: [{ text: 'Item' }], type: editor.getType(KEYS.p) },
      } as any)
    ).toBeUndefined();
  });
});
