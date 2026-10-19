import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor } from 'platejs/react';
import type { YjsAwarenessLike } from 'platejs/yjs';
import * as Y from 'yjs';

import { BaseParagraphPlugin } from '../core';
import * as YjsFacade from './index';
import * as YjsReactFacade from './react';
import { YjsPlugin } from './react';

const schema = { id: 'plate:yjs-api-test', version: 1 } as const;

const CopiedYjsPlugin = YjsPlugin.require('awareness').map({
  decorate: {
    attributes: ({ api, decoration }) => ({
      'data-collaborator': api.remoteCursor(Number(decoration.key))?.data?.name,
    }),
  },
});

const assertPrivateFacadeTypesStayPrivate = () => {
  type PrivateTypes = [
    // @ts-expect-error Native descriptor aliases are not part of the facade.
    import('platejs/yjs').YjsPlugin,
    // @ts-expect-error The old public read group is deleted.
    import('platejs/yjs').YjsState,
    // @ts-expect-error The old public update group is deleted.
    import('platejs/yjs').YjsTx,
    // @ts-expect-error The awareness wire shape is private.
    import('platejs/yjs').YjsAwarenessSelection,
    // @ts-expect-error Capability groups are inferred rather than exported.
    import('platejs/yjs').YjsBaseApi,
    // @ts-expect-error Capability groups are inferred rather than exported.
    import('platejs/yjs').YjsPresenceApi,
    // @ts-expect-error Capability groups are inferred rather than exported.
    import('platejs/yjs').YjsCompactionApi,
    // @ts-expect-error Trace contracts are package-private diagnostics.
    import('platejs/yjs').YjsTraceEntry,
    // @ts-expect-error The geometry options object is inline in the hook signature.
    import('platejs/yjs/react').UseYjsRemoteCursorGeometryOptions,
    // @ts-expect-error The deleted Plate configuration store stays deleted.
    import('platejs/yjs/react').YjsPluginState,
    // @ts-expect-error The deleted Plate descriptor alias stays deleted.
    import('platejs/yjs/react').YjsDefinition,
    // @ts-expect-error The forwarding function stays deleted.
    import('platejs/yjs/react').createYjsPlugin,
  ];

  void (null as unknown as PrivateTypes);
};

void assertPrivateFacadeTypesStayPrivate;

