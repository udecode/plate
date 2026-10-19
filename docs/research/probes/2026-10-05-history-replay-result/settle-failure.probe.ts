// Probe: sync owner timing (P6) and a throwing settle commit (P7) at HEAD.
import { createEditor, defineEffect, definePlugin } from '/Users/zbeyens/git/plate-2/packages/plitejs/src/index.ts';
import { history } from '/Users/zbeyens/git/plate-2/packages/plitejs/src/history/index.ts';

const para = (text: string) => ({ type: 'paragraph', children: [{ text }] });
const rows: string[] = [];
const log = (k: string, v: unknown) => rows.push(`${k}\t${JSON.stringify(v)}`);
type T = { previous: string; value: string; poison?: unknown };

const setup = (replay: (t: T) => any, key: string) => {
  const eff = defineEffect<T>({
    history: { replay: (_e, t) => replay(t) },
    invert: ({ previous, value }) => ({ previous: value, value: previous }),
    key,
  });
  const editor: any = createEditor({
    plugins: [history(), definePlugin(`p-${key}`, { effectTypes: [eff] })],
    initialValue: [para('')] as any,
  });
  editor.update({ history: 'new-batch' }, (tx: any) => tx.text.insert('A', { at: { offset: 0, path: [0, 0] } }));
  editor.update((tx: any) => tx.effects.emit(eff, { previous: '', value: 'x' }));
  return editor;
};

// P6: a synchronous owner result still goes pending and settles after a microtask.
{
  let external = 'x';
  const editor = setup((t) => { external = t.value; return { status: 'applied', value: t }; }, 'sync-owner');
  const p = editor.api.history.undo();
  log('syncOwner.pendingRightAfterCall', editor.read.history.pending());
  log('syncOwner.externalRightAfterCall', external);
  log('syncOwner.result', await p);
  log('syncOwner.pendingAfterAwait', editor.read.history.pending());
}

// Control for P7: a well-formed applied value settles and clears pending.
{
  const editor = setup(async (t) => ({ status: 'applied', value: t }), 'control');
  log('control.result', await editor.api.history.undo());
  log('control.pendingAfter', editor.read.history.pending());
}

// P7: owner applied, but its value cannot be cloned, so the settle step throws.
{
  const editor = setup(async (t) => ({ status: 'applied', value: { ...t, poison: () => {} } }), 'poison');
  let rejection: unknown = null;
  try { await editor.api.history.undo(); } catch (error) { rejection = String(error).slice(0, 80); }
  log('poison.rejection', rejection);
  log('poison.pendingAfter', editor.read.history.pending());
  editor.update({ history: 'new-batch' }, (tx: any) => tx.text.insert('B', { at: { offset: 0, path: [0, 0] } }));
  log('poison.nextUndoAfterNewEdit', await editor.api.history.undo());
  log('poison.textAfterNextUndo', editor.read.text.string([]));
}

console.log(rows.join('\n'));
