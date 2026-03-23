/* biome-ignore-all lint/suspicious/noMisplacedAssertion: collaboration fixtures are executed inside index.slow.ts tests */
import * as Y from 'yjs';

import { BaseYjsPlugin } from '../../BaseYjsPlugin';
import {
  appendSharedContent,
  CollaborationConnector,
  createCollaborationEditor,
  createMixedProviderEditor,
  getDocChildren,
  initEditor,
  replaceSharedContent,
  runWithImmediateTimeout,
  settle,
} from './harness';

const BASE_VALUE = [{ type: 'p', children: [{ text: 'hello world' }] }];
const HTML_VALUE = [{ type: 'p', children: [{ text: 'from html' }] }];
const UPDATED_VALUE = [{ type: 'p', children: [{ text: 'hello again' }] }];
const PEER_ONE_APPEND = [{ type: 'p', children: [{ text: 'peer one' }] }];
const PEER_TWO_APPEND = [{ type: 'p', children: [{ text: 'peer two' }] }];
const ORDERED_APPEND_ONE = [{ type: 'p', children: [{ text: 'step one' }] }];
const ORDERED_APPEND_TWO = [{ type: 'p', children: [{ text: 'step two' }] }];

const getYdoc = (editor: any) => editor.getOptions(BaseYjsPlugin).ydoc as Y.Doc;

const getSharedType = (editor: any) =>
  editor.getOptions(BaseYjsPlugin).sharedType as Y.XmlText | null;

const createNestedParentDoc = (seed?: Uint8Array) => {
  const parentDoc = new Y.Doc();

  if (seed) {
    Y.applyUpdate(parentDoc, seed);
  } else {
    parentDoc.getMap('editors').set('main', new Y.XmlText());
  }

  return {
    parentDoc,
    sharedType: parentDoc.getMap('editors').get('main') as Y.XmlText,
  };
};

const getNodeTexts = (children: any[]) =>
  children.map((node) =>
    (node.children ?? []).map((child: any) => child.text ?? '').join('')
  );