describe('YjsPlugin', () => {
  it('keeps platejs/yjs an exact native facade', () => {
    assert.equal(YjsFacade.yjs, YjsReactFacade.yjs);
    assert.equal(YjsFacade.YjsUpdatePolicy, YjsReactFacade.YjsUpdatePolicy);
    assert.equal('createYjsPlugin' in YjsFacade, false);
    assert.equal('BaseYjsPlugin' in YjsFacade, false);
    assert.equal('YjsPlugin' in YjsFacade, false);
    assert.equal('createYjsPlugin' in YjsReactFacade, false);
    assert.equal(YjsReactFacade.YjsPlugin, YjsPlugin);
  });

  it('preserves cursor-data inference through copied composition and portals', () => {
    const doc = new Y.Doc();
    const awareness = {
      doc,
      getLocalState: () => null,
      getStates: () => new Map(),
      off: () => {},
      on: () => {},
      setLocalStateField: () => {},
    } satisfies YjsAwarenessLike;
    const Collaboration = CopiedYjsPlugin.create({
      awareness,
      cursorData: {
        validate: (
          value
        ): value is { readonly color: string; readonly name: string } =>
          typeof value === 'object' &&
          value !== null &&
          'color' in value &&
          typeof value.color === 'string' &&
          'name' in value &&
          typeof value.name === 'string',
      },
      doc,
      initialReady: true,
      seed: true,
    });
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
      plugins: [BaseParagraphPlugin, Collaboration],
      schema,
    });
    const portal = editor.plugin(Collaboration);
    const name = portal.api.remoteCursor(202)?.data?.name;

    editor.api.yjs.setCursorData({ color: '#7c3aed', name: 'Ada' });
    portal.api.setCursorData({ color: '#7c3aed', name: 'Ada' });
    portal.api.clearSelection();

    const nameIsExact: string | undefined = name;
    void nameIsExact;

    const checkInvalidPayloads = () => {
      portal.api.syncSelection();
      // @ts-expect-error Cursor metadata is inferred from the validator.
      editor.api.yjs.setCursorData({ color: '#7c3aed', name: 42 });
      // @ts-expect-error The exact payload survives descriptor portal lookup.
      portal.api.setCursorData({ name: 'Ada' });
    };
    void checkInvalidPayloads;

    doc.destroy();
  });

  it('omits option-dependent APIs from document-only bindings', () => {
    const doc = new Y.Doc();
    const Collaboration = YjsPlugin.create({
      doc,
      initialReady: true,
      seed: true,
    });
    const editor = createEditor({
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
      plugins: [BaseParagraphPlugin, Collaboration],
      schema,
    });

    const portal = editor.plugin(Collaboration);
    const unsubscribe = portal.api.subscribeAdmissionStatus(() => {});

    portal.api.admissionStatus();
    portal.api.retryImport();
    unsubscribe();

    const checkUnavailableCapabilities = () => {
      // @ts-expect-error Presence methods require an awareness input.
      editor.plugin(Collaboration).api.remoteCursors();
      // @ts-expect-error Cursor writes require an awareness input.
      editor.api.yjs.setCursorData({ name: 'Ada' });
      // @ts-expect-error Retirement requires compaction authority options.
      editor.plugin(Collaboration).api.retireSharedEffectPeer(202);
      // @ts-expect-error Factory document identity is required.
      YjsPlugin.create({ initialReady: true });
      // @ts-expect-error Initial readiness is required.
      YjsPlugin.create({ doc });
    };
    void checkUnavailableCapabilities;

    doc.destroy();
  });

  it('infers compaction authority only when configured', () => {
    const checkCompactionInference = () => {
      const Collaboration = YjsPlugin.create({
        doc: new Y.Doc(),
        initialReady: true,
        sharedEffectCompaction: { authorityId: 'host' },
      });
      const editor = createEditor({
        initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
        plugins: [BaseParagraphPlugin, Collaboration],
        schema,
      });

      editor.plugin(Collaboration).api.retireSharedEffectPeer(202);
    };

    void checkCompactionInference;
  });

  it('keeps factories immutable, non-installable, and fresh per create', () => {
    const Required = YjsPlugin.require('awareness');
    const WithMarkers = YjsPlugin.map({
      api: () => ({ factoryMarker: () => true }),
    }).map(({ api }) => ({
      api: () => ({ secondFactoryMarker: api.factoryMarker }),
    }));
    const first = YjsPlugin.create({
      doc: new Y.Doc(),
      initialReady: true,
    });
    const second = YjsPlugin.create({
      doc: new Y.Doc(),
      initialReady: true,
    });

    assert.equal(Object.isFrozen(YjsPlugin), true);
    assert.equal(Object.isFrozen(Required), true);
    assert.equal(Object.isFrozen(WithMarkers), true);
    assert.equal('name' in YjsPlugin, false);
    assert.equal('extend' in YjsPlugin, false);
    assert.equal('configure' in YjsPlugin, false);
    assert.notEqual(Required, YjsPlugin);
    assert.notEqual(WithMarkers, YjsPlugin);
    assert.notEqual(first, second);
    assert.equal(first.name, 'yjs');
    assert.equal(second.name, 'yjs');
    const mappedDoc = new Y.Doc();
    const Mapped = WithMarkers.create({
      doc: mappedDoc,
      initialReady: true,
      seed: true,
    });
    const mappedEditor = createEditor({
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
      plugins: [BaseParagraphPlugin, Mapped],
      schema,
    });

    assert.equal(mappedEditor.plugin(Mapped).api.factoryMarker(), true);
    assert.equal(mappedEditor.plugin(Mapped).api.secondFactoryMarker(), true);

    assert.throws(
      () =>
        Reflect.apply(Required.create, Required, [
          { doc: new Y.Doc(), initialReady: true },
        ]),
      /requires `awareness`/
    );

    mappedDoc.destroy();
  });
});
