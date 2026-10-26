import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  NodeApi,
  property,
  schema,
  target,
} from '../../src/index';
import { getDefined } from '../../src/internal/get-defined';
import { authoredTestApi } from '../support/authored';
import {
  createYjsPeerWithEditor,
  type Peer,
  readPeerChildren,
  syncConnectedPeers,
} from './support/collaboration';

const Links = defineEditorSchema('schema:yjs-authored-inline-split', {
  elements: {
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
    paragraph: {
      content: schema.content.any(
        [schema.content.text(), schema.content.type('link')],
        { default: 'text', min: 1 }
      ),
    },
  },
  id: 'yjs-authored-inline-split',
  properties: [
    schema.elementProperty('url', property.string(), {
      target: target.type('link'),
    }),
    // Stands for an element id, which a split drops from its new half.
    schema.elementProperty('ref', property.string(), {
      split: 'drop',
      target: target.type('link'),
    }),
  ],
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const orders = ['first-peer-first', 'second-peer-first'] as const;
const clientIdOrders = ['first-peer-lower', 'first-peer-higher'] as const;

// Fixed so a run's merge order does not depend on Yjs's random client ids.
const CLIENT_IDS: Readonly<Record<string, number>> = {
  alice: 1,
  carol: 2,
  ed: 4,
  reader: 5,
  zed: 3,
};

/**
 * A peer whose author can change between writes. Each author numbers its own
 * changes, so Carol's first change is `carol:1`.
 */
const createPeer = (
  author: string,
  intent: 'edit' | 'propose',
  children: readonly Descendant[],
  seedUpdate?: Uint8Array,
  clientIds = CLIENT_IDS
) => {
  let current = author;
  const counts = new Map<string, number>();
  const peer = createYjsPeerWithEditor(
    createEditor({
      initialValue: children,
      plugins: [
        Links,
        createAuthoredPlugin({
          authorId: () => current,
          createChangeId: () => {
            const count = (counts.get(current) ?? 0) + 1;

            counts.set(current, count);

            return `${current}:${count}`;
          },
          intent,
          now: () => 1,
        }),
        history(),
      ],
    }),
    {
      children,
      clientId: author,
      numericClientId: getDefined(clientIds[author]),
      seedUpdate,
    }
  );

  return {
    ...peer,
    as: (name: string) => {
      current = name;

      return peer.editor;
    },
  };
};

type AuthoredPeer = ReturnType<typeof createPeer>;

const joinPeer = (
  from: Peer,
  author: string,
  intent: 'edit' | 'propose',
  clientIds = CLIENT_IDS
) =>
  createPeer(
    author,
    intent,
    [{ children: [{ text: 'seed' }], type: 'paragraph' }],
    Y.encodeStateAsUpdate(from.doc),
    clientIds
  );

const sync = (
  peers: readonly [AuthoredPeer, AuthoredPeer],
  order: (typeof orders)[number]
) =>
  syncConnectedPeers(
    order === 'first-peer-first' ? peers : [peers[1], peers[0]]
  );

/** Each block's links as `text@url#ref`, and its other letters, without review marks. */
const shape = (children: readonly Descendant[]) =>
  children.map((block) =>
    NodeApi.isElement(block)
      ? block.children.flatMap((child) =>
          NodeApi.isElement(child)
            ? [
                [
                  NodeApi.string(child),
                  typeof child.url === 'string' ? `@${child.url}` : '',
                  typeof child.ref === 'string' ? `#${child.ref}` : '',
                ].join(''),
              ]
            : NodeApi.string(child)
              ? [NodeApi.string(child)]
              : []
        )
      : []
  );

/** Every peer's shape, and the shape of a peer that joins from the first. */
const shapes = (peers: readonly AuthoredPeer[]) => ({
  fresh: shape(readPeerChildren(joinPeer(peers[0], 'reader', 'edit'))),
  peers: peers.map((peer) => shape(readPeerChildren(peer))),
});

const pendingLink = () => {
  const own = [{ at: 1, author: 'alice', change: 'alice:1', kind: 'insert' }];

  return [
    {
      children: [
        { text: '' },
        {
          authored: own,
          children: [{ authored: own, text: 'ab' }],
          type: 'link',
          url: 'u',
        },
        { text: '' },
      ],
      type: 'paragraph',
    },
  ];
};

/**
 * Alice holds the document; Carol and anyone else join from her Y.Doc. With
 * `ids` reversed, Alice takes Carol's client id and Carol takes Alice's.
 */
const startFrom = (
  children: readonly Descendant[],
  ids: (typeof clientIdOrders)[number] = 'first-peer-lower'
) => {
  const clientIds =
    ids === 'first-peer-lower'
      ? CLIENT_IDS
      : { ...CLIENT_IDS, alice: CLIENT_IDS.carol, carol: CLIENT_IDS.alice };
  const alice = createPeer('alice', 'propose', children, undefined, clientIds);
  const carol = joinPeer(alice, 'carol', 'propose', clientIds);

  return { alice, carol };
};

const setUrl = (peer: AuthoredPeer, url: string, at: number[]) =>
  peer.editor.update.nodes.set({ url }, { at });

describe('plitejs/yjs authored inline split', () => {
  for (const order of orders) {
    it(`a split inside a pending link keeps both halves when the link's author sets its url offline, ${order}`, () => {
      const { alice, carol } = startFrom(pendingLink());

      carol.editor.update.nodes.split({
        always: true,
        at: { offset: 1, path: [0, 1, 0] },
        match: (node) => NodeApi.isElement(node) && node.type === 'link',
      });
      setUrl(alice, 'v', [0, 1]);
      sync([alice, carol], order);

      assert.deepEqual(shapes([alice, carol]), {
        fresh: [['a@v', 'b@u']],
        peers: [[['a@v', 'b@u']], [['a@v', 'b@u']]],
      });
    });

    it(`an Enter inside a pending link while its author sets its url offline shows the link once, ${order}`, () => {
      const { alice, carol } = startFrom(pendingLink());

      carol.editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 1, path: [0, 1, 0] },
          focus: { offset: 1, path: [0, 1, 0] },
        });
        tx.break.insert();
      });
      setUrl(alice, 'v', [0, 1]);
      sync([alice, carol], order);

      assert.deepEqual(shapes([alice, carol]), {
        fresh: [['a@v'], ['b@u']],
        peers: [
          [['a@v'], ['b@u']],
          [['a@v'], ['b@u']],
        ],
      });
    });

    it(`accepting an inline split while a peer sets the right half's url keeps one line, ${order}`, () => {
      const { alice: carol, carol: zed } = startFrom([
        {
          children: [
            { text: '' },
            { children: [{ text: 'ab' }], type: 'link', url: 'u' },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ]);

      carol.as('carol').update.nodes.split({
        always: true,
        at: { offset: 1, path: [0, 1, 0] },
        match: (node) => NodeApi.isElement(node) && node.type === 'link',
      });
      const ed = joinPeer(carol, 'ed', 'edit');

      syncConnectedPeers([carol, zed, ed]);
      assert.equal(
        authoredTestApi(zed.as('zed')).decide({
          action: 'accept',
          changes: ['carol:1'],
        }).status,
        'applied'
      );
      setUrl(ed, 'w', [0, 3]);
      sync([zed, ed], order);
      syncConnectedPeers([carol, zed, ed]);

      assert.deepEqual(shapes([zed, ed, carol]), {
        fresh: [['a@u', 'b@w']],
        peers: [[['a@u', 'b@w']], [['a@u', 'b@w']], [['a@u', 'b@w']]],
      });
    });

    it(`two peers that reject a pending inline split and accept the removal of its left half keep one link, ${order}`, () => {
      const { alice: writer, carol: reviewer } = startFrom([
        {
          children: [
            { text: '' },
            { children: [{ text: 'ab' }], ref: 'r1', type: 'link' },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ]);

      writer.as('carol').update.nodes.split({
        always: true,
        at: { offset: 1, path: [0, 1, 0] },
        match: (node) => NodeApi.isElement(node) && node.type === 'link',
      });
      writer.as('dave').update.nodes.remove({ at: [0, 1] });
      syncConnectedPeers([writer, reviewer]);
      const decisions = [
        { action: 'reject' as const, changes: ['carol:1'] },
        { action: 'accept' as const, changes: ['dave:1'] },
      ];

      for (const peer of [writer, reviewer]) {
        assert.equal(
          authoredTestApi(peer.as('zed')).decide(decisions).status,
          'applied'
        );
      }
      sync([writer, reviewer], order);

      assert.deepEqual(shapes([writer, reviewer]), {
        fresh: [['b#r1']],
        peers: [[['b#r1']], [['b#r1']]],
      });
    });

    for (const ids of clientIdOrders) {
      it(`two peers that reject a pending inline split before they sync keep one paragraph, ${order}, ${ids}`, () => {
        const { alice: writer, carol: reviewer } = startFrom(
          [
            {
              children: [
                { text: '' },
                { children: [{ text: 'ab' }], ref: 'r1', type: 'link' },
                { text: '' },
              ],
              type: 'paragraph',
            },
          ],
          ids
        );

        writer.as('carol').update.nodes.split({
          always: true,
          at: { offset: 1, path: [0, 1, 0] },
          match: (node) => NodeApi.isElement(node) && node.type === 'link',
        });
        syncConnectedPeers([writer, reviewer]);

        for (const peer of [writer, reviewer]) {
          assert.equal(
            authoredTestApi(peer.as('zed')).decide({
              action: 'reject',
              changes: ['carol:1'],
            }).status,
            'applied'
          );
        }
        sync([writer, reviewer], order);

        assert.deepEqual(shapes([writer, reviewer]), {
          fresh: [['ab#r1']],
          peers: [[['ab#r1']], [['ab#r1']]],
        });
      });
    }
  }
});