export const collaborationFixtures = [
  {
    name: 'seed_once_from_empty_doc',
    run: async () => {
      const connector = new CollaborationConnector();
      const first = createCollaborationEditor({
        connector,
        peerId: 'peer-1',
      });

      await initEditor({
        connector,
        editor: first,
        init: {
          id: 'room-seed-once',
          value: BASE_VALUE as any,
        },
      });

      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
      });

      await initEditor({
        connector,
        editor: second,
        flushBeforeAwait: true,
        init: {
          id: 'room-seed-once',
          value: BASE_VALUE as any,
        },
      });

      expect(getDocChildren({ ydoc: getYdoc(first) })).toEqual(BASE_VALUE);
      expect(getDocChildren({ ydoc: getYdoc(second) })).toEqual(BASE_VALUE);
    },
  },
  {
    name: 'server_content_wins_over_local_value',
    run: async () => {
      const connector = new CollaborationConnector();
      const first = createCollaborationEditor({
        connector,
        peerId: 'peer-1',
      });

      await initEditor({
        connector,
        editor: first,
        init: {
          id: 'room-server-wins',
          value: BASE_VALUE as any,
        },
      });

      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
      });

      await initEditor({
        connector,
        editor: second,
        flushBeforeAwait: true,
        init: {
          id: 'room-server-wins',
          value: [{ type: 'p', children: [{ text: 'local draft' }] }] as any,
        },
      });

      expect(getDocChildren({ ydoc: getYdoc(second) })).toEqual(BASE_VALUE);
    },
  },
  {
    name: 'string_value_deserializes_once',
    run: async () => {
      const connector = new CollaborationConnector();
      const first = createCollaborationEditor({
        connector,
        peerId: 'peer-1',
      });
      const firstDeserializeSpy = spyOn(
        first.api.html,
        'deserialize'
      ).mockReturnValue(HTML_VALUE as any);

      await initEditor({
        connector,
        editor: first,
        init: {
          id: 'room-string',
          value: '<p>from html</p>',
        },
      });

      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
      });
      const secondDeserializeSpy = spyOn(
        second.api.html,
        'deserialize'
      ).mockReturnValue([
        { type: 'p', children: [{ text: 'should skip' }] },
      ] as any);

      await initEditor({
        connector,
        editor: second,
        flushBeforeAwait: true,
        init: {
          id: 'room-string',
          value: '<p>from html</p>',
        },
      });

      expect(firstDeserializeSpy).toHaveBeenCalledTimes(1);
      expect(secondDeserializeSpy).not.toHaveBeenCalled();
      expect(getDocChildren({ ydoc: getYdoc(second) })).toEqual(HTML_VALUE);
    },
  },
  {
    name: 'async_value_waits_then_converges',
    run: async () => {
      const connector = new CollaborationConnector();
      const first = createCollaborationEditor({
        connector,
        peerId: 'peer-1',
      });
      let resolveValue!: (value: unknown) => void;
      const asyncValue = mock(
        () =>
          new Promise((resolve) => {
            resolveValue = resolve;
          })
      );

      const initPromise = first.api.yjs.init({
        id: 'room-async',
        value: asyncValue as any,
      });

      await settle();

      expect(
        (getYdoc(first).get('content', Y.XmlText) as Y.XmlText).length
      ).toBe(0);
      expect(getDocChildren({ ydoc: getYdoc(first) })).not.toEqual(BASE_VALUE);
      expect(typeof resolveValue).toBe('function');

      resolveValue(BASE_VALUE as any);

      await initPromise;
      await connector.flushAll();

      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
      });

      await initEditor({
        connector,
        editor: second,
        flushBeforeAwait: true,
        init: {
          id: 'room-async',
        },
      });

      expect(asyncValue).toHaveBeenCalledTimes(1);
      expect(getDocChildren({ ydoc: getYdoc(second) })).toEqual(BASE_VALUE);
    },
  },
  {
    name: 'custom_shared_type_nested_doc',
    run: async () => {
      const connector = new CollaborationConnector();
      const bootstrap = createNestedParentDoc();
      const templateUpdate = Y.encodeStateAsUpdate(bootstrap.parentDoc);
      const { parentDoc: firstParentDoc, sharedType: firstSharedType } =
        createNestedParentDoc(templateUpdate);
      const first = createCollaborationEditor({
        connector,
        peerId: 'peer-1',
        sharedType: firstSharedType,
        ydoc: firstParentDoc,
      });

      await initEditor({
        connector,
        editor: first,
        init: {
          id: 'room-custom-shared-type',
          value: BASE_VALUE as any,
        },
      });

      const { parentDoc: secondParentDoc, sharedType: secondSharedType } =
        createNestedParentDoc(templateUpdate);
      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
        sharedType: secondSharedType,
        ydoc: secondParentDoc,
      });

      await initEditor({
        connector,
        editor: second,
        flushBeforeAwait: true,
        init: {
          id: 'room-custom-shared-type',
          value: BASE_VALUE as any,
        },
      });

      expect(
        getDocChildren({
          sharedType: getSharedType(first),
          ydoc: getYdoc(first),
        })
      ).toEqual(BASE_VALUE);
      expect(
        getDocChildren({
          sharedType: getSharedType(second),
          ydoc: getYdoc(second),
        })
      ).toEqual(BASE_VALUE);
      expect(
        (firstParentDoc.get('content', Y.XmlText) as Y.XmlText).length
      ).toBe(0);
      expect(
        (secondParentDoc.get('content', Y.XmlText) as Y.XmlText).length
      ).toBe(0);
    },
  },
  {
    name: 'reconnect_eventually_converges',
    run: async () => {
      const connector = new CollaborationConnector();
      const first = createCollaborationEditor({
        connector,
        peerId: 'peer-1',
      });

      await initEditor({
        connector,
        editor: first,
        init: {
          id: 'room-reconnect',
          value: BASE_VALUE as any,
        },
      });

      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
      });

      await initEditor({
        connector,
        editor: second,
        flushBeforeAwait: true,
        init: {
          id: 'room-reconnect',
          value: BASE_VALUE as any,
        },
      });

      second.api.yjs.disconnect();
      await settle();

      await replaceSharedContent({
        value: UPDATED_VALUE as any,
        ydoc: getYdoc(first),
      });
      await connector.flushAll();

      second.api.yjs.connect();
      await connector.flushAll();
      await settle();

      expect(getDocChildren({ ydoc: getYdoc(first) })).toEqual(UPDATED_VALUE);
      expect(getDocChildren({ ydoc: getYdoc(second) })).toEqual(UPDATED_VALUE);
    },
  },
  {
    name: 'concurrent_local_edits_while_disconnected_eventually_converge',
    run: async () => {
      const connector = new CollaborationConnector();
      const first = createCollaborationEditor({
        connector,
        peerId: 'peer-1',
      });

      await initEditor({
        connector,
        editor: first,
        init: {
          id: 'room-concurrent-disconnect',
          value: BASE_VALUE as any,
        },
      });

      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
      });

      await initEditor({
        connector,
        editor: second,
        flushBeforeAwait: true,
        init: {
          id: 'room-concurrent-disconnect',
          value: BASE_VALUE as any,
        },
      });

      first.api.yjs.disconnect();
      second.api.yjs.disconnect();
      await settle();

      await appendSharedContent({
        value: PEER_ONE_APPEND as any,
        ydoc: getYdoc(first),
      });
      await appendSharedContent({
        value: PEER_TWO_APPEND as any,
        ydoc: getYdoc(second),
      });

      first.api.yjs.connect();
      second.api.yjs.connect();
      await connector.flushAll();
      await settle();

      const firstChildren = getDocChildren({ ydoc: getYdoc(first) });
      const secondChildren = getDocChildren({ ydoc: getYdoc(second) });

      expect(secondChildren).toEqual(firstChildren);
      expect(getNodeTexts(firstChildren).sort()).toEqual([
        'hello world',
        'peer one',
        'peer two',
      ]);
    },
  },
  {
    name: 'out_of_order_updates_eventually_converge',
    run: async () => {
      const connector = new CollaborationConnector();
      const first = createCollaborationEditor({
        connector,
        peerId: 'peer-1',
      });

      await initEditor({
        connector,
        editor: first,
        init: {
          id: 'room-out-of-order',
          value: BASE_VALUE as any,
        },
      });

      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
      });

      await initEditor({
        connector,
        editor: second,
        flushBeforeAwait: true,
        init: {
          id: 'room-out-of-order',
          value: BASE_VALUE as any,
        },
      });

      await appendSharedContent({
        value: ORDERED_APPEND_ONE as any,
        ydoc: getYdoc(first),
      });
      await appendSharedContent({
        value: ORDERED_APPEND_TWO as any,
        ydoc: getYdoc(first),
      });

      await connector.flushAll({ order: 'reverse' });
      await settle();

      expect(getDocChildren({ ydoc: getYdoc(first) })).toEqual([
        ...BASE_VALUE,
        ...ORDERED_APPEND_ONE,
        ...ORDERED_APPEND_TWO,
      ]);
      expect(getDocChildren({ ydoc: getYdoc(second) })).toEqual([
        ...BASE_VALUE,
        ...ORDERED_APPEND_ONE,
        ...ORDERED_APPEND_TWO,
      ]);
    },
  },
  {
    name: 'timeout_then_late_sync_does_not_reseed',
    run: async () => {
      const connector = new CollaborationConnector();
      const first = createCollaborationEditor({
        connector,
        peerId: 'peer-1',
      });

      await initEditor({
        connector,
        editor: first,
        init: {
          id: 'room-timeout',
          value: BASE_VALUE as any,
        },
      });

      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
      });

      await runWithImmediateTimeout(async () => {
        await second.api.yjs.init({
          id: 'room-timeout',
          value: BASE_VALUE as any,
        });
      });

      await connector.flushAll();
      await settle();

      expect(getDocChildren({ ydoc: getYdoc(first) })).toEqual(BASE_VALUE);
      expect(getDocChildren({ ydoc: getYdoc(second) })).toEqual(BASE_VALUE);
    },
  },
  {
    name: 'mixed_provider_inputs',
    run: async () => {
      const connector = new CollaborationConnector();
      const { editor: first, passiveProvider } = createMixedProviderEditor({
        connector,
        peerId: 'peer-1',
        value: BASE_VALUE as any,
      });

      await initEditor({
        connector,
        editor: first,
        init: {
          id: 'room-mixed',
          value: BASE_VALUE as any,
        },
      });

      const second = createCollaborationEditor({
        connector,
        peerId: 'peer-2',
      });

      await initEditor({
        connector,
        editor: second,
        flushBeforeAwait: true,
        init: {
          id: 'room-mixed',
          value: BASE_VALUE as any,
        },
      });

      expect(passiveProvider.connect).toHaveBeenCalledTimes(1);
      expect(getDocChildren({ ydoc: getYdoc(first) })).toEqual(BASE_VALUE);
      expect(getDocChildren({ ydoc: getYdoc(second) })).toEqual(BASE_VALUE);
    },
  },
] as const;
