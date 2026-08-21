import { BaseParagraphPlugin, defineBasePlugin } from '@platejs/core';
import { PLUGINS } from '@platejs/utils';
import { schema, type BaseEditor, createBaseEditor } from 'platejs';
import { createPlateEditor } from 'platejs/react';
import ReactDOMServer from 'react-dom/server';

import { BlockList } from '@/registry/components/editor/block-list';
import { BlockListStatic } from '@/registry/components/editor/block-list-static';

import { ListKit } from './list';
import { BaseListKit } from './list-static';

const ListTargetSchemaPlugins = [
  PLUGINS.heading,
  PLUGINS.blockquote,
  PLUGINS.codeBlock,
  PLUGINS.toggle,
  PLUGINS.image,
] as const;

const ListTargetSchemaKit = ListTargetSchemaPlugins.map((name) =>
  defineBasePlugin(name, {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  })
);

const unorderedElement = {
  children: [{ text: 'Bullet' }],
  indent: 2,
  listType: 'bulleted',
  type: 'paragraph',
} as any;

const orderedElement = {
  children: [{ text: 'One' }],
  listStart: 3,
  listType: 'numbered',
  type: 'paragraph',
} as any;

type ListNodePropsContract = {
  query: (options: unknown) => boolean;
  transformProps: (options: unknown) => unknown;
};

const getListNodeProps = (editor: BaseEditor) =>
  editor.plugin(PLUGINS.list).inject!.nodeProps! as ListNodePropsContract;

describe('ListKit unordered list rendering', () => {
  it('decodes configured list items as paragraphs with list properties', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, ...ListTargetSchemaKit, ...BaseListKit],
    });

    expect(
      editor.api.html.deserialize({
        element:
          '<ul><li data-checked="true" data-list-start="3">Task</li></ul>',
      })
    ).toEqual([
      {
        checked: true,
        children: [{ text: 'Task' }],
        listType: 'task',
        type: 'paragraph',
      },
    ]);
  });

  it('keeps the lightweight unordered path inside the app list renderer', () => {
    expect(BlockList({ element: unorderedElement } as any)).toBeUndefined();
    expect(
      BlockListStatic({ element: unorderedElement } as any)
    ).toBeUndefined();

    const orderedWrapper = BlockList({ element: orderedElement } as any)!;
    const orderedMarkup = ReactDOMServer.renderToStaticMarkup(
      orderedWrapper({
        children: 'One',
        editor: {
          plugin: () => ({ read: { ordinal: () => 3 } }),
        },
        element: orderedElement,
      } as any)
    );

    expect(orderedMarkup).toContain('<ol');
    expect(orderedMarkup).toContain('start="3"');
    expect(orderedMarkup).toContain('<li>One</li>');
  });

  it('injects root list-item props without wiping indent margin', () => {
    const interactiveNodeProps = getListNodeProps(
      createPlateEditor({
        plugins: [...ListTargetSchemaKit, ...ListKit],
      })
    );
    const staticNodeProps = getListNodeProps(
      createBaseEditor({
        plugins: [...ListTargetSchemaKit, ...BaseListKit],
      })
    );

    for (const nodeProps of [interactiveNodeProps, staticNodeProps]) {
      const query = nodeProps.query!;
      const transformProps = nodeProps.transformProps!;

      expect(
        query({
          nodeProps: { element: unorderedElement },
        } as any)
      ).toBe(true);
      expect(
        query({
          nodeProps: { element: orderedElement },
        } as any)
      ).toBe(false);
      expect(
        transformProps({
          props: {
            style: {
              listStyle: 'disc',
              marginLeft: '48px',
            },
          },
        } as any)
      ).toEqual({
        role: 'listitem',
        style: {
          display: 'list-item',
          listStyle: 'disc',
          marginLeft: '48px',
        },
      });
    }
  });
});
