import ReactDOMServer from 'react-dom/server';

import { createBasePlugin } from '@platejs/core';
import { schema } from 'platejs';
import { createBaseEditor, KEYS } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BlockList } from '@/registry/ui/block-list';
import { BlockListStatic } from '@/registry/ui/block-list-static';

import { BaseListKit } from './list-base-kit';
import { ListKit } from './list-kit';

const ListTargetSchemaKit = [
  ...KEYS.heading,
  KEYS.blockquote,
  KEYS.codeBlock,
  KEYS.toggle,
  KEYS.img,
].map((type) =>
  createBasePlugin({
    key: type,
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
  listStyleType: 'disc',
  type: KEYS.p,
} as any;

const orderedElement = {
  children: [{ text: 'One' }],
  listStart: 3,
  listStyleType: 'decimal',
  type: KEYS.p,
} as any;

type ListNodePropsContract = {
  query: (options: unknown) => boolean;
  transformProps: (options: unknown) => unknown;
};

const getListNodeProps = (editor: {
  getPlugin: (plugin: { key: string }) => { inject?: { nodeProps?: unknown } };
}) =>
  editor.getPlugin({ key: KEYS.list }).inject!
    .nodeProps! as ListNodePropsContract;

describe('ListKit unordered list rendering', () => {
  it('keeps the lightweight unordered path inside the app list renderer', () => {
    expect(BlockList({ element: unorderedElement } as any)).toBeUndefined();
    expect(
      BlockListStatic({ element: unorderedElement } as any)
    ).toBeUndefined();

    const orderedWrapper = BlockList({ element: orderedElement } as any)!;
    const orderedMarkup = ReactDOMServer.renderToStaticMarkup(
      orderedWrapper({
        children: 'One',
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
              listStyleType: 'disc',
              marginLeft: '48px',
            },
          },
        } as any)
      ).toEqual({
        role: 'listitem',
        style: {
          display: 'list-item',
          listStyleType: 'disc',
          marginLeft: '48px',
        },
      });
    }
  });
});
