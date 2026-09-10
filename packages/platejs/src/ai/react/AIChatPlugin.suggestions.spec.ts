import { BaseParagraphPlugin, type Value } from '../../core';
import { MarkdownPlugin } from '../../markdown';
import { createEditor } from '../../react/core';
import { AIChatPlugin } from './AIChatPlugin';

const p = (text: string) => ({ type: 'paragraph', children: [{ text }] });
const setup = (value: Value = [p('old'), p('middle'), p('tail')]) => {
  const editor = createEditor({
    plugins: [BaseParagraphPlugin, MarkdownPlugin, AIChatPlugin],
    initialValue: value,
  });
  editor.update.selection.setNodes([[0]]);
  return { editor, ai: editor.plugin(AIChatPlugin) };
};

describe('AI suggestion lifecycle', () => {
  for (const count of [1, 2, 5]) {
    it(`accepts ${count} generated blocks in one batch without transient document state`, () => {
      const { editor, ai } = setup();
      const before = editor.read.value();
      const selection = editor.read.selection();
      const history = editor.read.history.undos().length;
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => {
        commits += 1;
      });
      const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
      let source = '';
      for (let index = 0; index < count; index += 1) {
        source += `${index ? '\n\n' : ''}new-${index}`;
        ai.api.receive(id, source);
      }
      expect(commits).toBe(0);
      expect(editor.read.children()).toBe(before.children);
      expect(editor.read.history.undos().length).toBe(history);
      expect(ai.store.get('operation')?.preview.length).toBeGreaterThan(0);
      ai.api.finish(id);
      expect(ai.api.accept()).toBe(true);
      expect(ai.api.accept()).toBe(false);
      expect(commits).toBe(1);
      expect(editor.read.children()).toEqual([
        ...Array.from({ length: count }, (_, index) => p(`new-${index}`)),
        p('middle'),
        p('tail'),
      ]);
      const accepted = editor.read.value();
      const acceptedSelection = editor.read.selection();
      expect(editor.read.history.undos().length).toBe(history + 1);
      editor.update.history.undo();
      expect(editor.read.value()).toEqual(before);
      expect(editor.read.selection()).toEqual(selection);
      editor.update.history.redo();
      expect(editor.read.value()).toEqual(accepted);
      expect(editor.read.selection()).toEqual(acceptedSelection);
      unsubscribe();
    });
  }
  it('keeps unselected content between discrete members', () => {
    const { editor, ai } = setup();
    editor.update.selection.setNodes([[0], [2]]);
    const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
    ai.api.receive(id, 'first\n\nlast');
    editor.update.text.insert('!', { at: { path: [1, 0], offset: 6 } });
    ai.api.finish(id);
    expect(ai.api.accept()).toBe(true);
    expect(editor.read.children()).toEqual([
      p('first'),
      p('middle!'),
      p('last'),
    ]);
  });
  for (const mutation of ['delete', 'identical replacement', 'edit']) {
    it(`rejects a target after ${mutation}`, () => {
      const { editor, ai } = setup();
      const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
      ai.api.receive(id, 'new');
      if (mutation === 'edit') {
        editor.update.text.insert('user', { at: { path: [0, 0], offset: 0 } });
      } else {
        editor.update((tx) => {
          tx.nodes.remove({ at: [0] });
          if (mutation === 'identical replacement') {
            tx.nodes.insert(p('old'), { at: [0] });
          }
        });
      }
      const before = editor.read.value();
      ai.api.receive(id, 'late');
      ai.api.finish(id);
      expect(ai.api.accept()).toBe(false);
      expect(ai.store.get('operation')?.status).toBe('error');
      expect(editor.read.value()).toEqual(before);
    });
  }
  it('maps targets when the user inserts before them', () => {
    const { editor, ai } = setup();
    const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
    ai.api.receive(id, 'new');
    editor.update.nodes.insert(p('user'), { at: [0] });
    ai.api.finish(id);
    expect(ai.api.accept()).toBe(true);
    expect(editor.read.children()).toEqual([
      p('user'),
      p('new'),
      p('middle'),
      p('tail'),
    ]);
  });
  it('inserts below the original targets and leaves those targets unchanged', () => {
    const { editor, ai } = setup();
    const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
    ai.api.receive(id, 'new\n\nmore');
    ai.api.finish(id);
    expect(ai.api.accept({ placement: 'below' })).toBe(true);
    expect(editor.read.children()).toEqual([
      p('old'),
      p('new'),
      p('more'),
      p('middle'),
      p('tail'),
    ]);
  });
  it('replaces only an expanded text selection', () => {
    const { editor, ai } = setup([p('prefix old suffix')]);
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 10 },
    });
    const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
    ai.api.receive(id, 'new');
    ai.api.finish(id);
    expect(ai.api.accept()).toBe(true);
    expect(editor.read.text.string([])).toBe('prefix new suffix');
  });
  it('discards without changing redo and ignores late terminal data', () => {
    const { editor, ai } = setup();
    editor.update.text.insert('user', { at: { path: [1, 0], offset: 0 } });
    editor.update.history.undo();
    const before = editor.read.value();
    const redo = editor.read.history.redos();
    const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
    ai.api.receive(id, 'draft');
    ai.api.discard();
    ai.api.receive(id, 'late');
    ai.api.finish(id);
    expect(ai.store.get('operation')).toBeNull();
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.history.redos()).toEqual(redo);
  });
  it('keeps partial output on Stop and rejects subsequent events', () => {
    const { editor, ai } = setup();
    const id = ai.api.start({ mode: 'chat', toolName: 'edit' });
    ai.api.receive(id, 'partial');
    ai.api.stop();
    ai.api.receive(id, 'late');
    expect(ai.store.get('operation')).toMatchObject({
      source: 'partial',
      status: 'ready',
      partial: true,
    });
    expect(ai.api.accept()).toBe(true);
    expect(editor.read.children()[0]).toEqual(p('partial'));
  });
});
