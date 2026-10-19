// PROTOTYPE, throwaway. Run from the repo root:
//   bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-10-01-autocomplete-ordinary-text/run.prototype.ts [--tui]
import {
  createEditor,
  createEditorView,
  type Element,
} from 'plitejs';
import { history } from 'plitejs/history';

import { defineTestSchema } from '../../../../packages/plitejs/test/support/schema';

import {
  complete,
  dismiss,
  readMatch,
  readSuggestion,
  type QueryOptions,
  type Session,
} from './query.prototype';

const options: QueryOptions = {
  previousChar: /^\s?$/u,
  queryChar: /\S/u,
  triggers: ['@', ':'],
};
const people = ['Joan', 'John', 'Jordan', 'Maya'];
const Mention = defineTestSchema('mention-prototype', { mention: { void: 'inline' } });
const paragraph = (text: string): Element => ({ type: 'paragraph', children: [{ text }] });
const setup = (text = 'Hi ') => {
  const editor = createEditor({
    initialValue: { children: [paragraph(text)], roots: { header: [paragraph('Title')] } },
    plugins: [Mention, history()],
  });
  editor.update((tx) => tx.selection.set({ path: [0, 0], offset: text.length }));
  return { editor, main: createEditorView(editor), header: createEditorView(editor, { root: 'header' }) };
};
const type = (view: ReturnType<typeof setup>['main'], text: string) => {
  for (const char of text) view.update.text.insert(char);
};
const docText = (editor: ReturnType<typeof setup>['editor'], root?: string) =>
  JSON.stringify((root ? editor.read.value().roots?.[root] : editor.read.value().children) ?? editor.read.value());
const options$ = (query: string) => people.filter((name) => name.toLowerCase().startsWith(query.toLowerCase()));
/** Completion re-reads the live match and refuses a stale one. */
const completeCurrent = (view: ReturnType<typeof setup>['main'], expectedQuery: string, value: string) => {
  const match = readMatch(view, options);
  if (!match || match.query !== expectedQuery) return false;
  complete(view, match, (tx) => {
    tx.nodes.insert({ type: 'mention', value, children: [{ text: '' }] } as Element);
    tx.text.insert(' ');
  });
  return true;
};

const results: [string, boolean, string][] = [];
const check = (name: string, ok: boolean, detail: unknown) => results.push([name, ok, JSON.stringify(detail)]);

const scenarios = () => {
  {
    const { main } = setup();
    type(main, '@jo');
    const m = readMatch(main, options);
    check('trigger after space opens with query', m?.query === 'jo' && m.trigger === '@', m);
  }
  {
    const { main } = setup('mail a');
    type(main, '@b');
    check('trigger inside a word does not open', readMatch(main, options) === null, readMatch(main, options));
  }
  {
    const { main } = setup();
    const session: Session = { dismissed: null };
    type(main, '@jo');
    const first = readSuggestion(main, session, options);
    dismiss(main, session, first.match!);
    const afterEscape = readSuggestion(main, session, options);
    type(main, 'h');
    const afterTyping = readSuggestion(main, session, options);
    check('Escape closes and typing on keeps it closed', !afterEscape.open && !afterTyping.open && afterTyping.match?.query === 'joh', { afterEscape: afterEscape.open, afterTyping });
    main.update.text.delete({ distance: 4, reverse: true });
    const cleared = readSuggestion(main, session, options);
    type(main, '@m');
    const retyped = readSuggestion(main, session, options);
    check('deleting the trigger ends suppression; a new trigger opens', !cleared.match && session.dismissed === null && retyped.open && retyped.match?.query === 'm', { cleared, retyped: retyped.open });
  }
  {
    const { editor, main } = setup();
    const session: Session = { dismissed: null };
    type(main, '@jo');
    editor.update({ history: 'skip' }, (tx) => tx.text.insert('XYZ ', { at: { path: [0, 0], offset: 0 } }));
    const remote = readSuggestion(main, session, options);
    check('remote insert before the trigger keeps the query and shifts its range', remote.open && remote.match?.query === 'jo' && remote.match.start.offset === 7, remote.match);
    dismiss(main, session, remote.match!);
    editor.update({ history: 'skip' }, (tx) => tx.text.insert('more ', { at: { path: [0, 0], offset: 0 } }));
    const stillDismissed = readSuggestion(main, session, options);
    check('a dismissal survives a later remote insert', !stillDismissed.open && stillDismissed.match?.query === 'jo', stillDismissed);
  }
  {
    const { editor, main } = setup();
    type(main, '@jo');
    const before = docText(editor);
    const ok = completeCurrent(main, 'jo', 'Joan');
    const completed = docText(editor);
    main.api.history.undo();
    const undone = docText(editor);
    const caret = main.read.selection();
    main.api.history.redo();
    check('completion is one step: undo restores the typed query, redo the mention', ok && completed.includes('mention') && undone === before && docText(editor) === completed, { completed, undone, caret });
  }
  {
    const { editor, main } = setup();
    type(main, '@jo');
    const before = docText(editor);
    let threw = false;
    try {
      complete(main, readMatch(main, options)!, (tx) => {
        tx.nodes.insert({ type: 'mention', value: 'Joan', children: [{ text: '' }] } as Element);
        throw new Error('feature callback failed');
      });
    } catch {
      threw = true;
    }
    check('a failing completion callback rolls back the deletion too', threw && docText(editor) === before, docText(editor));
  }
  {
    const { editor, main } = setup();
    type(main, '@jo');
    editor.update({ history: 'skip' }, (tx) => tx.text.insert('a', { at: { path: [0, 0], offset: 5 } }));
    const before = docText(editor);
    const ok = completeCurrent(main, 'jo', 'Joan');
    check('a stale completion (remote changed the query) is refused without edits', !ok && docText(editor) === before, { ok, query: readMatch(main, options)?.query });
  }
  {
    const { editor, main, header } = setup();
    type(main, '@jo');
    header.update((tx) => tx.selection.set({ path: [0, 0], offset: 5 }));
    check('moving to another root view ends the match and leaves literal text', readMatch(main, options) === null && readMatch(header, options) === null && docText(editor).includes('Hi @jo'), { main: readMatch(main, options), header: readMatch(header, options) });
  }
};

