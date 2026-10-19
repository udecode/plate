// Probe: what does Promise<HistoryResult> actually encode at HEAD?
import { createEditor, defineEffect, definePlugin } from '/Users/zbeyens/git/plate-2/packages/plitejs/src/index.ts';
import { history } from '/Users/zbeyens/git/plate-2/packages/plitejs/src/history/index.ts';

const para = (text: string) => ({ type: 'paragraph', children: [{ text }] });
const text = (e: any) => e.read.text.string([]);
const rows: string[] = [];
const log = (k: string, v: unknown) => rows.push(`${k}\t${JSON.stringify(v)}`);

// 1. Document batch: is the effect synchronous behind the Promise?
{
  const editor: any = createEditor({ plugins: [history()], initialValue: [para('')] as any });
  editor.update({ history: 'new-batch' }, (tx: any) => tx.text.insert('A', { at: { offset: 0, path: [0, 0] } }));
  const p = editor.api.history.undo();
  log('doc.isPromise', p instanceof Promise);
  log('doc.textRightAfterCall', text(editor));
  log('doc.result', await p);
}

// 2. Session batch: sync claim, async effect; overlapping replay; owner throw.
type T = { previous: string; value: string };
let gate!: () => void;
let mode: 'ok' | 'throw' = 'ok';
let external = 'comment';
const eff = defineEffect<T>({
  history: {
    replay: async (_e, t) => {
      await new Promise<void>((r) => (gate = r));
      if (mode === 'throw') throw new Error('owner failed');
      external = t.value;
      return { status: 'applied', value: t };
    },
  },
  invert: ({ previous, value }) => ({ previous: value, value: previous }),
  key: 'probe.session',
});
const editor: any = createEditor({
  plugins: [history(), definePlugin('probe-session', { effectTypes: [eff] })],
  initialValue: [para('')] as any,
});
editor.update({ history: 'new-batch' }, (tx: any) => tx.text.insert('A', { at: { offset: 0, path: [0, 0] } }));
editor.update((tx: any) => tx.effects.emit(eff, { previous: '', value: 'comment' }));

const p1 = editor.api.history.undo();
log('session.pendingRightAfterCall', editor.read.history.pending());
log('session.externalRightAfterCall', external);
const p2 = editor.api.history.undo();
log('session.secondUndoWhilePending', await p2);
log('session.textAfterSecondUndo', text(editor));
gate();
log('session.firstResult', await p1);
log('session.externalAfterSettle', external);

// 3. Owner throw: rejection that a `void` caller drops.
editor.update((tx: any) => tx.effects.emit(eff, { previous: '', value: 'comment2' }));
mode = 'throw';
let unhandled = 0;
process.on('unhandledRejection', () => { unhandled += 1; });
void editor.api.history.undo();
gate();
await new Promise((r) => setTimeout(r, 20));
log('throw.unhandledRejectionsFromVoidCall', unhandled);
log('throw.pendingAfter', editor.read.history.pending());

console.log(rows.join('\n'));
