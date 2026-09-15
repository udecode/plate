import { createEditor } from 'platejs/react';
import type { YjsAwarenessLike } from 'platejs/yjs';
import {
  YjsPlugin,
  useYjsAdmissionStatus,
  useYjsRemoteCursor,
  useYjsRemoteCursorGeometry,
  useYjsRemoteCursorIds,
} from 'platejs/yjs/react';
import * as Y from 'yjs';

const createAwareness = (doc: Y.Doc) =>
  ({
    doc,
    getLocalState: () => null,
    getStates: () => new Map(),
    off: () => {},
    on: () => {},
    setLocalStateField: () => {},
  }) satisfies YjsAwarenessLike;

const CopiedCollaborationPlugin = YjsPlugin.require('awareness').map(
  ({ api, editor }) => {
    api.remoteCursors();
    editor.api.yjs.remoteCursors();

    return {
      decorate: {
        attributes: ({ decoration }) => ({
          'data-collaborator': api.remoteCursor(Number(decoration.key))
            ?.clientId,
        }),
        observe: ({ refresh }) =>
          api.subscribeRemoteCursors(() => refresh({ nodeKeys: [] })),
        read: ({ entry: [, path] }) => {
          editor.key(path);

          return [];
        },
      },
    };
  }
);

type Collaborator = Readonly<{
  color: string;
  name: string;
}>;

const doc = new Y.Doc();
const Collaboration = CopiedCollaborationPlugin.create({
  awareness: createAwareness(doc),
  cursorData: {
    validate: (value): value is Collaborator =>
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
  sharedEffectCompaction: { authorityId: 'host' },
});
const editor = createEditor({ plugins: [Collaboration] });
const portal = editor.plugin(Collaboration);

editor.api.yjs.setCursorData({ color: '#7c3aed', name: 'Ada' });
portal.api.setCursorData({ color: '#7c3aed', name: 'Ada' });
portal.api.remoteCursor(1)?.data?.name satisfies string | undefined;
portal.api.retireSharedEffectPeer(1);

const ConfiguredDocument = YjsPlugin.create({
  doc: new Y.Doc(),
  initialReady: true,
})
  .extend({})
  .configure({});

createEditor({ plugins: [ConfiguredDocument] });

const useVerifyExplicitEditorHooks = () => {
  useYjsAdmissionStatus(editor).state;
  useYjsRemoteCursor(editor, 1)?.data?.color satisfies string | undefined;
  useYjsRemoteCursorIds(editor) satisfies readonly number[];
  useYjsRemoteCursorGeometry(editor, 1, {
    editableRef: { current: null },
  });
};

// @ts-expect-error Copied composition preserves the validator payload.
editor.api.yjs.setCursorData({ color: '#7c3aed', name: 42 });

const DocumentOnly = YjsPlugin.create({
  doc: new Y.Doc(),
  initialReady: true,
  seed: true,
});
const documentOnlyEditor = createEditor({ plugins: [DocumentOnly] });

documentOnlyEditor.api.yjs.admissionStatus();
// @ts-expect-error Presence is absent without awareness.
documentOnlyEditor.api.yjs.remoteCursors();
// @ts-expect-error Retirement is absent without compaction authority.
documentOnlyEditor.api.yjs.retireSharedEffectPeer(1);

const useVerifyDocumentOnlyHooks = () => {
  // @ts-expect-error Presence hooks require an awareness-capable editor.
  useYjsRemoteCursor(documentOnlyEditor, 1);
};

const WithCompaction = YjsPlugin.create({
  doc: new Y.Doc(),
  initialReady: true,
  sharedEffectCompaction: { authorityId: 'host' },
});
const compactionEditor = createEditor({ plugins: [WithCompaction] });

compactionEditor.api.yjs.retireSharedEffectPeer(1);

const verifyFactoryBoundary = () => {
  // @ts-expect-error A factory is not an installable plugin descriptor.
  createEditor({ plugins: [YjsPlugin] });
  // @ts-expect-error Factory inputs must contain the required awareness key.
  CopiedCollaborationPlugin.create({
    doc: new Y.Doc(),
    initialReady: true,
  });
  // @ts-expect-error Only real option keys can be required.
  YjsPlugin.require('presence');
  // @ts-expect-error Configuration belongs to a created descriptor.
  YjsPlugin.configure({});
  // @ts-expect-error Author extension belongs to a created descriptor.
  YjsPlugin.extend({});
};

void verifyFactoryBoundary;
void useVerifyDocumentOnlyHooks;
void useVerifyExplicitEditorHooks;
