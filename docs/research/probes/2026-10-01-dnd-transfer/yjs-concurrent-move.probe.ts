// Two peers: B moves alpha after gamma offline while A edits inside alpha and
// inside beta, then B reconnects. Run from the repository root:
// bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-10-01-dnd-transfer/yjs-concurrent-move.probe.ts
import { history } from '../../../../packages/plitejs/src/history';
import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  type Element,
  schema,
  transfer,
} from '../../../../packages/plitejs/src/index';
import {
  connectYjsPeerAndSync,
  createSeededYjsHistoryPeers,
  disconnectYjsPeer,
  getPeerTopLevelTexts,
  syncConnectedPeers,
} from '../../../../packages/plitejs/test/yjs/support/collaboration';

const p = (text: string): Element => ({ children: [{ text }], type: 'paragraph' });
const PlainSchema = defineEditorSchema('schema:probe-plain', {
  elements: { paragraph: { content: schema.content.text({ default: 'text', min: 1 }) } },
  id: 'probe-plain',
  root: schema.content.types(['paragraph'], { default: { type: 'paragraph' }, min: 1 }),
  unknown: 'reject',
  version: 1,
});
const RootSchema = defineEditorSchema('schema:probe-roots', {
  elements: {
    media: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        caption: { content: schema.content.type('paragraph', { default: { type: 'paragraph' }, min: 1 }), ownership: 'exclusive' },
      },
    },
    paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
  },
  id: 'probe-roots',
  root: schema.content.types(['media', 'paragraph'], { default: { type: 'paragraph' }, min: 1 }),
  unknown: 'reject',
  version: 1,
});

const run = (label: string, withRoots: boolean) => {
  const children: Descendant[] = [p('alpha'), p('beta'), p('gamma'), p('delta')];
  const roots = withRoots ? { 'caption:1': [p('cap')] } : undefined;
  const all = withRoots
    ? [...children, { childRoots: { caption: 'caption:1' }, children: [{ text: '' }], type: 'media' } as Element]
    : children;
  const peers = createSeededYjsHistoryPeers({
    children: all,
    clientIds: ['a', 'b'],
    createEditor: () => createEditor({ plugins: [withRoots ? RootSchema : PlainSchema, history(), transfer()] }) as never,
    numericClientIds: { a: 1, b: 2 },
    ...(roots ? { roots } : {}),
  });
  const [a, b] = peers;

  disconnectYjsPeer(b);
  const out = b.editor.api.transfer.move({ nodes: [b.editor.key([0])!], to: { edge: 'after', key: b.editor.key([2])! } });
  a.editor.update.text.insert('!', { at: { path: [0, 0], offset: 5 } });
  a.editor.update.text.insert('?', { at: { path: [1, 0], offset: 4 } });
  syncConnectedPeers(peers);
  connectYjsPeerAndSync(b, peers);
  syncConnectedPeers(peers);
  syncConnectedPeers(peers);
  console.log(label, JSON.stringify(out.status), 'a', JSON.stringify(getPeerTopLevelTexts(a)), 'b', JSON.stringify(getPeerTopLevelTexts(b)));
};

run('plain', false);
run('content-roots', true);