if (process.argv.includes('--tui')) {
  const { editor, main } = setup();
  const session: Session = { dismissed: null };
  const log: string[] = [];
  const render = () => {
    const s = readSuggestion(main, session, options);
    console.clear();
    console.log(`\x1b[1mdocument\x1b[0m ${docText(editor)}`);
    console.log(`\x1b[1mselection\x1b[0m ${JSON.stringify(main.read.selection())}`);
    console.log(`\x1b[1mmatch\x1b[0m ${JSON.stringify(s.match)}`);
    console.log(`\x1b[1mopen\x1b[0m ${s.open}  \x1b[1mdismissed\x1b[0m ${JSON.stringify(session.dismissed?.resolve() ?? null)}`);
    console.log(`\x1b[1moptions\x1b[0m ${s.open ? options$(s.match!.query).join(', ') : '\x1b[2m(closed)\x1b[0m'}`);
    console.log(`\x1b[2m${log.slice(-3).join('\n')}\x1b[0m`);
    console.log('\n\x1b[1mtype\x1b[0m any char  \x1b[1m[enter]\x1b[0m complete first  \x1b[1m[esc]\x1b[0m dismiss  \x1b[1m[backspace]\x1b[0m delete  \x1b[1m[ctrl-r]\x1b[0m remote insert at start  \x1b[1m[ctrl-z/ctrl-y]\x1b[0m undo/redo  \x1b[1m[ctrl-c]\x1b[0m quit');
  };
  process.stdin.setRawMode(true);
  process.stdin.on('data', (data) => {
    const key = data.toString();
    const s = readSuggestion(main, session, options);
    if (key === '\u0003') process.exit(0);
    else if (key === '\r') {
      const first = s.open ? options$(s.match!.query)[0] : undefined;
      if (first) log.push(`complete ${first}: ${completeCurrent(main, s.match!.query, first)}`);
      else main.update.text.insert(' ');
    } else if (key === '\u001b') { if (s.match) dismiss(main, session, s.match); }
    else if (key === '\u007f') main.update.text.delete({ distance: 1, reverse: true });
    else if (key === '\u0012') { editor.update({ history: 'skip' }, (tx) => tx.text.insert('R ', { at: { path: [0, 0], offset: 0 } })); log.push('remote insert "R " at start'); }
    else if (key === '\u001a') main.api.history.undo();
    else if (key === '\u0019') main.api.history.redo();
    else if (key.length === 1 && key >= ' ') main.update.text.insert(key);
    render();
  });
  render();
} else {
  scenarios();
  for (const [name, ok, detail] of results) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `\n     ${detail}`}`);
  console.log(`${results.filter(([, ok]) => ok).length}/${results.length} pass`);
}
